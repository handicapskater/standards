(function () {
  const host = window.location.hostname.replace(/^www\./, "");

  const menus = {
    "handicapskater.org": {
      brand: "HandicapSkater.org",
      primaryLinks: [
        { href: "/", label: "Home", match: ["/"] },
        { href: "/standards.html", label: "Standards", match: ["/standards.html"] },
        { href: "/non-traditional-mobility-aids.html", label: "Mobility Review", match: ["/non-traditional-mobility-aids.html"] },
        { href: "/transportation-accommodation.html", label: "Transport", match: ["/transportation-accommodation.html"] },
        { href: "/evidence-standards.html", label: "Evidence", match: ["/evidence-standards.html"] },
        { href: "/accommodation-framework.html", label: "Framework", match: ["/accommodation-framework.html"] }
      ],
      moreLinks: [
        { href: "/dot-fta-doj-timeline.html", label: "Timeline", match: ["/dot-fta-doj-timeline.html"] },
        { href: "/direct-threat-analysis.html", label: "Direct Threat", match: ["/direct-threat-analysis.html"] },
        { href: "/reviewer-guidance.html", label: "Reviewer Guidance", match: ["/reviewer-guidance.html"] },
        { href: "/fsi-css-platform.html", label: "FSI/CSS", match: ["/fsi-css-platform.html"] },
        { href: "/public-record.html", label: "Public Record", match: ["/public-record.html"] },
        { href: "/references.html", label: "References", match: ["/references.html", "/references.htm"] },
        { href: "https://handicapskater.com/", label: "Case Study", match: [] }
      ]
    }
  };

  const config = menus["handicapskater.org"];

  function ensureChromeStylesheet() {
    const href = "/common/css/site-chrome.css";
    if (document.querySelector('link[href="' + href + '"]')) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function normalizePath(pathname) {
    if (!pathname || pathname === "/index.html" || pathname === "/index.htm") return "/";
    if (pathname.endsWith("/index.html")) return pathname.replace(/index\.html$/, "");
    if (pathname.endsWith("/index.htm")) return pathname.replace(/index\.htm$/, "");
    return pathname;
  }

  function isExternal(link) {
    return /^https?:\/\//i.test(link.href);
  }

  function isActive(link, path) {
    if (isExternal(link)) return false;
    return link.match.includes(path);
  }

  function renderNavLink(link, path) {
    const external = isExternal(link);
    const active = isActive(link, path) ? ' aria-current="page"' : "";
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    const className = external ? ' class="external-link"' : "";
    return `<a${className} href="${link.href}"${active}${attrs}>${link.label}</a>`;
  }

  function renderMoreMenu(links, path) {
    const active = links.some((link) => isActive(link, path));
    const activeClass = active ? " is-active" : "";
    const menuLinks = links.map((link) => renderNavLink(link, path)).join("");

    return `
      <details class="hs-more${activeClass}">
        <summary class="hs-more-summary">More</summary>
        <div class="hs-more-menu">
          ${menuLinks}
        </div>
      </details>
    `;
  }

  function wireMoreMenuCloseBehavior() {
    const details = document.querySelector(".hs-more");
    if (!details) return;

    const summary = details.querySelector(".hs-more-summary");
    const menu = details.querySelector(".hs-more-menu");
    if (!summary || !menu) return;

    function closeMoreMenu() {
      details.removeAttribute("open");
    }

    document.addEventListener("pointerdown", function (event) {
      if (details.open && !details.contains(event.target)) closeMoreMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && details.open) {
        closeMoreMenu();
        summary.focus();
      }
    });

    document.addEventListener("focusin", function (event) {
      if (details.open && !details.contains(event.target)) closeMoreMenu();
    });

    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMoreMenu();
    });

    window.addEventListener("scroll", function () {
      if (details.open) closeMoreMenu();
    }, { passive: true });

    window.addEventListener("resize", closeMoreMenu);
  }

  function renderSiteHeader() {
    ensureChromeStylesheet();

    const mount = document.getElementById("site-header");
    if (!mount) return;

    const path = normalizePath(window.location.pathname);
    const primaryNav = config.primaryLinks.map((link) => renderNavLink(link, path)).join("");
    const moreNav = renderMoreMenu(config.moreLinks, path);

    mount.outerHTML = `
      <header class="site-header" data-site-host="${host}">
        <div class="nav-wrap">
          <a class="brand" href="/">${config.brand}</a>
          <nav class="site-nav" aria-label="Main navigation">
            ${primaryNav}
            ${moreNav}
          </nav>
        </div>
      </header>
    `;

    wireMoreMenuCloseBehavior();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSiteHeader);
  } else {
    renderSiteHeader();
  }
})();
