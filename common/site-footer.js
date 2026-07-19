(function () {
  const mount = document.getElementById("site-footer");
  if (!mount) return;

  mount.innerHTML = `
<footer class="site-footer">
  <div class="footer-inner">
    <nav class="footer-nav" aria-label="Footer navigation">
      <a href="/standards/">Standards</a>
      <a href="/non-standard-mobility-aids/">Non-standard mobility aids</a>
      <a href="/transportation-accommodation/">Transportation accommodation</a>
      <a href="/direct-threat-analysis/">Direct-threat analysis</a>
      <a href="/evidence-review/">Evidence review</a>
      <a href="/reviewer-guidance/">Reviewer guidance</a>
      <a href="https://handicapskater.com/evidence/" target="_blank" rel="noopener noreferrer">Individual Case Study &amp; Evidence</a>
    </nav>
    <p class="footer-copy">Copyright © 2004 to 2026 <span class="small-caps">HandicapSkater</span>.</p>
    <p class="footer-description"><span class="small-caps">HandicapSkater</span> separates physiologic burden, mechanical motion exposure, and body coupling so mobility aid review can preserve context. This site presents generalized review standards and evidence frameworks.</p>
  </div>
</footer>
`;
})();
