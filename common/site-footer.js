(function () {
  const mount = document.getElementById("site-footer");
  if (!mount) return;

  const normalizePath = (pathname) => {
    if (!pathname || pathname === "/index.html") return "/";
    return pathname.endsWith("/index.html") ? pathname.replace(/index\.html$/, "") : pathname;
  };
  const principles = [
    { href: "/direct-threat-analysis/", label: "Direct Threat", related: "/actual-risk/" },
    { href: "/actual-risk/", label: "Actual Risk", related: "/direct-threat-analysis/" },
    { href: "/body-coupling/", label: "Body Coupling", related: "/actual-risk/" },
    { href: "/hypothesis-registry/", label: "Hypothesis Registry", related: "/body-coupling/" },
    { href: "/federal-source-anchors/", label: "Federal Source Anchors", related: "/direct-threat-analysis/" },
    { href: "/non-standard-mobility-aids/", label: "Non-Standard Mobility Aid", related: "/federal-source-anchors/" }
  ];

  function renderJourney() {
    const path = normalizePath(window.location.pathname);
    const index = principles.findIndex((item) => item.href === path);
    if (index < 0) return "";
    const previous = principles[Math.max(0, index - 1)];
    const next = principles[Math.min(principles.length - 1, index + 1)];
    const related = principles.find((item) => item.href === principles[index].related);
    return `<nav class="sequence-nav" aria-label="Continue through the HandicapSkater principles">
      <a href="${previous.href}"><span>Previous</span>${previous.label}</a>
      <a href="${next.href}"><span>Next</span>${next.label}</a>
      <a href="${principles[index].related}"><span>Related Principle</span>${related ? related.label : "Review framework"}</a>
      <a href="https://handicapskater.com/platform/"><span>Explore Evidence</span>Evidence Observatory</a>
    </nav>`;
  }

  mount.innerHTML = renderJourney() + `
<footer class="site-footer">
  <div class="footer-inner">
    <nav class="footer-nav" aria-label="Footer navigation">
      <a href="/standards/">Standards</a>
      <a href="/non-standard-mobility-aids/">Non-standard mobility aids</a>
      <a href="/transportation-accommodation/">Transportation accommodation</a>
      <a href="/direct-threat-analysis/">Direct-threat analysis</a>
      <a href="/evidence-review/">Evidence review</a>
      <a href="/reviewer-guidance/">Reviewer guidance</a>
      <a href="https://handicapskater.com/platform/" target="_blank" rel="noopener noreferrer">Explore the Evidence Observatory</a>
    </nav>
    <p class="footer-copy">Copyright © 2004 to 2026 <span class="small-caps">HandicapSkater</span>.</p>
    <p class="footer-description"><span class="small-caps">HandicapSkater</span> separates physiologic burden, mechanical motion exposure, and body coupling so mobility aid review can preserve context. This site presents generalized review standards and evidence frameworks.</p>
  </div>
</footer>
`;
})();
