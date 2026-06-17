(function () {
  const config = {
    brand: "HandicapSkater.org",
    primaryLinks: [
      { href: "/", label: "Home", match: ["/"] },
      { href: "/standards.html", label: "Standards", match: ["/standards.html"] },
      { href: "/non-traditional-mobility-aids.html", label: "Mobility Aids", match: ["/non-traditional-mobility-aids.html"] },
      { href: "/evidence-standards.html", label: "Evidence", match: ["/evidence-standards.html"] },
      { href: "/fsi-css-platform.html", label: "FSI/CSS", match: ["/fsi-css-platform.html"] },
      { href: "/reviewer-guidance.html", label: "Reviewers", match: ["/reviewer-guidance.html"] }
    ],
    moreLinks: [
      { href: "/public-record.html", label: "Public Record", match: ["/public-record.html"] },
      { href: "/dot-fta-doj-timeline.html", label: "Timeline", match: ["/dot-fta-doj-timeline.html"] },
      { href: "/accommodation-framework.html", label: "Framework", match: ["/accommodation-framework.html"] },
      { href: "/direct-threat-analysis.html", label: "Direct Threat", match: ["/direct-threat-analysis.html"] },
      { href: "/references.html", label: "References", match: ["/references.html"] },
      { href: "https://handicapskater.com/", label: "Case Study", match: [] }
    ]
  };

  function ensureChromeStylesheet() {
    if (document.querySelector('link[href="/common/css/site-chrome.css"]')) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/common/css/site-chrome.css";
    document.head.appendChild(link);
  }

  function normalizePath(pathname) {
    if (!pathname || pathname === "/index.html" || pathname === "/index.htm") return "/";
    if (pathname.endsWith("/index.html")) return pathname.replace(/index\.html$/, "");
    if (pathname.endsWith("/index.htm")) return pathname.replace(/index\.htm$/, "");
    return pathname;
  }

  function isActive(link, path) {
    const external = link.href.startsWith("http");
    return !external && link.match.includes(path);
  }

  function renderNavLink(link, path) {
    const external = link.href.startsWith("http");
    const active = isActive(link, path) ? ' aria-current="page"' : "";
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    const className = external ? ' class="external-link"' : "";
    return `<a${className} href="${link.href}"${active}${attrs}>${link.label}</a>`;
  }

  function renderSiteHeader(config) {
    ensureChromeStylesheet();
    const path = normalizePath(window.location.pathname);
    const primaryNav = config.primaryLinks.map((link) => renderNavLink(link, path)).join("");
    const moreNav = config.moreLinks.map((link) => renderNavLink(link, path)).join("");
    const moreActive = config.moreLinks.some((link) => isActive(link, path)) ? " is-active" : "";
    const mount = document.getElementById("site-header");
    if (!mount) return;
    mount.outerHTML = `
      <header class="site-header">
        <div class="nav-wrap">
          <a class="brand" href="/">${config.brand}</a>
          <nav class="site-nav" aria-label="Main navigation">
            ${primaryNav}
            <div class="nav-more${moreActive}">
              <button
                class="nav-more-button"
                type="button"
                aria-expanded="false"
                aria-controls="nav-more-menu"
              >
                More
              </button>
              <div class="nav-more-menu" id="nav-more-menu" hidden>
                ${moreNav}
              </div>
            </div>
          </nav>
        </div>
      </header>
    `;
    wireMoreMenu();
  }

  function wireMoreMenu() {
    const more = document.querySelector(".nav-more");
    const button = document.querySelector(".nav-more-button");
    const menu = document.querySelector(".nav-more-menu");
    if (!more || !button || !menu) return;
    function openMenu() {
      menu.hidden = false;
      positionMenu();
      button.setAttribute("aria-expanded", "true");
      more.classList.add("is-open");
    }

    function closeMenu() {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
      more.classList.remove("is-open");
    }

    function positionMenu() {
      const buttonRect = button.getBoundingClientRect();
      const menuWidth = Math.min(280, window.innerWidth - 24);
      const left = Math.max(12, Math.min(buttonRect.right - menuWidth, window.innerWidth - menuWidth - 12));
      menu.style.setProperty("--nav-more-left", `${left}px`);
      menu.style.setProperty("--nav-more-top", `${buttonRect.bottom + 8}px`);
      menu.style.setProperty("--nav-more-width", `${menuWidth}px`);
    }

    function toggleMenu() {
      if (menu.hidden) openMenu();
      else closeMenu();
    }

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      toggleMenu();
    });
    document.addEventListener("click", function (event) {
      if (!more.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (!menu.hidden) positionMenu();
    });

    window.addEventListener("scroll", function () {
      if (!menu.hidden) positionMenu();
    }, { passive: true });

  }

  renderSiteHeader(config);
})();
