import * as Sentry from "@sentry/react";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "../lib/supabase";

export interface CookieItem {
  name: string;
  description: string;
  domain: string;
  expiration?: string;
}
export interface CookieProvider {
  name: string;
  cookies: CookieItem[];
}
export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  providers: CookieProvider[];
}

export interface ScannedData {
  url: string;
  date: string;
  pages: number;
  cookiesCount: number;
  categories: CookieCategory[];
}

export interface BannerConfig {
  theme: string;
  styleMode: "stretch" | "banner" | "modal" | "tooltip";
  position: "top" | "bottom";
  size: "standard" | "compact";
  isConfigured?: boolean;
  ccpaMode?: boolean;
}

interface CookieContextType {
  scannedData: ScannedData | null;
  setScannedData: (data: ScannedData | null) => void;
  bannerConfig: BannerConfig;
  setBannerConfig: React.Dispatch<React.SetStateAction<BannerConfig>>;
  isPreviewVisible: boolean;
  setIsPreviewVisible: (v: boolean) => void;
  userId: string | null;
  isAuthLoading: boolean;
}

const CookieContext = createContext<CookieContextType | undefined>(undefined);

export const CookieContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [scannedData, setScannedData] = useState<ScannedData | null>(null);
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>({
    theme: "#3b82f6", // Default blue equivalent
    styleMode: "banner",
    position: "bottom",
    size: "standard",
    isConfigured: false,
  });
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Listen for auth changes and set user ID
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const id = session?.user?.id || null;
      setUserId(id);
      setIsAuthLoading(false);
      if (id) {
        Sentry.setUser({ id });
      } else {
        Sentry.setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch initial data when user logs in
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) {
        setScannedData(null);
        setBannerConfig({
          theme: "#3b82f6", // Default blue equivalent
          styleMode: "banner",
          position: "bottom",
          size: "standard",
        });
        setIsLoaded(true);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("user_cookie_settings")
          .select("scanned_data, banner_config")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "PostgREST Row Not Found" - this is expected for new users
          console.error("Error fetching cookie settings", error);
        }

        if (data) {
          if (data.scanned_data) setScannedData(data.scanned_data);
          if (data.banner_config) setBannerConfig(data.banner_config);
        }
      } catch (err) {
        console.error("Failed to fetch cookie settings", err);
      } finally {
        setIsLoaded(true);
      }
    };

    setIsLoaded(false); // Reset loaded state when user changes
    fetchData();
  }, [userId]);

  // 3. Auto-save changes, debounced
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!isLoaded || !userId || scannedData === null) return;

    const timeoutId = setTimeout(async () => {
      try {
        console.log("Auto-saving cookie settings for user:", userId);
        const { error } = await supabase.from("user_cookie_settings").upsert(
          {
            user_id: userId,
            scanned_data: scannedData,
            banner_config: bannerConfig,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );

        if (error) {
          console.error("Error saving cookie settings:", error);
          console.error("Error code:", error.code);
          console.error("Error details:", error.details);
        } else {
          console.log("Cookie settings saved successfully");
        }
      } catch (err) {
        console.error("Failed to save cookie settings", err);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [scannedData, bannerConfig, isLoaded, userId]);

  return (
    <CookieContext.Provider
      value={{
        scannedData,
        setScannedData,
        bannerConfig,
        isAuthLoading,
        setBannerConfig,
        isPreviewVisible,
        setIsPreviewVisible,
        userId,
      }}
    >
      {children}
    </CookieContext.Provider>
  );
};

export const useCookieConfig = () => {
  const context = useContext(CookieContext);
  if (!context)
    throw new Error(
      "useCookieConfig must be used within CookieContextProvider",
    );
  return context;
};
