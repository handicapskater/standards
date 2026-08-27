(function () {
  const mount = document.getElementById("site-footer");
  if (!mount) return;

  const eyebrowRules = [
    [/federal|primary source|authority|law|guidance/i, "Law & guidance"],
    [/risk|threat|qualification/i, "Actual-risk review"],
    [/function|mobility aid|body coupled/i, "Mobility function"],
    [/framework|written record|decision|review|protocol/i, "Proposed standard"],
    [/terminology|settings|counts as/i, "Review method"],
    [/evidence|canonical/i, "Evidence access"],
    [/.*/, "Key principle"],
  ];

  const addSectionEyebrows = () => {
    document.querySelectorAll("main section h2").forEach((heading) => {
      if (heading.parentElement.querySelector(":scope > .eyebrow")) return;
      const eyebrow = document.createElement("p");
      eyebrow.className = "eyebrow";
      eyebrow.textContent = eyebrowRules.find(([pattern]) => pattern.test(heading.textContent))[1];
      heading.before(eyebrow);
    });
  };

  addSectionEyebrows();
  new MutationObserver(addSectionEyebrows).observe(document.querySelector("main"), {
    childList: true,
    subtree: true,
  });

  mount.innerHTML = `
<footer class="site-footer">
  <div class="footer-inner">
    <p class="footer-copy">Copyright © 2004 to 2026 <span class="small-caps">HandicapSkater</span>.</p>
    <p class="footer-description"><span class="small-caps">HandicapSkater.org</span> presents a proposed, function-first protocol for evaluating non-standard mobility aids. It separates current law and guidance, case-derived lessons, and proposed standards.</p>
  </div>
</footer>
`;
})();
