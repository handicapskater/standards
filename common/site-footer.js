(function () {
  const mount = document.getElementById("site-footer");
  if (!mount) return;

  const eyebrowRules = [
    [/federal|primary source|authority|materials/i, "Primary authority"],
    [/hypothesis|scientific claim|registry/i, "Research protocol"],
    [/risk|threat|qualification/i, "Risk review"],
    [/function|mobility aid|body coupled/i, "Functional mobility"],
    [/framework|written record|decision|review/i, "Review framework"],
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
    <p class="footer-description"><span class="small-caps">HandicapSkater</span> separates physiologic burden, mechanical motion exposure, and body coupling so mobility aid review can preserve context. This site presents generalized review standards and evidence frameworks.</p>
  </div>
</footer>
`;
})();
