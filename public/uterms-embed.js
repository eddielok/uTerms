(function () {
  const CONSENT_COOKIE_NAME = "uterms_consent";
  const MANAGE_BTN_KEY = "uterms_manage_visible";

  // GCM v2 helper — safely calls gtag or pushes to dataLayer
  function gtagConsent(type, params) {
    if (typeof window.gtag === "function") {
      window.gtag("consent", type, params);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(["consent", type, params]);
    }
  }

  // Set GCM v2 defaults to denied immediately when script loads,
  // before any GTM tag has a chance to fire.
  gtagConsent("default", {
    ad_storage: "denied",
    analytics_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    functionality_storage: "denied",
    security_storage: "granted",
    wait_for_update: 500,
  });

  // ── Translations ─────────────────────────────────────────────────────────────
  const TRANSLATIONS = {
    en: {
      piplTitle: 'Personal Data Notice (PIPL)',
      piplController: 'Data Controller',
      piplContact: 'Contact',
      piplRetention: 'Retention',
      piplRetentionUnit: 'days',
      piplCrossBorder: 'Data may be transferred outside China for processing.',
      title: 'We value your privacy',
      description: 'We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.',
      customize: 'Customize Preferences',
      rejectAll: 'Reject All',
      acceptAll: 'Accept All',
      modalTitle: 'Consent Preferences',
      savePreferences: 'Save Preferences',
      alwaysActive: 'Always Active',
      managePreferences: 'Manage Preferences',
      doNotSell: 'Do Not Sell My Personal Information',
      doNotSellSaved: 'Preference saved.',
      learnMore: 'Learn more',
      categories: {
        essential:     { name: 'Essential Cookies',  description: 'Required for the website to function normally. Cannot be disabled.' },
        functional:    { name: 'Functional',          description: 'Enables the website to provide enhanced functionality and personalization.' },
        analytics:     { name: 'Analytics',           description: 'Helps us understand how visitors interact with the website.' },
        marketing:     { name: 'Marketing',           description: 'Used to deliver personalized advertisements.' },
        social:        { name: 'Social',              description: 'Enables integration with social media platforms.' },
        unclassified:  { name: 'Unclassified',        description: 'Cookies that we are in the process of classifying.' },
      },
    },
    'zh-CN': {
      piplTitle: '个人信息处理告知',
      piplController: '数据控制者',
      piplContact: '联系方式',
      piplRetention: '保留期限',
      piplRetentionUnit: '天',
      piplCrossBorder: '您的数据可能被传输至中国境外的服务器处理。',
      title: '我们重视您的隐私',
      description: '我们使用 Cookie 提升您的浏览体验、提供个性化内容或广告，并分析我们的网站流量。点击"全部接受"即表示您同意我们使用 Cookie。',
      customize: '自定义偏好设置',
      rejectAll: '全部拒绝',
      acceptAll: '全部接受',
      modalTitle: '同意偏好设置',
      savePreferences: '保存设置',
      alwaysActive: '始终启用',
      managePreferences: '管理偏好设置',
      doNotSell: '请勿出售我的个人信息',
      doNotSellSaved: '偏好已保存。',
      categories: {
        essential:     { name: '必要 Cookie',    description: '网站正常运行所必需，无法禁用。' },
        functional:    { name: '功能性 Cookie',  description: '使网站能够提供增强的功能和个性化体验。' },
        analytics:     { name: '分析 Cookie',    description: '帮助我们了解访问者与网站的互动方式。' },
        marketing:     { name: '营销 Cookie',    description: '用于投放个性化广告。' },
        social:        { name: '社交 Cookie',    description: '实现与社交媒体平台的集成。' },
        unclassified:  { name: '未分类 Cookie',  description: '我们正在对这些 Cookie 进行分类。' },
      },
    },
    'zh-TW': {
      piplTitle: '個人資訊處理告知',
      piplController: '數據控制者',
      piplContact: '聯絡方式',
      piplRetention: '保留期限',
      piplRetentionUnit: '天',
      piplCrossBorder: '您的資料可能被傳輸至中國境外的伺服器處理。',
      title: '我們重視您的隱私',
      description: '我們使用 Cookie 提升您的瀏覽體驗、提供個人化內容或廣告，並分析我們的網站流量。點擊「全部接受」即表示您同意我們使用 Cookie。',
      customize: '自訂偏好設定',
      rejectAll: '全部拒絕',
      acceptAll: '全部接受',
      modalTitle: '同意偏好設定',
      savePreferences: '儲存設定',
      alwaysActive: '始終啟用',
      managePreferences: '管理偏好設定',
      doNotSell: '請勿出售我的個人資訊',
      doNotSellSaved: '偏好已儲存。',
      categories: {
        essential:     { name: '必要 Cookie',    description: '網站正常運作所必需，無法停用。' },
        functional:    { name: '功能性 Cookie',  description: '使網站能夠提供增強的功能和個人化體驗。' },
        analytics:     { name: '分析 Cookie',    description: '幫助我們了解訪客與網站的互動方式。' },
        marketing:     { name: '行銷 Cookie',    description: '用於投放個人化廣告。' },
        social:        { name: '社群 Cookie',    description: '實現與社群媒體平台的整合。' },
        unclassified:  { name: '未分類 Cookie',  description: '我們正在對這些 Cookie 進行分類。' },
      },
    },
    fr: {
      piplTitle: 'Avis de traitement des données (PIPL)',
      piplController: 'Responsable du traitement',
      piplContact: 'Contact',
      piplRetention: 'Conservation',
      piplRetentionUnit: 'jours',
      piplCrossBorder: 'Vos données peuvent être transférées hors de Chine pour traitement.',
      title: 'Nous respectons votre vie privée',
      description: 'Nous utilisons des cookies pour améliorer votre expérience de navigation, diffuser des publicités ou du contenu personnalisé et analyser notre trafic. En cliquant sur « Tout accepter », vous consentez à notre utilisation des cookies.',
      customize: 'Personnaliser les préférences',
      rejectAll: 'Tout refuser',
      acceptAll: 'Tout accepter',
      modalTitle: 'Préférences de consentement',
      savePreferences: 'Enregistrer les préférences',
      alwaysActive: 'Toujours actif',
      managePreferences: 'Gérer les préférences',
      doNotSell: 'Ne pas vendre mes informations personnelles',
      doNotSellSaved: 'Préférence enregistrée.',
      categories: {
        essential:     { name: 'Cookies essentiels',       description: 'Nécessaires au bon fonctionnement du site. Ne peuvent pas être désactivés.' },
        functional:    { name: 'Cookies fonctionnels',     description: 'Permettent au site de fournir des fonctionnalités améliorées et une personnalisation.' },
        analytics:     { name: 'Cookies analytiques',     description: 'Nous aident à comprendre comment les visiteurs interagissent avec le site.' },
        marketing:     { name: 'Cookies marketing',       description: 'Utilisés pour diffuser des publicités personnalisées.' },
        social:        { name: 'Cookies sociaux',         description: "Permettent l'intégration avec les plateformes de médias sociaux." },
        unclassified:  { name: 'Cookies non classifiés',  description: 'Cookies en cours de classification.' },
      },
    },
    de: {
      piplTitle: 'Datenschutzhinweis (PIPL)',
      piplController: 'Verantwortlicher',
      piplContact: 'Kontakt',
      piplRetention: 'Speicherdauer',
      piplRetentionUnit: 'Tage',
      piplCrossBorder: 'Ihre Daten können zur Verarbeitung außerhalb Chinas übertragen werden.',
      title: 'Wir respektieren Ihre Privatsphäre',
      description: 'Wir verwenden Cookies, um Ihre Browsing-Erfahrung zu verbessern, personalisierte Werbung oder Inhalte anzuzeigen und unseren Datenverkehr zu analysieren. Durch Klicken auf „Alle akzeptieren" stimmen Sie der Verwendung von Cookies zu.',
      customize: 'Einstellungen anpassen',
      rejectAll: 'Alle ablehnen',
      acceptAll: 'Alle akzeptieren',
      modalTitle: 'Einwilligungseinstellungen',
      savePreferences: 'Einstellungen speichern',
      alwaysActive: 'Immer aktiv',
      managePreferences: 'Einstellungen verwalten',
      doNotSell: 'Meine persönlichen Daten nicht verkaufen',
      doNotSellSaved: 'Einstellung gespeichert.',
      categories: {
        essential:     { name: 'Notwendige Cookies',           description: 'Für den ordnungsgemäßen Betrieb der Website erforderlich. Können nicht deaktiviert werden.' },
        functional:    { name: 'Funktionale Cookies',          description: 'Ermöglichen der Website, erweiterte Funktionen und Personalisierung bereitzustellen.' },
        analytics:     { name: 'Analyse-Cookies',              description: 'Helfen uns zu verstehen, wie Besucher mit der Website interagieren.' },
        marketing:     { name: 'Marketing-Cookies',            description: 'Werden verwendet, um personalisierte Werbung zu schalten.' },
        social:        { name: 'Social-Media-Cookies',         description: 'Ermöglichen die Integration mit sozialen Medien.' },
        unclassified:  { name: 'Nicht klassifizierte Cookies', description: 'Cookies, die wir gerade klassifizieren.' },
      },
    },
    es: {
      piplTitle: 'Aviso de tratamiento de datos (PIPL)',
      piplController: 'Responsable del tratamiento',
      piplContact: 'Contacto',
      piplRetention: 'Retención',
      piplRetentionUnit: 'días',
      piplCrossBorder: 'Sus datos pueden ser transferidos fuera de China para su procesamiento.',
      title: 'Valoramos su privacidad',
      description: 'Utilizamos cookies para mejorar su experiencia de navegación, mostrar anuncios o contenido personalizado y analizar nuestro tráfico. Al hacer clic en "Aceptar todo", usted consiente el uso de cookies.',
      customize: 'Personalizar preferencias',
      rejectAll: 'Rechazar todo',
      acceptAll: 'Aceptar todo',
      modalTitle: 'Preferencias de consentimiento',
      savePreferences: 'Guardar preferencias',
      alwaysActive: 'Siempre activo',
      managePreferences: 'Gestionar preferencias',
      doNotSell: 'No vender mi información personal',
      doNotSellSaved: 'Preferencia guardada.',
      categories: {
        essential:     { name: 'Cookies esenciales',      description: 'Necesarias para el correcto funcionamiento del sitio. No se pueden desactivar.' },
        functional:    { name: 'Cookies funcionales',     description: 'Permiten al sitio web ofrecer funcionalidades mejoradas y personalización.' },
        analytics:     { name: 'Cookies analíticas',      description: 'Nos ayudan a entender cómo los visitantes interactúan con el sitio.' },
        marketing:     { name: 'Cookies de marketing',    description: 'Se utilizan para mostrar anuncios personalizados.' },
        social:        { name: 'Cookies sociales',        description: 'Permiten la integración con plataformas de redes sociales.' },
        unclassified:  { name: 'Cookies no clasificadas', description: 'Cookies que estamos en proceso de clasificar.' },
      },
    },
    'pt-BR': {
      piplTitle: 'Aviso de tratamento de dados (PIPL)',
      piplController: 'Controlador de dados',
      piplContact: 'Contato',
      piplRetention: 'Retenção',
      piplRetentionUnit: 'dias',
      piplCrossBorder: 'Seus dados podem ser transferidos para fora da China para processamento.',
      title: 'Valorizamos sua privacidade',
      description: 'Usamos cookies para melhorar sua experiência de navegação, exibir anúncios ou conteúdo personalizado e analisar nosso tráfego. Ao clicar em "Aceitar tudo", você consente com o uso de cookies.',
      customize: 'Personalizar preferências',
      rejectAll: 'Rejeitar tudo',
      acceptAll: 'Aceitar tudo',
      modalTitle: 'Preferências de consentimento',
      savePreferences: 'Salvar preferências',
      alwaysActive: 'Sempre ativo',
      managePreferences: 'Gerenciar preferências',
      doNotSell: 'Não vender minhas informações pessoais',
      doNotSellSaved: 'Preferência salva.',
      categories: {
        essential:     { name: 'Cookies essenciais',       description: 'Necessários para o funcionamento correto do site. Não podem ser desativados.' },
        functional:    { name: 'Cookies funcionais',       description: 'Permitem que o site forneça funcionalidades aprimoradas e personalização.' },
        analytics:     { name: 'Cookies analíticos',       description: 'Nos ajudam a entender como os visitantes interagem com o site.' },
        marketing:     { name: 'Cookies de marketing',     description: 'Usados para exibir anúncios personalizados.' },
        social:        { name: 'Cookies sociais',          description: 'Permitem a integração com plataformas de redes sociais.' },
        unclassified:  { name: 'Cookies não classificados', description: 'Cookies que estamos em processo de classificação.' },
      },
    },
    ja: {
      piplTitle: '個人情報処理に関する通知（PIPL）',
      piplController: 'データ管理者',
      piplContact: '連絡先',
      piplRetention: '保持期間',
      piplRetentionUnit: '日',
      piplCrossBorder: 'お客様のデータは中国国外のサーバーに転送されて処理される場合があります。',
      title: 'プライバシーを大切にしています',
      description: '当サイトでは、閲覧体験の向上、パーソナライズされた広告・コンテンツの配信、アクセス解析のためにCookieを使用しています。「すべて同意する」をクリックすると、Cookieの使用に同意したことになります。',
      customize: '設定をカスタマイズ',
      rejectAll: 'すべて拒否',
      acceptAll: 'すべて同意する',
      modalTitle: '同意設定',
      savePreferences: '設定を保存',
      alwaysActive: '常に有効',
      managePreferences: '設定を管理',
      doNotSell: '個人情報を売らないでください',
      doNotSellSaved: '設定が保存されました。',
      categories: {
        essential:     { name: '必須Cookie',        description: 'ウェブサイトの正常な動作に必要です。無効にすることはできません。' },
        functional:    { name: '機能性Cookie',      description: 'ウェブサイトが高度な機能やパーソナライゼーションを提供できるようにします。' },
        analytics:     { name: '分析Cookie',        description: '訪問者がウェブサイトとどのように関わっているかを理解するのに役立ちます。' },
        marketing:     { name: 'マーケティングCookie', description: 'パーソナライズされた広告を配信するために使用されます。' },
        social:        { name: 'ソーシャルCookie',  description: 'ソーシャルメディアプラットフォームとの統合を可能にします。' },
        unclassified:  { name: '未分類Cookie',      description: '現在分類中のCookieです。' },
      },
    },
    ms: {
      piplTitle: 'Notis Pemprosesan Data Peribadi (PIPL)',
      piplController: 'Pengawal Data',
      piplContact: 'Hubungi',
      piplRetention: 'Pengekalan',
      piplRetentionUnit: 'hari',
      piplCrossBorder: 'Data anda mungkin dipindahkan ke luar China untuk diproses.',
      title: 'Kami menghargai privasi anda',
      description: 'Kami menggunakan kuki untuk meningkatkan pengalaman melayari anda, menyajikan iklan atau kandungan yang diperibadikan, dan menganalisis trafik kami. Dengan mengklik "Terima Semua", anda bersetuju dengan penggunaan kuki kami.',
      customize: 'Sesuaikan Keutamaan',
      rejectAll: 'Tolak Semua',
      acceptAll: 'Terima Semua',
      modalTitle: 'Keutamaan Persetujuan',
      savePreferences: 'Simpan Keutamaan',
      alwaysActive: 'Sentiasa Aktif',
      managePreferences: 'Urus Keutamaan',
      doNotSell: 'Jangan Jual Maklumat Peribadi Saya',
      doNotSellSaved: 'Keutamaan disimpan.',
      categories: {
        essential:     { name: 'Kuki Penting',              description: 'Diperlukan untuk laman web berfungsi dengan normal. Tidak boleh dinyahdayakan.' },
        functional:    { name: 'Kuki Fungsional',           description: 'Membolehkan laman web menyediakan fungsi yang dipertingkatkan dan pemperibadian.' },
        analytics:     { name: 'Kuki Analitik',             description: 'Membantu kami memahami cara pelawat berinteraksi dengan laman web.' },
        marketing:     { name: 'Kuki Pemasaran',            description: 'Digunakan untuk menyampaikan iklan yang diperibadikan.' },
        social:        { name: 'Kuki Sosial',               description: 'Membolehkan integrasi dengan platform media sosial.' },
        unclassified:  { name: 'Kuki Tidak Diklasifikasikan', description: 'Kuki yang sedang dalam proses pengklasifikasian.' },
      },
    },
  };

  function detectLanguage(paramLang, ipLang) {
    // 1. Explicit lang= param on script src overrides everything
    if (paramLang && TRANSLATIONS[paramLang]) return paramLang;
    // 2. Server-side IP geo detection (returned by /api/banner)
    if (ipLang && TRANSLATIONS[ipLang]) return ipLang;
    // 3. Browser language as final fallback
    const nav = (navigator.language || 'en').toLowerCase();
    if (TRANSLATIONS[nav]) return nav;
    if (nav.startsWith('zh')) return (nav === 'zh-tw' || nav === 'zh-hk' || nav === 'zh-mo') ? 'zh-TW' : 'zh-CN';
    if (nav.startsWith('pt')) return 'pt-BR';
    const base = nav.split('-')[0];
    if (TRANSLATIONS[base]) return base;
    return 'en';
  }

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

  // ── mode=auto: freeze non-essential scripts before consent ───────────────────
  // Usage: add data-category="analytics|marketing|functional" to script tags
  // e.g. <script data-src="https://ga.js" data-category="analytics"></script>
  function blockScripts() {
    document.querySelectorAll("script[data-category][data-src]").forEach(s => {
      // Already blocked (data-src present, src absent) — nothing to do
    });
    // Intercept any future scripts added before consent by observing DOM
  }

  function unblockScripts(consent) {
    document.querySelectorAll("script[data-category][data-src]").forEach(s => {
      const cat = s.getAttribute("data-category");
      if (consent[cat]) {
        const el = document.createElement("script");
        // Copy all attributes except data-src/data-category
        for (const attr of s.attributes) {
          if (attr.name === "data-src") {
            el.src = attr.value;
          } else if (attr.name !== "data-category") {
            el.setAttribute(attr.name, attr.value);
          }
        }
        if (s.textContent) el.textContent = s.textContent;
        s.parentNode.replaceChild(el, s);
      }
    });
  }

  // Find user ID and API base URL from the script's own src attribute
  let userId = null;
  let apiBase = "";
  let autoBlock = false; // true when mode=auto
  let langParam = "";
  try {
    const scripts = document.getElementsByTagName("script");
    for (let script of scripts) {
      if (script.src && script.src.includes("uterms-embed.js")) {
        const scriptUrl = new URL(script.src);
        userId = scriptUrl.searchParams.get("id");
        autoBlock = scriptUrl.searchParams.get("mode") === "auto";
        langParam = scriptUrl.searchParams.get("lang") || "";
        var apiParam = scriptUrl.searchParams.get("api");
        if (apiParam) {
          try {
            var apiParsed = new URL(apiParam);
            // Only allow the official API domain to prevent consent data exfiltration
            apiBase = apiParsed.hostname === "api.uterms.io" ? apiParam : "https://api.uterms.io";
          } catch(e) { apiBase = "https://api.uterms.io"; }
        } else {
          apiBase = "https://api.uterms.io";
        }
        break;
      }
    }
  } catch (e) {}
  if (!userId) {
    userId = new URLSearchParams(window.location.search).get("id");
  }

  function generateUUID() {
    // Use crypto.getRandomValues as a secure fallback when crypto.randomUUID is unavailable
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      var buf = new Uint8Array(16);
      crypto.getRandomValues(buf);
      buf[6] = (buf[6] & 0x0f) | 0x40; // version 4
      buf[8] = (buf[8] & 0x3f) | 0x80; // variant
      var hex = Array.from(buf).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
      return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
    }
    // Last resort — should never be reached in modern browsers
    return "00000000-0000-4000-8000-000000000000";
  }

  var VID_EXPIRY_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

  function getVisitorId() {
    try {
      var vid = localStorage.getItem("uterms_vid");
      var exp = parseInt(localStorage.getItem("uterms_vid_exp") || "0", 10);
      if (!vid || vid.length !== 36 || Date.now() > exp) {
        vid = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : generateUUID();
        localStorage.setItem("uterms_vid", vid);
        localStorage.setItem("uterms_vid_exp", String(Date.now() + VID_EXPIRY_MS));
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
          apiBase + "/api/banner/" + userId,
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

    // CCPA mode — enabled only when explicitly configured by the site owner.
    // Timezone-based auto-detection is unreliable and privacy-invasive; use server-side
    // IP geolocation or explicit configuration instead.
    const ccpaMode = !!(bannerConfig.ccpaMode);

    // Resolve active language — explicit param > IP geo > browser locale > English
    const t = TRANSLATIONS[detectLanguage(langParam, rawConfig && rawConfig.detected_lang)];

    // Apply translated category names/descriptions
    if (t.categories) {
      categories = categories.map(function(cat) {
        var tc = t.categories[cat.id];
        return tc ? { id: cat.id, name: tc.name, description: tc.description } : cat;
      });
    }

    // Determine initial consent state defaults
    let defaultConsentObj = {};
    for (const cat of categories) {
      defaultConsentObj[cat.id] = cat.id === "essential";
    }

    function saveConsent(consent) {
      // CCPA: Do Not Sell forces marketing and social off
      if (consent.do_not_sell) {
        consent = Object.assign({}, consent, { marketing: false, social: false });
      }
      document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; path=/; max-age=31536000; SameSite=Lax`;

      // GCM v2 — update consent signals based on visitor's choices
      gtagConsent("update", {
        ad_storage: consent.marketing ? "granted" : "denied",
        analytics_storage: consent.analytics ? "granted" : "denied",
        ad_user_data: consent.marketing ? "granted" : "denied",
        ad_personalization: consent.marketing ? "granted" : "denied",
        functionality_storage: consent.functional ? "granted" : "denied",
        security_storage: "granted",
      });

      if (autoBlock) unblockScripts(consent);

      if (userId && userId !== "YOUR_USER_ID") {
        fetch(apiBase + "/api/consent", {
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
      showManageBtn();
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
      
      #uterms-banner button.uterms-secondary, .uterms-modal-footer button.uterms-secondary {
        background-color: #ffffff;
        color: #374151;
        border-color: #374151;
        font-weight: 600;
      }

      #uterms-banner button.uterms-secondary:hover, .uterms-modal-footer button.uterms-secondary:hover {
        background-color: #f3f4f6;
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
      .uterms-preference-info p { margin: 0; font-size: 13px; color: #6b7280; line-height: 1.5; }
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
      #uterms-manage-btn {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        z-index: 2147483646;
        background: ${primaryBg};
        color: ${primaryColor};
        border: none;
        border-radius: 9999px;
        padding: 0.5rem 1rem;
        font-size: 0.8125rem;
        font-weight: 500;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.18);
        font-family: system-ui, -apple-system, sans-serif;
        display: none;
        transition: opacity 0.2s;
      }
      #uterms-manage-btn:hover { opacity: 0.9; }
      .uterms-pipl-notice {
        margin-top: 0.5rem;
        padding: 0.75rem;
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 6px;
        font-size: 0.75rem;
        color: #0c4a6e;
        line-height: 1.5;
      }
      .uterms-pipl-notice strong { font-weight: 600; }
      .uterms-pipl-badge {
        display: inline-block;
        font-size: 0.625rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        background: #0369a1;
        color: white;
        padding: 1px 5px;
        border-radius: 3px;
        margin-right: 6px;
        vertical-align: middle;
      }
      .uterms-pipl-row { margin-top: 0.25rem; }
      #uterms-dns-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        padding: 0.4rem 1rem;
        font-size: 0.75rem;
        text-align: center;
        z-index: 2147483645;
        display: none;
        font-family: system-ui, -apple-system, sans-serif;
      }
      #uterms-dns-bar a { color: #374151; text-decoration: underline; cursor: pointer; }
      #uterms-dns-toast {
        position: fixed;
        bottom: 2.5rem;
        left: 50%;
        transform: translateX(-50%);
        background: #111827;
        color: #fff;
        padding: 0.4rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.8125rem;
        z-index: 2147483647;
        display: none;
        font-family: system-ui, -apple-system, sans-serif;
      }
    `;
    document.head.appendChild(style);

    // Build PIPL notice HTML when piplMode is enabled and required fields are set
    let piplNoticeHtml = '';
    if (bannerConfig.piplMode && bannerConfig.piplCompanyName) {
      const retention = bannerConfig.piplRetentionDays || 180;
      piplNoticeHtml = `
        <div class="uterms-pipl-notice">
          <span class="uterms-pipl-badge">PIPL</span><strong>${t.piplTitle || 'Personal Data Notice'}</strong>
          <div class="uterms-pipl-row">${t.piplController || 'Data Controller'}: <strong>${bannerConfig.piplCompanyName}</strong>${bannerConfig.piplContactEmail ? ` &nbsp;·&nbsp; ${t.piplContact || 'Contact'}: <strong>${bannerConfig.piplContactEmail}</strong>` : ''}</div>
          <div class="uterms-pipl-row">${t.piplRetention || 'Retention'}: <strong>${retention} ${t.piplRetentionUnit || 'days'}</strong></div>
          ${bannerConfig.piplCrossBorder ? `<div class="uterms-pipl-row">${t.piplCrossBorder || 'Data may be transferred outside China.'}</div>` : ''}
        </div>
      `;
    }

    // Create Banner
    const banner = document.createElement("div");
    banner.id = "uterms-banner";
    banner.style.display = "none";
    banner.innerHTML = `
      <div class="uterms-banner-content">
        <h3>${t.title}</h3>
        <p>${t.description}${bannerConfig.privacyPolicyUrl ? ` <a href="${bannerConfig.privacyPolicyUrl}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">${t.learnMore || 'Learn more'}</a>` : ''}</p>
        ${piplNoticeHtml}
      </div>
      <div class="uterms-banner-actions">
        <button id="uterms-btn-customize" class="uterms-btn-text">${t.customize}</button>
        <div class="uterms-action-buttons">
          <button id="uterms-btn-reject" class="uterms-secondary">${t.rejectAll}</button>
          <button id="uterms-btn-accept" class="uterms-primary">${t.acceptAll}</button>
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
            <div style="font-size:0.75rem;color:#6b7280;white-space:nowrap">${t.alwaysActive}</div>
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
      <h2>${t.modalTitle}</h2>
      ${rowsHtml}
      <div class="uterms-modal-footer">
        <button id="uterms-btn-save">${t.savePreferences}</button>
        <button id="uterms-btn-accept-all-modal" class="uterms-primary">${t.acceptAll}</button>
      </div>
    `;
    document.body.appendChild(modal);

    // Manage Preferences button (shown after consent is given)
    const manageBtn = document.createElement("button");
    manageBtn.id = "uterms-manage-btn";
    manageBtn.textContent = t.managePreferences;
    document.body.appendChild(manageBtn);

    // CCPA Do Not Sell bar
    const dnsBar = document.createElement("div");
    dnsBar.id = "uterms-dns-bar";
    const dnsLink = document.createElement("a");
    dnsLink.textContent = t.doNotSell;
    dnsBar.appendChild(dnsLink);
    document.body.appendChild(dnsBar);

    const dnsToast = document.createElement("div");
    dnsToast.id = "uterms-dns-toast";
    dnsToast.textContent = t.doNotSellSaved;
    document.body.appendChild(dnsToast);

    function showManageBtn() {
      try { localStorage.setItem(MANAGE_BTN_KEY, "1"); } catch(e) {}
      manageBtn.style.display = "block";
      if (ccpaMode) {
        dnsBar.style.display = "block";
        // Reflect current Do Not Sell state
        var c = getConsent() || {};
        dnsLink.textContent = (c.do_not_sell ? "✓ " : "") + t.doNotSell;
      }
    }

    manageBtn.addEventListener("click", function() {
      showModal();
    });

    dnsLink.addEventListener("click", function(e) {
      e.preventDefault();
      var currentConsent = getConsent() || {};
      var next = !currentConsent.do_not_sell;
      var updated = Object.assign({}, currentConsent, { do_not_sell: next });
      saveConsent(updated);
      dnsLink.textContent = (next ? "✓ " : "") + t.doNotSell;
      dnsToast.style.display = "block";
      setTimeout(function() { dnsToast.style.display = "none"; }, 2500);
    });

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
    const existingConsent = getConsent();
    if (!existingConsent) {
      showBanner();
    } else {
      // CCPA: enforce Do Not Sell on returning visitors
      var effectiveConsent = existingConsent;
      if (existingConsent.do_not_sell) {
        effectiveConsent = Object.assign({}, existingConsent, { marketing: false, social: false });
      }
      // GCM v2 — restore returning visitor's consent signals immediately
      gtagConsent("update", {
        ad_storage: effectiveConsent.marketing ? "granted" : "denied",
        analytics_storage: effectiveConsent.analytics ? "granted" : "denied",
        ad_user_data: effectiveConsent.marketing ? "granted" : "denied",
        ad_personalization: effectiveConsent.marketing ? "granted" : "denied",
        functionality_storage: effectiveConsent.functional ? "granted" : "denied",
        security_storage: "granted",
      });
      // Unblock scripts for returning visitors who already consented
      if (autoBlock) unblockScripts(effectiveConsent);
      showManageBtn();
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
