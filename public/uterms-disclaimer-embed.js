(function () {
  var API_BASE = "http://localhost:3001";

  var userId = null;
  try {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf("uterms-disclaimer-embed.js") !== -1) {
        userId = new URL(scripts[i].src).searchParams.get("id");
        break;
      }
    }
  } catch (e) {}

  if (!userId) {
    console.warn("[uTerms] uterms-disclaimer-embed.js: no ?id= parameter found in script src.");
    return;
  }

  function getContainer() {
    var el = document.getElementById("uterms-disclaimer");
    if (!el) {
      el = document.createElement("div");
      el.id = "uterms-disclaimer";
      document.body.appendChild(el);
    }
    return el;
  }

  function render() {
    var container = getContainer();
    container.innerHTML =
      '<p style="font-family:sans-serif;color:#9ca3af;text-align:center;padding:2rem 1rem;">Loading Disclaimer\u2026</p>';

    fetch(API_BASE + "/api/embed/disclaimer/" + encodeURIComponent(userId))
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (policy) {
        if (!policy.generated) throw new Error("empty");

        var wrapper = document.createElement("div");
        wrapper.className = "uterms-disclaimer-doc";
        wrapper.style.cssText = [
          "font-family:Georgia,'Times New Roman',serif",
          "font-size:0.9375rem",
          "line-height:1.75",
          "color:#1f2937",
          "max-width:800px",
          "margin:0 auto",
          "padding:2rem 1rem",
        ].join(";");
        wrapper.innerHTML = policy.generated;

        container.innerHTML = "";
        container.appendChild(wrapper);
      })
      .catch(function (err) {
        console.error("[uTerms] Failed to load Disclaimer:", err);
        getContainer().innerHTML =
          '<p style="font-family:sans-serif;color:#ef4444;text-align:center;padding:2rem 1rem;">Disclaimer could not be loaded.</p>';
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
