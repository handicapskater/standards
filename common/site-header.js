(function () {
  const config = {
    brand: "HandicapSkater.org",
    primaryLinks: [
      { href: "/protocol/", label: "Protocol", match: ["/protocol/", "/standards/", "/non-standard-mobility-aids/"] },
      { href: "/review-tools/", label: "Review Tools", match: ["/review-tools/"] },
      { href: "/actual-risk/", label: "Actual Risk", match: ["/actual-risk/", "/direct-threat-analysis/"] },
      { href: "/certification-model/", label: "Portable Record", match: ["/certification-model/"] },
      { href: "/current-law-sources/", label: "Law & Guidance", match: ["/current-law-sources/", "/federal-source-anchors/"] },
      { href: "/case-study/inline-skates/", label: "Case Study", match: ["/case-study/inline-skates/"] },
      { href: "/feedback-and-pilots/", label: "Feedback / Pilots", match: ["/feedback-and-pilots/"] }
    ]
  };

  function normalizePath(pathname) {
    if (!pathname || pathname === "/index.html" || pathname === "/index.htm") {
      return "/";
    }

    if (pathname.endsWith("/index.html")) {
      return pathname.replace(/index\.html$/, "");
    }

    if (pathname.endsWith("/index.htm")) {
      return pathname.replace(/index\.htm$/, "");
    }

    return pathname;
  }

  function linkMatchesPath(link, path) {
    const href = link.href || "";
    const match = Array.isArray(link.match) ? link.match : [];

    return !href.startsWith("http") && match.includes(path);
  }

  function renderNavLink(link, path) {
    const href = link.href || "#";
    const external = href.startsWith("http");
    const active = linkMatchesPath(link, path) ? ' aria-current="page"' : "";
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    const className = external ? ' class="nav-link external-link"' : ' class="nav-link"';

    return `<a${className} href="${href}"${active}${attrs}>${link.label || ""}</a>`;
  }

  function renderPrimaryNav(path) {
    return config.primaryLinks.map((link) => renderNavLink(link, path)).join("");
  }

  function renderSiteHeader() {
    const mount = document.getElementById("site-header");
    if (!mount) {
      return;
    }

    const path = normalizePath(window.location.pathname);
    const primaryNavHtml = renderPrimaryNav(path);
    const brandCurrent = path === "/" ? ' aria-current="page"' : "";
    mount.outerHTML = `
      <header class="site-header" data-site-host="handicapskater.org">
        <div class="nav-wrap">
          <a class="brand" href="/" aria-label="${config.brand}"${brandCurrent}>${config.brand}</a>
          <nav class="site-nav" aria-label="Primary navigation">
            ${primaryNavHtml}
          </nav>
        </div>
      </header>
    `;

  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSiteHeader);
  } else {
    renderSiteHeader();
  }
})();

function normalizeSectionAlternation() {
  const sections = Array.from(document.querySelectorAll("main > section.section"));

  sections.forEach((section, index) => {
    section.classList.toggle("alt", index % 2 === 1);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", normalizeSectionAlternation);
} else {
  normalizeSectionAlternation();
}
