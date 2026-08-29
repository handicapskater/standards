/* Public Lab destination. */
(function () {
  const PUBLIC_EVIDENCE_OBSERVATORY_URL = "https://evidence.handicapskater.com/";
  window.PUBLIC_EVIDENCE_OBSERVATORY_URL = PUBLIC_EVIDENCE_OBSERVATORY_URL;
  function connect() { document.querySelectorAll("[data-evidence-observatory-link]").forEach((link) => { link.href = PUBLIC_EVIDENCE_OBSERVATORY_URL; link.target = "_blank"; link.rel = "noopener noreferrer"; }); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", connect); else connect();
})();
