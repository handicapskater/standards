(function () {
  const config = {
    brand: "HandicapSkater.org",
    brandHomeControl: true,
    primaryLinks: [
      {
        key: "principles",
        label: "Principles",
        match: [
          "/direct-threat-analysis/",
          "/actual-risk/",
          "/body-coupling/",
          "/hypothesis-registry/",
          "/federal-source-anchors/",
          "/non-standard-mobility-aids/"
        ],
        menuGroups: [
          {
            links: [
              { href: "/direct-threat-analysis/", label: "01 Direct Threat", match: ["/direct-threat-analysis/"] },
              { href: "/actual-risk/", label: "02 Actual Risk", match: ["/actual-risk/"] },
              { href: "/body-coupling/", label: "03 Body Coupling", match: ["/body-coupling/"] },
              { href: "/hypothesis-registry/", label: "04 Hypothesis Registry", match: ["/hypothesis-registry/"] },
              { href: "/federal-source-anchors/", label: "05 Federal Source Anchors", match: ["/federal-source-anchors/"] },
              { href: "/non-standard-mobility-aids/", label: "06 Non-Standard Mobility Aid", match: ["/non-standard-mobility-aids/"] }
            ]
          }
        ]
      },
      { href: "/reviewer-guidance/", label: "Reviewer Guidance", match: ["/reviewer-guidance/"] },
      { href: "/standards/", label: "Review Framework", match: ["/standards/"] },
      {
        key: "resources",
        label: "Resources",
        match: ["/evidence-review/", "/evidence-quality/", "/transportation-accommodation/", "/timeline/", "/references/"],
        menuGroups: [
          {
            links: [
              { href: "/evidence-review/", label: "Evidence Review Method", match: ["/evidence-review/"] },
              { href: "/evidence-quality/", label: "Evidence Quality", match: ["/evidence-quality/"] },
              { href: "/transportation-accommodation/", label: "Transportation Accommodation", match: ["/transportation-accommodation/"] },
              { href: "/timeline/", label: "DOT / FTA / DOJ Timeline", match: ["/timeline/"] },
              { href: "/references/", label: "References", match: ["/references/"] }
            ]
          }
        ]
      },
      {
        href: "https://handicapskater.com/platform/",
        label: "Explore Evidence",
        match: []
      }
    ]
  };

  function isMenuLink(link) {
    return Array.isArray(link.menuGroups) && link.menuGroups.length > 0;
  }

  function normalizePath(pathname) {
    if (!pathname || pathname === "/index.html" || pathname === "/index.htm") {
      return "/";
    }

    if (pathname.endsWith("/index.html")) {
      return pathname.replace(/index\.html$/, "");
    }

    if (pathname.endsWith("/index.htm")) {
      return pathname.replace(/index\.htm$/, "");
    }

    return pathname;
  }

  function linkMatchesPath(link, path) {
    const href = link.href || "";
    const match = Array.isArray(link.match) ? link.match : [];

    return !href.startsWith("http") && match.includes(path);
  }

  function renderNavLink(link, path) {
    const href = link.href || "#";
    const external = href.startsWith("http");
    const active = linkMatchesPath(link, path) ? ' aria-current="page"' : "";
    const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
    const className = external ? ' class="nav-link external-link"' : ' class="nav-link"';

    return `<a${className} href="${href}"${active}${attrs}>${link.label || ""}</a>`;
  }

  function renderMenuGroup(group, path) {
    const links = Array.isArray(group.links) ? group.links : [];
    const groupLabel = group.label
      ? `<p class="nav-menu-group-label">${group.label}</p>`
      : "";
    const menuLinks = links.map((link) => renderNavLink(link, path)).join("");

    return `<div class="nav-menu-group">${groupLabel}${menuLinks}</div>`;
  }

  function renderNavMenu(item, path) {
    const groups = Array.isArray(item.menuGroups) ? item.menuGroups : [];
    const links = groups.flatMap((group) => (Array.isArray(group.links) ? group.links : []));
    if (links.length === 0) {
      return "";
    }

    const active = linkMatchesPath(item, path) || links.some((link) => linkMatchesPath(link, path));
    const activeClass = active ? " is-active" : "";
    const menuId = `nav-menu-${item.key || "section"}`;

    return `
      <details class="nav-more${activeClass}">
        <summary class="nav-more-summary" aria-controls="${menuId}">${item.label || "More"}</summary>
        <div class="nav-more-menu" id="${menuId}">
          ${groups.map((group) => renderMenuGroup(group, path)).join("")}
        </div>
      </details>
    `;
  }

  function renderPrimaryNav(path) {
    return config.primaryLinks
        .map((link) => (isMenuLink(link) ? renderNavMenu(link, path) : renderNavLink(link, path)))
        .join("");
  }

  function closeAllMoreMenus(root) {
    const scope = root || document;

    scope.querySelectorAll(".nav-more[open]").forEach((details) => {
      details.removeAttribute("open");
    });
  }

  function wireMoreMenuCloseBehavior(root) {
    const header = root || document;

    header.querySelectorAll(".nav-more").forEach((details) => {
      const summary = details.querySelector(".nav-more-summary");
      const menu = details.querySelector(".nav-more-menu");

      if (!summary || !menu) {
        return;
      }

      menu.addEventListener("click", function (event) {
        if (event.target.closest("a")) {
          details.removeAttribute("open");
        }
      });

      details.addEventListener("toggle", function () {
        if (!details.open) {
          return;
        }
        header.querySelectorAll(".nav-more[open]").forEach((other) => {
          if (other !== details) {
            other.removeAttribute("open");
          }
        });
      });
    });

    document.addEventListener("pointerdown", function (event) {
      const openMenu = document.querySelector(".nav-more[open]");

      if (openMenu && !openMenu.contains(event.target)) {
        openMenu.removeAttribute("open");
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") {
        return;
      }

      const openMenu = document.querySelector(".nav-more[open]");
      if (!openMenu) {
        return;
      }

      const summary = openMenu.querySelector(".nav-more-summary");
      openMenu.removeAttribute("open");

      if (summary) {
        summary.focus();
      }
    });

    document.addEventListener("focusin", function (event) {
      const openMenu = document.querySelector(".nav-more[open]");

      if (openMenu && !openMenu.contains(event.target)) {
        openMenu.removeAttribute("open");
      }
    });

    window.addEventListener(
        "scroll",
        function () {
          closeAllMoreMenus(document);
        },
        { passive: true }
    );

    window.addEventListener("resize", function () {
      closeAllMoreMenus(document);
    });
  }

  function renderSiteHeader() {
    const mount = document.getElementById("site-header");
    if (!mount) {
      return;
    }

    const path = normalizePath(window.location.pathname);
    const primaryNavHtml = renderPrimaryNav(path);
    const brandCurrent = config.brandHomeControl && path === "/" ? ' aria-current="page"' : "";
    const brandAriaLabel = config.brandHomeControl ? ` aria-label="${config.brand} home"` : "";

    mount.outerHTML = `
      <header class="site-header" data-site-host="handicapskater.org">
        <div class="nav-wrap">
          <a class="brand" href="/"${brandCurrent}${brandAriaLabel}>${config.brand}</a>
          <nav class="site-nav" aria-label="Primary navigation">
            ${primaryNavHtml}
          </nav>
        </div>
      </header>
      <aside class="evidence-authority-strip" aria-label="Scientific evidence authority">
        <span>Scientific evidence authority</span>
        <a href="https://handicapskater.com/platform/">Evidence Observatory</a>
      </aside>
    `;

    const header = document.querySelector(".site-header[data-site-host]");
    if (header) {
      wireMoreMenuCloseBehavior(header);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", renderSiteHeader);
  } else {
    renderSiteHeader();
  }
})();

function normalizeSectionAlternation() {
  const sections = Array.from(document.querySelectorAll("main > section.section"));

  sections.forEach((section, index) => {
    section.classList.toggle("alt", index % 2 === 1);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", normalizeSectionAlternation);
} else {
  normalizeSectionAlternation();
}
