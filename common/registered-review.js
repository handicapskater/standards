/* Public shell only. Authorization, questionnaire and answers stay in the portal. */
(() => {
  "use strict";
  const portal = "https://hs-portal-324477223314.us-central1.run.app";
  const origins = ["https://handicapskater.org", "https://www.handicapskater.org"];
  if (!origins.includes(window.location.origin)) return;
  const mount = document.getElementById("registered-review-panel");
  if (!mount) return;
  const frame = document.createElement("iframe");
  frame.title = "Your registered mobility-aid review";
  frame.src = portal + "/embed/nsmaep?parent_origin=" + encodeURIComponent(window.location.origin);
  frame.referrerPolicy = "no-referrer";
  frame.allow = "storage-access";
  mount.append(frame);
  window.addEventListener("message", (event) => {
    if (event.origin !== portal || event.source !== frame.contentWindow) return;
    if (event.data?.type === "hs-size" && Number.isFinite(event.data.height)) {
      frame.style.height = Math.max(230, Math.min(5000, event.data.height + 24)) + "px";
    }
    // A boolean presentation hint is not authority to retrieve any private data.
    if (event.data?.type === "hs-review-access" && typeof event.data.available === "boolean") {
      document.getElementById("review-access-links").hidden = event.data.available;
      document.getElementById("review-access-heading").textContent = event.data.available
        ? "Start or continue my mobility-aid review"
        : "Sign in to start or continue your review";
    }
  });
})();
