(function () {
  const links = [
    { href: "/", label: "Home", match: ["/", "/index.html"] },
    { href: "/standards.html", label: "Standards", match: ["/standards.html"] },
    { href: "/non-traditional-mobility-aids.html", label: "Mobility Aids", match: ["/non-traditional-mobility-aids.html"] },
    { href: "/dot-fta-doj-timeline.html", label: "Timeline", match: ["/dot-fta-doj-timeline.html"] },
    { href: "/accommodation-framework.html", label: "Framework", match: ["/accommodation-framework.html"] },
    { href: "/direct-threat-analysis.html", label: "Direct Threat", match: ["/direct-threat-analysis.html"] },
    { href: "/references.html", label: "References", match: ["/references.html"] },
    { href: "https://handicapskater.com/", label: "Case Study", match: [] }
  ];

  function normalizePath(path) {
    if (!path || path === "/index.html") {
      return "/";
    }
    return path;
  }

  const path = normalizePath(window.location.pathname);

  const nav = links.map((link) => {
    const active = link.match.includes(path) ? ' aria-current="page"' : "";
    const external = link.href.startsWith("http");
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    const externalClass = external ? " external-link" : "";
    return `<a class="${externalClass.trim()}" href="${link.href}"${active}${attrs}>${link.label}</a>`;
  }).join("");

  document.getElementById("site-header").innerHTML = `
    <header class="site-header">
      <div class="nav-wrap">
        <a class="brand" href="/">HandicapSkater.org</a>
        <nav class="site-nav" aria-label="Primary">${nav}</nav>
      </div>
    </header>
  `;
})();