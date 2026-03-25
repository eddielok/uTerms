(function () {
  const CONSENT_COOKIE_NAME = "uterms_consent";

  // Read existing consent
  function getConsent() {
    if (window.location.search.includes("reset=1")) {
      document.cookie =
        CONSENT_COOKIE_NAME +
        "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      return null;
    }
    const match = document.cookie.match(
      new RegExp("(^| )" + CONSENT_COOKIE_NAME + "=([^;]+)"),
    );
    if (match) {
      try {
        return JSON.parse(decodeURIComponent(match[2]));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  // Find user ID for fetching config
  let userId = new URLSearchParams(window.location.search).get("id");
  if (!userId) {
    try {
      const scripts = document.getElementsByTagName("script");
      for (let script of scripts) {
        if (script.src && script.src.includes("uterms-embed.js")) {
          userId = new URL(script.src).searchParams.get("id");
          break;
        }
      }
    } catch (e) {}
  }

  function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  function getVisitorId() {
    try {
      let vid = localStorage.getItem("uterms_vid");
      // Force regeneration if the existing vid is not an RFC standard 36-char UUID.
      if (!vid || vid.length !== 36) {
        vid =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : generateUUID();
        localStorage.setItem("uterms_vid", vid);
      }
      return vid;
    } catch (e) {
      return "00000000-0000-0000-0000-000000000000";
    }
  }

  async function init() {
    let rawConfig = null;
    let bannerConfig = {
      theme: "#000000",
      styleMode: "banner",
      position: "bottom",
      size: "standard",
    };
    let categories = [
      {
        id: "essential",
        name: "Essential Cookies",
        description:
          "Required for the website to function normally. Cannot be disabled.",
      },
      {
        id: "functional",
        name: "Functional",
        description:
          "Enables the website to provide enhanced functionality and personalization.",
      },
      {
        id: "analytics",
        name: "Analytics",
        description:
          "Helps us understand how visitors interact with the website.",
      },
      {
        id: "marketing",
        name: "Marketing",
        description: "Used to deliver personalized advertisements.",
      },
      {
        id: "social",
        name: "Social",
        description: "Enables integration with social media platforms.",
      },
      {
        id: "unclassified",
        name: "Unclassified",
        description: "Cookies that we are in the process of classifying.",
      },
    ];

    if (userId && userId !== "YOUR_USER_ID") {
      try {
        const response = await fetch(
          "http://localhost:3001/api/banner/" + userId,
        );
        if (response.ok) {
          rawConfig = await response.json();
          if (rawConfig.banner_config) {
            bannerConfig = rawConfig.banner_config;
          }
          if (
            rawConfig.scanned_data &&
            rawConfig.scanned_data.categories &&
            rawConfig.scanned_data.categories.length > 0
          ) {
            categories = rawConfig.scanned_data.categories;
          }
        }
      } catch (err) {
        console.error("Failed to parse uterms cookie settings:", err);
      }
    }

    // Determine initial consent state defaults
    let defaultConsentObj = {};
    for (const cat of categories) {
      defaultConsentObj[cat.id] = cat.id === "essential";
    }

    function saveConsent(consent) {
      document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; path=/; max-age=31536000; SameSite=Lax`;

      if (userId && userId !== "YOUR_USER_ID") {
        fetch("http://localhost:3001/api/consent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            visitor_id: getVisitorId(),
            consent_data: consent,
            url: window.location.href,
          }),
        }).catch((err) => console.warn("uTerms Consent tracking error:", err));
      }

      hideBanner();
      hideModal();
    }

    let positioningCss = ``;

    // Default style
    const defaultStyles = `
      position: fixed;
      background: #ffffff;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      z-index: 2147483647;
      font-family: system-ui, -apple-system, sans-serif;
      box-sizing: border-box;
      border: 1px solid #e5e7eb;
      transition: all 0.3s ease-in-out;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    `;

    // Calculate position based on styleMode and position
    if (bannerConfig.styleMode === "stretch") {
      // Full width bar
      positioningCss = `
        ${defaultStyles}
        left: 0;
        right: 0;
        ${bannerConfig.position === "top" ? "top: 0; border-bottom-width: 1px;" : "bottom: 0; border-top-width: 1px;"}
        max-width: 100%;
        border-radius: 0;
        border-left: none;
        border-right: none;
      `;
    } else if (bannerConfig.styleMode === "banner") {
      // Floating banner (centered)
      positioningCss = `
        ${defaultStyles}
        left: 50%;
        transform: translateX(-50%);
        width: calc(100% - 2rem);
        max-width: 800px;
        ${bannerConfig.position === "top" ? "top: 1rem;" : "bottom: 1rem;"}
        border-radius: 0.75rem;
      `;
    } else if (bannerConfig.styleMode === "tooltip") {
      // Small tooltip/floating widget
      positioningCss = `
        ${defaultStyles}
        width: 320px;
        max-width: calc(100% - 2rem);
        ${bannerConfig.position === "top" ? "top: 1rem;" : "bottom: 1rem;"}
        left: 1rem;
        border-radius: 0.75rem;
      `;
    } else if (bannerConfig.styleMode === "modal") {
      // Center modal
      positioningCss = `
        ${defaultStyles}
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 90%;
        max-width: 500px;
        border-radius: 0.75rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      `;
    } else {
      // Fallback
      positioningCss = `
        ${defaultStyles}
        bottom: 0;
        left: 0;
        right: 0;
      `;
    }

    const paddingCss = bannerConfig.size === "compact" ? `1rem` : `1.5rem`;
    const gapCss = bannerConfig.size === "compact" ? `0.75rem` : `1rem`;
    const btnPadding =
      bannerConfig.size === "compact" ? `0.375rem 0.75rem` : `0.5rem 1rem`;
    const btnFontSize =
      bannerConfig.size === "compact" ? `0.875rem` : `0.875rem`;

    // Calculate colors
    const primaryBg = bannerConfig.theme;

    // Determine text color based on background luminance for accessibility
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const getContrastColor = (hexColor) => {
      const rgb = hexToRgb(hexColor);
      if (!rgb) return "#ffffff";
      // Calculate luminance
      const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
      return yiq >= 128 ? "#000000" : "#ffffff";
    };

    const primaryColor = getContrastColor(bannerConfig.theme);
    const primaryBorder = bannerConfig.theme;

    const style = document.createElement("style");
    style.innerHTML = `
      #uterms-banner {
        ${positioningCss}
        padding: ${paddingCss};
        gap: ${gapCss};
        opacity: 0;
        animation: utermsFadeIn 0.3s ease-out forwards;
      }
      
      @keyframes utermsFadeIn {
        from { opacity: 0; transform: ${bannerConfig.styleMode === "modal" ? "translate(-50%, -40%)" : bannerConfig.position === "top" ? "translateY(-10px)" : "translateY(10px)"} ${bannerConfig.styleMode === "banner" ? "translateX(-50%)" : ""}; }
        to { opacity: 1; transform: ${bannerConfig.styleMode === "modal" ? "translate(-50%, -50%)" : "translateY(0)"} ${bannerConfig.styleMode === "banner" ? "translateX(-50%)" : ""}; }
      }
      
      #uterms-banner .uterms-banner-content { 
        display: flex; 
        flex-direction: column; 
        gap: 0.5rem; 
      }
      
      #uterms-banner h3 { 
        margin: 0; 
        color: #111827; 
        font-size: 1.125rem; 
        font-weight: 600; 
        line-height: 1.4; 
      }
      
      #uterms-banner p { 
        margin: 0; 
        color: #4b5563; 
        font-size: 0.875rem; 
        line-height: 1.5; 
      }
      
      #uterms-banner .uterms-banner-actions { 
        display: flex; 
        flex-wrap: wrap; 
        gap: 0.75rem; 
        align-items: center; 
        justify-content: flex-end; 
        margin-top: 0.25rem;
      }
      
      #uterms-banner button, .uterms-modal-footer button {
        padding: ${btnPadding};
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        background: #ffffff;
        cursor: pointer;
        font-size: ${btnFontSize};
        font-weight: 500;
        transition: all 0.2s;
        color: #374151;
        line-height: 1.25rem;
      }
      
      #uterms-banner button:hover, .uterms-modal-footer button:hover { 
        background-color: #f9fafb; 
        border-color: #9ca3af;
      }
      
      #uterms-banner button.uterms-primary, .uterms-modal-footer button.uterms-primary {
        background-color: ${primaryBg};
        color: ${primaryColor};
        border-color: ${primaryBorder};
      }
      
      #uterms-banner button.uterms-primary:hover, .uterms-modal-footer button.uterms-primary:hover { 
        opacity: 0.9;
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }
      
      #uterms-banner button.uterms-btn-text {
        border: none; 
        background: transparent; 
        padding: 0; 
        color: #6b7280; 
        text-decoration: underline; 
        text-underline-offset: 2px;
        font-size: 0.75rem;
        margin-right: auto;
      }
      
      #uterms-banner button.uterms-btn-text:hover { 
        color: #111827; 
        background: transparent; 
      }
      
      #uterms-modal-overlay {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(2px);
        z-index: 2147483646;
        display: none;
        opacity: 0;
        transition: opacity 0.2s ease-in-out;
      }
      
      #uterms-modal-overlay.open {
        display: block;
        opacity: 1;
      }
      #uterms-modal {
        position: fixed;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2rem;
        border-radius: 12px;
        width: 90%;
        max-width: 550px;
        max-height: 90vh;
        overflow-y: auto;
        z-index: 2147483647;
        display: none;
        font-family: system-ui, -apple-system, sans-serif;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      }
      #uterms-modal h2 { margin-top: 0; font-size: 20px; color: #111; font-weight: 600; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
      .uterms-preference-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1.25rem;
        padding-bottom: 1.25rem;
        border-bottom: 1px solid #f3f4f6;
      }
      .uterms-preference-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
      .uterms-preference-info h3 { margin: 0 0 0.35rem 0; font-size: 15px; color: #1f2937; font-weight: 600; }
      .uterms-preference-info p { margin: 0; font-size: 13px; color: #6b7280; width: 90%; line-height: 1.5; }
      .uterms-modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #e5e7eb;
      }
      .uterms-modal-footer button {
        padding: 0.5rem 1rem;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: #fff;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        color: #374151;
      }
      .uterms-modal-footer button:hover { background: #f3f4f6; }
      .uterms-modal-footer button.uterms-primary {
        background: ${primaryBg};
        color: ${primaryColor};
        border-color: ${primaryBorder};
      }
      .uterms-modal-footer button.uterms-primary:hover { opacity: 0.9; }
      
      @media (max-width: 650px) {
        .uterms-banner-actions { flex-direction: column; align-items: stretch; gap: 0.75rem; }
        .uterms-action-buttons { flex-direction: column; width: 100%; gap: 0.5rem; }
        .uterms-action-buttons button { width: 100%; }
        #uterms-banner button.uterms-btn-text { text-align: center; width: 100%; justify-content: center; }
      }
    `;
    document.head.appendChild(style);

    // Create Banner
    const banner = document.createElement("div");
    banner.id = "uterms-banner";
    banner.style.display = "none";
    banner.innerHTML = `
      <div class="uterms-banner-content">
        <h3>We value your privacy</h3>
        <p>We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.</p>
      </div>
      <div class="uterms-banner-actions">
        <button id="uterms-btn-customize" class="uterms-btn-text">Customize Preferences</button>
        <div class="uterms-action-buttons">
          <button id="uterms-btn-reject">Reject All</button>
          <button id="uterms-btn-accept" class="uterms-primary">Accept All</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    // Create Modal
    const overlay = document.createElement("div");
    overlay.id = "uterms-modal-overlay";
    document.body.appendChild(overlay);

    let rowsHtml = "";
    for (const cat of categories) {
      if (cat.id === "essential") {
        rowsHtml += `
          <div class="uterms-preference-row">
            <div class="uterms-preference-info">
              <h3>${cat.name}</h3>
              <p>${cat.description}</p>
            </div>
            <div>
              <input type="checkbox" id="uterms-toggle-${cat.id}" checked disabled />
            </div>
          </div>
        `;
      } else {
        rowsHtml += `
          <div class="uterms-preference-row">
            <div class="uterms-preference-info">
              <h3>${cat.name}</h3>
              <p>${cat.description}</p>
            </div>
            <div>
              <input type="checkbox" id="uterms-toggle-${cat.id}" />
            </div>
          </div>
        `;
      }
    }

    const modal = document.createElement("div");
    modal.id = "uterms-modal";
    modal.innerHTML = `
      <h2>Consent Preferences</h2>
      ${rowsHtml}
      <div class="uterms-modal-footer">
        <button id="uterms-btn-save">Save Preferences</button>
        <button id="uterms-btn-accept-all-modal" class="uterms-primary">Accept All</button>
      </div>
    `;
    document.body.appendChild(modal);

    function showBanner() {
      banner.style.display = "flex";
    }
    function hideBanner() {
      banner.style.display = "none";
    }
    function showModal() {
      overlay.style.display = "block";
      modal.style.display = "block";
      let consent = getConsent();
      if (!consent) {
        consent = {};
        for (const cat of categories) consent[cat.id] = false;
        consent.essential = true;
      }

      for (const cat of categories) {
        if (cat.id !== "essential") {
          const el = document.getElementById("uterms-toggle-" + cat.id);
          if (el) el.checked = !!consent[cat.id];
        }
      }
    }
    function hideModal() {
      overlay.style.display = "none";
      modal.style.display = "none";
    }

    // Event Listeners for Banner
    document
      .getElementById("uterms-btn-accept")
      .addEventListener("click", () => {
        let fullConsent = {};
        for (const cat of categories) fullConsent[cat.id] = true;
        saveConsent(fullConsent);
      });
    document
      .getElementById("uterms-btn-reject")
      .addEventListener("click", () => {
        let minConsent = {};
        for (const cat of categories) minConsent[cat.id] = false;
        minConsent.essential = true;
        saveConsent(minConsent);
      });
    document
      .getElementById("uterms-btn-customize")
      .addEventListener("click", () => {
        hideBanner();
        showModal();
      });

    // Event Listeners for Modal
    document
      .getElementById("uterms-btn-accept-all-modal")
      .addEventListener("click", () => {
        let fullConsent = {};
        for (const cat of categories) fullConsent[cat.id] = true;
        saveConsent(fullConsent);
      });
    document.getElementById("uterms-btn-save").addEventListener("click", () => {
      let savedConsent = { essential: true };
      for (const cat of categories) {
        if (cat.id !== "essential") {
          const el = document.getElementById("uterms-toggle-" + cat.id);
          savedConsent[cat.id] = el ? el.checked : false;
        }
      }
      saveConsent(savedConsent);
    });
    overlay.addEventListener("click", hideModal);

    // Initialize
    if (!getConsent()) {
      showBanner();
    }

    document.addEventListener("click", (e) => {
      if (
        e.target &&
        e.target.classList &&
        e.target.classList.contains("uterms-preferences")
      ) {
        e.preventDefault();
        hideBanner();
        showModal();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
