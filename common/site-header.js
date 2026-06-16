(function () {
  const config = {
    brand: "HandicapSkater.org",
    links: [
    { href: "/", label: "Home", match: ["/"] },
    { href: "/standards.html", label: "Standards", match: ["/standards.html"] },
    { href: "/non-traditional-mobility-aids.html", label: "Mobility Aids", match: ["/non-traditional-mobility-aids.html"] },
    { href: "/evidence-standards.html", label: "Evidence", match: ["/evidence-standards.html"] },
    { href: "/fsi-css-platform.html", label: "FSI/CSS", match: ["/fsi-css-platform.html"] },
    { href: "/reviewer-guidance.html", label: "Reviewers", match: ["/reviewer-guidance.html"] },
    { href: "/public-record.html", label: "Public Record", match: ["/public-record.html"] },
    { href: "/dot-fta-doj-timeline.html", label: "Timeline", match: ["/dot-fta-doj-timeline.html"] },
    { href: "/accommodation-framework.html", label: "Framework", match: ["/accommodation-framework.html"] },
    { href: "/direct-threat-analysis.html", label: "Direct Threat", match: ["/direct-threat-analysis.html"] },
    { href: "/references.html", label: "References", match: ["/references.html"] },
    { href: "https://handicapskater.com/", label: "Case Study", match: [] }
    ]
  };

function ensureChromeStylesheet() {
  if (document.querySelector('link[href="/common/css/site-chrome.css"]')) {
    return;
  }
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/common/css/site-chrome.css";
  document.head.appendChild(link);
}

function normalizePath(pathname) {
  if (!pathname || pathname === "/index.html") return "/";
  if (pathname.endsWith("/index.html")) return pathname.replace(/index\.html$/, "");
  return pathname;
}

function renderNavLink(link, path) {
  const external = link.href.startsWith("http");
  const active = !external && link.match.includes(path) ? ' aria-current="page"' : "";
  const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
  const className = external ? ' class="external-link"' : "";
  return `<a${className} href="${link.href}"${active}${attrs}>${link.label}</a>`;
}

function renderSiteHeader(config) {
  ensureChromeStylesheet();
  const path = normalizePath(window.location.pathname);
  const nav = config.links.map((link) => renderNavLink(link, path)).join("");
  const mount = document.getElementById("site-header");
  if (!mount) {
    return;
  }
  mount.outerHTML = `
  <header class="site-header">
    <div class="nav-wrap">
      <a class="brand" href="/">${config.brand}</a>
      <nav class="site-nav" aria-label="Main navigation">${nav}</nav>
    </div>
  </header>`;
}


  renderSiteHeader(config);
})();
