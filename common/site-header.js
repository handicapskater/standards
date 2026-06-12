(function () {
  const links = [
    { href: "/", label: "Home", match: ["/"] },
    { href: "/standards.html", label: "Standards", match: ["/standards.html"] },
    { href: "/non-traditional-mobility-aids.html", label: "Non-Traditional Mobility Aids", match: ["/non-traditional-mobility-aids.html"] },
    { href: "/dot-fta-doj-timeline.html", label: "DOT/FTA/DOJ Timeline", match: ["/dot-fta-doj-timeline.html"] },
    { href: "/accommodation-framework.html", label: "Accommodation Framework", match: ["/accommodation-framework.html"] },
    { href: "/direct-threat-analysis.html", label: "Direct Threat", match: ["/direct-threat-analysis.html"] },
    { href: "/references.html", label: "References", match: ["/references.html"] },
    { href: "https://handicapskater.com/", label: "Case Study on .com", match: [] }
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
    return `<a href="${link.href}"${active}>${link.label}</a>`;
  }).join("");

  document.getElementById("site-header").innerHTML = `
    <header class="site-header">
      <div class="nav-wrap">
<!--        <a class="brand" href="/">HandicapSkater.org</a>-->
        <nav class="site-nav" aria-label="Primary">${nav}</nav>
      </div>
    </header>
  `;
})();
