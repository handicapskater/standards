(function () {
  const config = {
    brand: "HandicapSkater.org",
    primaryLinks: [
      { href: "/", label: "Home", match: ["/"] },
      { href: "/standards.html", label: "Standards", match: ["/standards.html"] },
      { href: "/transportation-accommodation.html", label: "Transportation", match: ["/transportation-accommodation.html"] },
      { href: "/evidence-standards.html", label: "Evidence", match: ["/evidence-standards.html"] },
      { href: "/reviewer-guidance.html", label: "Reviewers", match: ["/reviewer-guidance.html"] },
      { href: "/fsi-css-platform.html", label: "Platform", match: ["/fsi-css-platform.html"] }
    ],
    moreLinks: [
      { href: "/non-traditional-mobility-aids.html", label: "Mobility Review", match: ["/non-traditional-mobility-aids.html"] },
      { href: "/accommodation-framework.html", label: "Framework", match: ["/accommodation-framework.html"] },
      { href: "/dot-fta-doj-timeline.html", label: "Timeline", match: ["/dot-fta-doj-timeline.html"] },
      { href: "/direct-threat-analysis.html", label: "Direct Threat", match: ["/direct-threat-analysis.html"] },
      { href: "/public-record.html", label: "Public Record", match: ["/public-record.html"] },
      { href: "/references.html", label: "References", match: ["/references.html"] },
      { href: "https://handicapskater.com/", label: "Case Study", match: [] }
    ]
  };

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
    const className = external ? ' class="nav-link external-link"' : ' class="nav-link"';
    return `<a${className} href="${link.href}"${active}${attrs}>${link.label}</a>`;
  }

  function renderMoreMenu(links, path) {
    const active = links.some((link) => isActive(link, path));
    const activeClass = active ? " is-active" : "";
    const menuLinks = links.map((link) => renderNavLink(link, path)).join("");

    return `
      <details class="nav-more${activeClass}">
        <summary class="nav-more-summary">More</summary>
        <div class="nav-more-menu">
          ${menuLinks}
        </div>
      </details>
    `;
  }

  function wireMoreMenuCloseBehavior() {
    const details = document.querySelector(".nav-more");
    if (!details) return;

    const summary = details.querySelector(".nav-more-summary");
    const menu = details.querySelector(".nav-more-menu");
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
    const mount = document.getElementById("site-header");
    if (!mount) return;

    const path = normalizePath(window.location.pathname);
    const primaryNav = config.primaryLinks.map((link) => renderNavLink(link, path)).join("");
    const moreNav = renderMoreMenu(config.moreLinks, path);

    mount.outerHTML = `
      <header class="site-header" data-site-host="handicapskater.org">
        <div class="nav-wrap">
          <a class="brand" href="/">${config.brand}</a>
          <nav class="site-nav" aria-label="Primary navigation">
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
