/* Private records remain inside the authenticated portal origin, never these forms. */
(() => {
  "use strict";
  const portal = "https://hs-portal-324477223314.us-central1.run.app";
  const section = document.createElement("section");
  section.id = "registered-review"; section.className = "section no-print";
  const heading = document.createElement("h2"); heading.textContent = "Save and resume a mobility-aid review";
  const text = document.createElement("p");
  text.textContent = "The public framework and printable tools remain available below. Request an account to save progress. Approved review access is separate from the guided case demonstration. This preview uses example cases only; please do not submit personal or medical information.";
  const links = document.createElement("nav"); links.className = "button-row"; links.setAttribute("aria-label", "Registered mobility-review access");
  const target = window.location.origin + "/review-tools/#registered-review";
  for (const [label, path] of [["Request access", "/register"], ["Sign in", "/signin"]]) {
    const a = document.createElement("a"); a.className = "button button-primary"; a.textContent = label;
    a.href = portal + path + "?return_to=" + encodeURIComponent(target); links.append(a);
  }
  const frame = document.createElement("iframe"); frame.title = "Your registered mobility-aid review";
  frame.src = portal + "/embed/nsmaep?parent_origin=" + encodeURIComponent(window.location.origin);
  frame.referrerPolicy = "no-referrer"; frame.allow = "storage-access";
  frame.style.cssText = "display:block;width:100%;border:1px solid #83958b;border-radius:8px;min-height:230px;margin-top:1rem";
  section.append(heading, text, links, frame);
  const hero = document.querySelector("main > .hero");
  if (hero) hero.after(section); else document.querySelector("main")?.prepend(section);
  window.addEventListener("message", (event) => {
    if (event.origin !== portal || event.source !== frame.contentWindow) return;
    if (event.data?.type === "hs-size" && Number.isFinite(event.data.height)) frame.style.height = Math.max(230, Math.min(5000, event.data.height + 24)) + "px";
  });
  if (window.location.hash === "#registered-review") section.scrollIntoView({block:"start"});
})();
