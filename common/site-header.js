(function () {
  const config = {
    brand: "HandicapSkater.org",
    primaryLinks: [
      { href: "/direct-threat-analysis/", label: "Direct Threat", match: ["/direct-threat-analysis/"] },
      { href: "/standards/", label: "Engineering Principles", match: ["/standards/"] },
      { href: "/federal-source-anchors/", label: "Federal Sources", match: ["/federal-source-anchors/"] },
      { href: "/hypothesis-registry/", label: "Hypothesis Registry", match: ["/hypothesis-registry/"] },
      { href: "/evidence-review/", label: "Methods", match: ["/evidence-review/"] }
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
