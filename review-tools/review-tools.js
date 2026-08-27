(() => {
  "use strict";
  const addRow = (templateId, containerSelector) => {
    const template = document.getElementById(templateId);
    const container = document.querySelector(containerSelector);
    if (!template || !container) return;
    const fragment = template.content.cloneNode(true);
    const index = container.children.length + 1;
    fragment.querySelectorAll("[name]").forEach((control) => { control.name = `${control.name}-${index}`; });
    container.append(fragment);
  };
  document.addEventListener("DOMContentLoaded", () => {
    addRow("hazard-template", "[data-hazard-list]");
    addRow("mitigation-template", "[data-mitigation-list]");
    document.addEventListener("click", (event) => {
      if (event.target.matches("[data-print]")) {
        const section = event.target.closest(".form-section");
        if (section) {
          document.body.classList.add("print-active");
          section.classList.add("print-target");
        }
        window.print();
      }
      if (event.target.matches("[data-add-hazard]")) addRow("hazard-template", "[data-hazard-list]");
      if (event.target.matches("[data-add-mitigation]")) addRow("mitigation-template", "[data-mitigation-list]");
      if (event.target.matches("[data-remove-row]")) event.target.closest(".repeat-card")?.remove();
      if (event.target.matches("[data-clear-form]")) { const form = event.target.closest("form"); if (form && window.confirm("Clear the entries in this form? This cannot be undone.")) form.reset(); }
    });
    window.addEventListener("afterprint", () => {
      document.body.classList.remove("print-active");
      document.querySelectorAll(".print-target").forEach((section) => section.classList.remove("print-target"));
    });
  });
})();
