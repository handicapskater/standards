(function () {
  const mount = document.getElementById("site-footer");
  if (!mount) return;

  mount.innerHTML = `
<footer class="site-footer">
  <div class="footer-inner">
<!--    <nav class="footer-nav" aria-label="Footer navigation">-->
<!--      <a href="/">Home</a>-->
<!--      <a href="/standards.html">Standards</a>-->
<!--      <a href="/non-traditional-mobility-aids.html">Mobility Review</a>-->
<!--      <a href="/evidence-standards.html">Evidence</a>-->
<!--      <a href="/fsi-css-platform.html">FSI/CSS</a>-->
<!--      <a href="/references.html">References</a>-->
<!--    </nav>-->

<!--    <div class="footer-social">-->
<!--      <a href="https://handicapskater.com/">Case Study</a>-->
<!--    </div>-->

    <p class="footer-copy">Copyright © 2004 to 2026 HandicapSkater.org.</p>
    <p class="footer-description">HandicapSkater.org provides standards, review frameworks, and public accessibility guidance.<br />The individual evidence record lives on HandicapSkater.com.</p>
  </div>
</footer>
`;
})();
