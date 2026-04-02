(function () {
  var API_BASE = "http://localhost:3001";

  // Extract user ID from this script's src parameter
  var userId = null;
  try {
    var scripts = document.getElementsByTagName("script");
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src && scripts[i].src.indexOf("uterms-cookie-embed.js") !== -1) {
        userId = new URL(scripts[i].src).searchParams.get("id");
        break;
      }
    }
  } catch (e) {}

  if (!userId) {
    console.warn("[uTerms] uterms-cookie-embed.js: no ?id= parameter found in script src.");
    return;
  }

  // Find the host element or create one at the end of body
  function getContainer() {
    var el = document.getElementById("uterms-cookie-policy");
    if (!el) {
      el = document.createElement("div");
      el.id = "uterms-cookie-policy";
      document.body.appendChild(el);
    }
    return el;
  }

  function render() {
    var container = getContainer();
    container.innerHTML =
      '<p style="font-family:sans-serif;color:#9ca3af;text-align:center;padding:2rem 1rem;">Loading cookie policy\u2026</p>';

    fetch(API_BASE + "/api/embed/cookie-policy/" + encodeURIComponent(userId))
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (policy) {
        if (!policy.generated) throw new Error("empty");

        var wrapper = document.createElement("div");
        wrapper.className = "uterms-cookie-policy-doc";
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
        console.error("[uTerms] Failed to load cookie policy:", err);
        getContainer().innerHTML =
          '<p style="font-family:sans-serif;color:#ef4444;text-align:center;padding:2rem 1rem;">Cookie policy could not be loaded.</p>';
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
