import { Navigate, Outlet } from "react-router-dom";
import { useCookieConfig } from "../context/CookieContext";

export const PublicOnlyRoute = () => {
  const { userId, isAuthLoading } = useCookieConfig();

  if (isAuthLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (userId) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
