(function () {
  const config = {
    brand: "HandicapSkater.org",
    brandHomeControl: true,
    primaryLinks: [
      {
        key: "standards",
        label: "Standards",
        match: ["/standards/", "/non-standard-mobility-aids/"],
        menuGroups: [
          {
            links: [
              { href: "/standards/", label: "Standards Overview", match: ["/standards/"] },
              {
                href: "/non-standard-mobility-aids/",
                label: "Mobility-Aid Principles",
                match: ["/non-standard-mobility-aids/"]
              },
              {
                href: "/non-standard-mobility-aids/#function-before-appearance",
                label: "Function Before Appearance",
                match: []
              },
              { href: "/standards/#framework", label: "Individualized Assessment", match: [] },
              {
                href: "/transportation-accommodation/#review",
                label: "Physical Accommodation",
                match: []
              }
            ]
          }
        ]
      },
      {
        key: "safety-review",
        label: "Safety Review",
        match: ["/direct-threat-analysis/"],
        menuGroups: [
          {
            links: [
              {
                href: "/direct-threat-analysis/",
                label: "Direct-Threat Analysis",
                match: ["/direct-threat-analysis/"]
              },
              { href: "/direct-threat-analysis/#analysis", label: "Actual Risk", match: [] },
              {
                href: "/direct-threat-analysis/#environment-specific-review",
                label: "Environment-Specific Review",
                match: []
              }
            ]
          }
        ]
      },
      {
        key: "transportation",
        label: "Transportation",
        match: ["/transportation-accommodation/"],
        menuGroups: [
          {
            links: [
              {
                href: "/transportation-accommodation/",
                label: "Transportation Accommodation",
                match: ["/transportation-accommodation/"]
              },
              {
                href: "/transportation-accommodation/#effective-alternatives",
                label: "Effective Alternatives",
                match: []
              },
              {
                href: "/transportation-accommodation/#avoidable-access-burden",
                label: "Avoidable Access Burden",
                match: []
              }
            ]
          }
        ]
      },
      {
        key: "evidence-quality",
        label: "Evidence Quality",
        match: ["/evidence-quality/", "/evidence-review/", "/reviewer-guidance/"],
        menuGroups: [
          {
            links: [
              {
                href: "/evidence-review/",
                label: "Evidence Review Method",
                match: ["/evidence-review/"]
              },
              {
                href: "/evidence-quality/",
                label: "Evidence Quality Overview",
                match: ["/evidence-quality/"]
              },
              { href: "/references/#sources", label: "Sources and Provenance", match: [] },
              {
                href: "/evidence-quality/#quality",
                label: "Sample Size and Missingness",
                match: []
              },
              {
                href: "/reviewer-guidance/",
                label: "Reviewer Guidance",
                match: ["/reviewer-guidance/"]
              }
            ]
          }
        ]
      },
      {
        key: "more",
        label: "More",
        match: ["/timeline/", "/references/"],
        menuGroups: [
          {
            links: [
              { href: "/timeline/", label: "DOT / FTA / DOJ Timeline", match: ["/timeline/"] },
              {
                href: "/non-standard-mobility-aids/",
                label: "Non-Standard Mobility Aids",
                match: []
              },
              { href: "/references/", label: "References", match: ["/references/"] },
              { href: "/evidence-quality/#terminology", label: "Terminology", match: [] },
              {
                href: "https://handicapskater.com/evidence/",
                label: "Individual Case Study & Evidence on HandicapSkater.com",
                match: []
              }
            ]
          }
        ]
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
