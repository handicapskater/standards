(function () {
  const mount = document.getElementById("site-footer");
  if (!mount) return;

  mount.innerHTML = `
<footer class="site-footer">
  <div class="footer-inner">
    <nav class="footer-nav" aria-label="Footer navigation">
      <a href="/standards.html">Standards</a>
      <a href="/non-standard-mobility-aids.html">Non-standard Mobility Aids</a>
      <a href="/transportation-accommodation.html">Transportation</a>
      <a href="/direct-threat-analysis.html">Direct Threat</a>
      <a href="/dot-fta-doj-timeline.html">Timeline</a>
      <a href="/references.html">References</a>
    </nav>

    <div class="footer-social">
      <a href="https://handicapskater.com/" target="_blank" rel="noopener noreferrer">HandicapSkater.com</a>
    </div>

    <p class="footer-copy">Copyright © 2004 to 2026 HandicapSkater.org.</p>
    <p class="footer-description">HandicapSkater separates physiologic burden, mechanical motion exposure, and body coupling so mobility aid review can preserve context. This site presents generalized review standards and evidence frameworks.</p>
  </div>
</footer>
`;
})();
