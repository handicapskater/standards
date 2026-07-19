(function () {
  "use strict";

  const ROOT = "/data/public/reviewer-guidance/v1/";
  const CONTRACT = "fsicss_publication_bundle.v1";
  const DESTINATION = "handicapskater.org";
  const GRAPH_VERSION = "fsi_publication_graph.v1";
  const ALLOWED_EXAMPLES = new Set(["mobility_output_and_burden", "transport_coupling_profiles"]);
  const cache = new Map();

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = String(text);
    return node;
  }

  function safePath(path) {
    return (
      typeof path === "string" &&
      path.length > 0 &&
      !path.startsWith("/") &&
      !path.includes("\\") &&
      !path.split("/").includes("..") &&
      path.endsWith(".json")
    );
  }

  function fetchJson(path) {
    if (!safePath(path)) return Promise.reject(new Error("Unsafe publication path"));
    if (!cache.has(path)) {
      cache.set(
        path,
        fetch(ROOT + path, { cache: "no-store", credentials: "same-origin" }).then(function (response) {
          if (!response.ok) throw new Error("Publication resource unavailable");
          return response.json();
        })
      );
    }
    return cache.get(path);
  }

  function validateManifest(manifest) {
    if (
      !manifest ||
      manifest.publication_contract_version !== CONTRACT ||
      manifest.destination !== DESTINATION ||
      manifest.status !== "ok" ||
      !Array.isArray(manifest.graphs)
    ) {
      throw new Error("Reviewer publication unavailable");
    }
    return manifest;
  }

  function graph(manifest, id) {
    if (!ALLOWED_EXAMPLES.has(id)) return Promise.reject(new Error("Case example not allowed"));
    const entry = manifest.graphs.find(function (item) {
      return item && item.graph_id === id;
    });
    if (!entry || !safePath(entry.path)) return Promise.reject(new Error("Case example unavailable"));
    return fetchJson(entry.path).then(function (payload) {
      if (
        !payload ||
        payload.graph_id !== id ||
        payload.destination !== DESTINATION ||
        payload.graph_contract_version !== GRAPH_VERSION ||
        payload.content_hash !== entry.content_hash ||
        payload.case_example_label !== "Individual case-study example" ||
        !String(payload.canonical_case_route || "").startsWith("https://handicapskater.com/")
      ) {
        throw new Error("Case-example contract mismatch");
      }
      return payload;
    });
  }

  function displayNumber(value) {
    if (value === null || value === undefined || !Number.isFinite(Number(value))) return "Unavailable";
    const numeric = Number(value);
    const magnitude = Math.abs(numeric);
    const digits = magnitude >= 100 ? 1 : magnitude >= 10 ? 2 : magnitude >= 1 ? 3 : 4;
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(numeric);
  }

  function detailed(value) {
    if (value === null || value === undefined || value === "") return "Unavailable";
    if (Array.isArray(value)) return value.join(" / ");
    return String(value);
  }

  function sampleText(value) {
    if (!value || typeof value !== "object") return detailed(value);
    return Object.keys(value)
      .map(function (key) {
        const item = value[key];
        if (item && typeof item === "object") {
          return key + ": components n=" + item.components + ", FSI n=" + item.fsi;
        }
        return key + ": n=" + item;
      })
      .join("; ");
  }

  function unavailable(mount) {
    mount.replaceChildren();
    const note = element("div", "publication-unavailable");
    note.setAttribute("role", "status");
    note.appendChild(element("strong", "", "Individual case-study example unavailable"));
    note.appendChild(
      element(
        "p",
        "",
        "The generalized standards above remain complete without the optional publication enhancement."
      )
    );
    mount.appendChild(note);
  }

  function status(mount, manifest) {
    mount.replaceChildren();
    const note = element("div", "publication-status");
    note.setAttribute("role", "status");
    note.appendChild(element("strong", "", "Reviewer publication status: available"));
    note.appendChild(element("p", "publication-meta", "Case-study projection data through " + manifest.data_through_date + "."));
    mount.appendChild(note);
  }

  function setBarSize(node, value, maximum) {
    const numeric = Number(value);
    const max = Number(maximum);
    const percent = Number.isFinite(numeric) && Number.isFinite(max) && max > 0 ? (numeric / max) * 100 : 0;
    node.style.setProperty("--bar-size", Math.max(0, Math.min(100, percent)).toFixed(3) + "%");
  }

  function barPanel(series) {
    const panel = element("section", "publication-graph-panel");
    panel.setAttribute("role", "group");
    panel.setAttribute("aria-label", series.title);
    panel.appendChild(element("h3", "", series.title + " (" + series.unit + ")"));
    const points = (series.points || []).filter(function (point) {
      return point && point.value !== null && point.value !== undefined && Number.isFinite(Number(point.value));
    });
    const maximum = Math.max.apply(
      null,
      points.map(function (point) { return Number(point.value); }).concat([0])
    );
    const bars = element("div", "publication-bars");
    points.forEach(function (point) {
      const row = element("div", "publication-bar-row");
      row.appendChild(element("span", "publication-bar-label", point.label || point.id));
      const track = element("div", "publication-bar-track");
      const bar = element("div", "publication-bar");
      setBarSize(bar, point.value, maximum);
      bar.setAttribute("aria-hidden", "true");
      track.appendChild(bar);
      track.appendChild(
        element(
          "span",
          "publication-bar-value",
          displayNumber(point.value) + " " + (point.unit || series.unit) + (point.sample_count ? " · n=" + point.sample_count : "")
        )
      );
      row.appendChild(track);
      bars.appendChild(row);
    });
    panel.appendChild(bars);
    return panel;
  }

  function selectedSeries(payload) {
    const ids = payload.graph_id === "mobility_output_and_burden"
      ? new Set(["distance_miles", "burden_per_mile"])
      : new Set(["fsi", "cumulative_dynamic_shock"]);
    return (payload.series || []).filter(function (series) {
      return ids.has(series.series_id);
    });
  }

  function tableModel(payload) {
    if (payload.graph_id === "mobility_output_and_burden") {
      return {
        columns: [
          ["label", "Cohort"],
          ["distance_miles", "Distance (miles)"],
          ["distance_sample_count", "Distance n"],
          ["absolute_burden", "Observed burden (g*s)"],
          ["burden_sample_count", "Burden n"],
          ["burden_per_mile", "Burden per mile (g*s/mile)"],
          ["data_through_date", "Data through"]
        ],
        rows: payload.accessible_table || []
      };
    }
    return {
      columns: [
        ["label", "Transport cohort"],
        ["body_coupling_class", "Body coupling"],
        ["duration_minutes", "Duration (minutes)"],
        ["fsi", "FSI (unitless index)"],
        ["fsi_sample_count", "FSI n"],
        ["component_sample_count", "Component n"],
        ["data_through_date", "Data through"]
      ],
      rows: payload.accessible_table || []
    };
  }

  function table(payload) {
    const model = tableModel(payload);
    const wrap = element("div", "publication-table-wrap");
    const node = element("table", "publication-table");
    node.appendChild(element("caption", "", "Accessible values supplied by the labeled case-example payload."));
    const head = element("thead");
    const headRow = element("tr");
    model.columns.forEach(function (column) { headRow.appendChild(element("th", "", column[1])); });
    head.appendChild(headRow);
    node.appendChild(head);
    const body = element("tbody");
    model.rows.forEach(function (row) {
      const tableRow = element("tr");
      model.columns.forEach(function (column) {
        tableRow.appendChild(element("td", "", detailed(row[column[0]])));
      });
      body.appendChild(tableRow);
    });
    node.appendChild(body);
    wrap.appendChild(node);
    return wrap;
  }

  function list(parent, items, className) {
    if (!Array.isArray(items) || !items.length) return;
    const node = element("ul", className);
    items.forEach(function (item) { node.appendChild(element("li", "", item)); });
    parent.appendChild(node);
  }

  function renderExample(mount, payload) {
    mount.replaceChildren();
    const example = element("article", "case-example");
    example.appendChild(element("p", "case-example-label", "Individual case-study example"));
    example.appendChild(element("h2", "", payload.title.replace(/^Individual case-study example — /, "")));
    example.appendChild(element("p", "", payload.interpretation));
    example.appendChild(element("p", "publication-meta", payload.method_disclosure));

    const chips = element("div", "publication-chips");
    chips.appendChild(element("span", "publication-chip", "Samples: " + sampleText(payload.sample_counts)));
    chips.appendChild(element("span", "publication-chip", "Units: " + (payload.units || []).join(", ")));
    chips.appendChild(element("span", "publication-chip", "Data through: " + payload.data_through_date));
    example.appendChild(chips);

    const panels = element("div", "publication-graph-panels");
    selectedSeries(payload).forEach(function (series) { panels.appendChild(barPanel(series)); });
    example.appendChild(panels);

    const source = element("div", "publication-sources");
    source.appendChild(element("h3", "", "Source scope"));
    list(source, payload.source_labels, "publication-source-list");
    example.appendChild(source);
    const limits = element("div", "publication-limitations");
    limits.appendChild(element("h3", "", "Limitations"));
    list(limits, payload.limitations, "publication-limitation-list");
    example.appendChild(limits);

    const details = element("details", "publication-details");
    details.appendChild(element("summary", "", "Open accessible case-example table"));
    details.appendChild(table(payload));
    example.appendChild(details);

    const link = element("a", "button button-secondary", "Review the canonical individual evidence on HandicapSkater.com");
    link.href = payload.canonical_case_route;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    example.appendChild(link);
    mount.appendChild(example);
  }

  function start() {
    fetchJson("manifest.json")
      .then(validateManifest)
      .then(function (manifest) {
        document.querySelectorAll("[data-reviewer-publication-status]").forEach(function (mount) {
          status(mount, manifest);
        });
        document.querySelectorAll("[data-reviewer-example]").forEach(function (mount) {
          graph(manifest, mount.dataset.reviewerExample)
            .then(function (payload) { renderExample(mount, payload); })
            .catch(function () { unavailable(mount); });
        });
      })
      .catch(function () {
        document.querySelectorAll("[data-reviewer-publication-status], [data-reviewer-example]").forEach(function (mount) {
          unavailable(mount);
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
