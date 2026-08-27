(function () {
  "use strict";

  const ROOT = "/data/public/reviewer-guidance/v1/";
  const CONTRACT = "fsicss_publication_bundle.v1";
  const DESTINATION = "handicapskater.org";
  const RESOURCE_VERSION = "fsi_publication_resource.v1";
  const GRAPH_VERSION = "fsi_publication_graph.v1";
  const ALLOWED_EXAMPLES = new Set([
    "walking_vs_mall_accumulated_mechanical_load",
    "triplet_functional_output_context",
    "fns_sns_longitudinal_functional_capacity",
    "transportation_body_coupling_comparison"
  ]);
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

  function fetchJson(path, contentHash) {
    if (!safePath(path)) return Promise.reject(new Error("Unsafe publication path"));
    if (contentHash !== undefined && !/^[a-f0-9]{64}$/.test(String(contentHash))) {
      return Promise.reject(new Error("Invalid reviewer publication content hash"));
    }
    const requestPath = contentHash ? path + "?v=" + contentHash : path;
    if (!cache.has(requestPath)) {
      cache.set(
        requestPath,
        fetch(ROOT + requestPath, { cache: "no-store", credentials: "same-origin" }).then(function (response) {
          if (!response.ok) throw new Error("Publication resource unavailable");
          return response.json();
        })
      );
    }
    return cache.get(requestPath);
  }

  function validateManifest(manifest) {
    if (
      !manifest ||
      manifest.publication_contract_version !== CONTRACT ||
      manifest.destination !== DESTINATION ||
      manifest.status !== "ok" ||
      !Array.isArray(manifest.resources) ||
      !Array.isArray(manifest.graphs)
    ) {
      throw new Error("Reviewer publication unavailable");
    }
    return manifest;
  }

  function resource(manifest, id) {
    const entry = manifest.resources.find(function (item) {
      return item && item.resource_id === id;
    });
    if (!entry || !safePath(entry.path)) return Promise.reject(new Error("Reviewer resource unavailable"));
    return fetchJson(entry.path, entry.content_hash).then(function (payload) {
      if (
        !payload ||
        payload.resource_id !== id ||
        payload.destination !== DESTINATION ||
        payload.resource_version !== RESOURCE_VERSION ||
        payload.content_hash !== entry.content_hash
      ) {
        throw new Error("Reviewer resource contract mismatch");
      }
      return payload;
    });
  }

  function graph(manifest, id) {
    if (!ALLOWED_EXAMPLES.has(id)) return Promise.reject(new Error("Case example not allowed"));
    const entry = manifest.graphs.find(function (item) {
      return item && item.graph_id === id;
    });
    if (!entry || !safePath(entry.artifact_path)) return Promise.reject(new Error("Case example unavailable"));
    return fetchJson(entry.artifact_path, entry.content_hash).then(function (payload) {
      if (
        !payload ||
        payload.graph_id !== id ||
        payload.destination !== DESTINATION ||
        entry.destination !== DESTINATION ||
        entry.page !== payload.intended_route ||
        payload.graph_contract_version !== GRAPH_VERSION ||
        payload.content_hash !== entry.content_hash ||
        payload.case_example_label !== "N-of-1 case study example" ||
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

  function unavailable(mount, error) {
    mount.replaceChildren();
    mount.dataset.state = "unavailable";
    if (error) {
      mount.dataset.reviewerPublicationError = error instanceof Error ? error.message : String(error);
      console.error("[reviewer-publication]", mount.dataset.reviewerPublicationError);
    }
    const note = element("div", "publication-unavailable");
    note.setAttribute("role", "status");
    note.appendChild(element("strong", "", "N-of-1 case study example unavailable"));
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
    return (payload.series || []).filter(function (series) {
      return Array.isArray(series.points) && series.points.length;
    }).slice(0, 3);
  }

  function svgNode(tag, attributes) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.keys(attributes || {}).forEach(function (key) { node.setAttribute(key, attributes[key]); });
    return node;
  }

  function linePanel(title, unit, groups, options) {
    const settings = options || {};
    const compact = settings.compact === true;
    const role = settings.role || "primary";
    const panel = element("section", "publication-graph-panel publication-line-panel publication-line-panel-" + role);
    panel.dataset.presentationRole = role;
    panel.dataset.heightBudget = compact ? "compact" : "standard";
    panel.appendChild(element("h3", "", title + " (" + unit + ")"));
    const all = groups.flatMap(function (group) { return group.points || []; }).filter(function (point) { return Number.isFinite(Number(point.value)) && Number.isFinite(Date.parse(String(point.date))); });
    if (!all.length) return panel;
    const width = 760, height = compact ? 150 : 250, left = 72, right = 22, top = 22, bottom = compact ? 42 : 58;
    const dates = Array.from(new Set(all.map(function (point) { return String(point.date); }))).sort();
    const values = all.map(function (point) { return Number(point.value); }), min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    const times = dates.map(Date.parse), firstTime = Math.min.apply(null, times), lastTime = Math.max.apply(null, times);
    const x = function (date) { return left + ((Date.parse(String(date)) - firstTime) / (lastTime - firstTime || 1)) * (width - left - right); };
    const y = function (value) { return top + (1 - (Number(value) - min) / (max - min || 1)) * (height - top - bottom); };
    const svg = svgNode("svg", { viewBox: "0 0 " + width + " " + height, class: "publication-line-chart" + (compact ? " publication-line-chart-compact" : ""), role: "img", "aria-label": title + " by date", "data-date-min": dates[0], "data-date-max": dates[dates.length - 1] });
    (compact ? [0, .5, 1] : [0, .25, .5, .75, 1]).forEach(function (ratio) { const yy = top + ratio * (height - top - bottom); svg.appendChild(svgNode("line", { x1: left, x2: width - right, y1: yy, y2: yy, class: "publication-grid-line" })); const label = svgNode("text", { x: left - 10, y: yy + 4, class: "publication-axis-label", "text-anchor": "end" }); label.textContent = displayNumber(max - ratio * (max - min)); svg.appendChild(label); });
    [dates[0], dates[Math.floor((dates.length - 1) / 2)], dates[dates.length - 1]].forEach(function (date, index) { const label = svgNode("text", { x: x(date), y: height - 18, class: "publication-axis-label", "text-anchor": index === 0 ? "start" : index === 2 ? "end" : "middle" }); label.textContent = date; svg.appendChild(label); });
    groups.forEach(function (group, index) {
      const points = group.points.filter(function (point) { return Number.isFinite(Number(point.value)) && Number.isFinite(Date.parse(String(point.date))); }).sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
      if (!group.rawOnly) svg.appendChild(svgNode("polyline", { points: points.map(function (point) { return x(point.date) + "," + y(point.value); }).join(" "), class: "publication-series publication-series-" + index, fill: "none" }));
      const trend = (group.trendPoints || []).filter(function (point) { return Number.isFinite(Number(point.value)) && Number.isFinite(Date.parse(String(point.date))); }).sort(function (a, b) { return String(a.date).localeCompare(String(b.date)); });
      if (trend.length > 1) svg.appendChild(svgNode("polyline", { points: trend.map(function (point) { return x(point.date) + "," + y(point.value); }).join(" "), class: "publication-trend publication-series-" + index, fill: "none" }));
      points.forEach(function (point) { const dot = svgNode("circle", { cx: x(point.date), cy: y(point.value), r: all.length > 120 ? 2 : 3.5, class: "publication-point publication-series-" + index, tabindex: "0" }); dot.setAttribute("aria-label", group.label + ", " + point.date + ", " + displayNumber(point.value) + " " + unit); const title = svgNode("title"); title.textContent = dot.getAttribute("aria-label"); dot.appendChild(title); svg.appendChild(dot); });
    });
    panel.appendChild(svg);
    const legend = element("div", "publication-line-legend");
    groups.forEach(function (group, index) { legend.appendChild(element("span", "publication-legend-item publication-legend-" + index, group.label)); });
    panel.appendChild(legend);
    return panel;
  }

  function reviewerTimeSeriesHierarchy(payload) {
    const sourcePanels = Array.isArray(payload.series) && payload.series.length ? payload.series : (payload.panels || []);
    const governedRoles = sourcePanels.map(function (item) { return item.presentation_role; });
    const usesGovernedRoles = governedRoles.some(function (role) { return role !== undefined && role !== null; });
    if (usesGovernedRoles && (governedRoles.some(function (role) { return !["primary", "secondary", "detail"].includes(role); }) || governedRoles.filter(function (role) { return role === "primary"; }).length !== 1)) {
      throw new Error("Invalid governed presentation hierarchy: " + payload.graph_id);
    }
    const assigned = sourcePanels.map(function (item, index) {
      const role = usesGovernedRoles ? item.presentation_role : (index === 0 ? "primary" : "detail");
      return {
        item: item,
        role: role,
        groups: (item.series || []).map(function (series) { return { label: series.label || series.id || "Series", points: series.points || [], rawOnly: true }; })
      };
    });
    const wrapper = element("div", "publication-time-series-hierarchy");
    wrapper.dataset.initialHeightBudget = "one-chart-card";
    wrapper.dataset.presentationAuthority = usesGovernedRoles ? "governed" : "legacy-compatible";
    const primary = element("div", "publication-time-series-primary");
    const secondary = element("div", "publication-time-series-secondary");
    const detailItems = assigned.filter(function (entry) { return entry.role === "detail"; });
    assigned.filter(function (entry) { return entry.role === "primary"; }).forEach(function (entry) { primary.appendChild(linePanel(entry.item.title, entry.item.unit, entry.groups, { role: "primary" })); });
    assigned.filter(function (entry) { return entry.role === "secondary"; }).forEach(function (entry) { secondary.appendChild(linePanel(entry.item.title, entry.item.unit, entry.groups, { role: "secondary", compact: true })); });
    wrapper.appendChild(primary);
    if (assigned.some(function (entry) { return entry.role === "secondary"; })) wrapper.appendChild(secondary);
    if (detailItems.length) {
      const details = element("details", "publication-details publication-time-series-details");
      details.appendChild(element("summary", "", "More case-example metrics (" + detailItems.length + ")"));
      const detailGrid = element("div", "publication-time-series-detail-grid");
      detailItems.forEach(function (entry) { detailGrid.appendChild(linePanel(entry.item.title, entry.item.unit, entry.groups, { role: "detail", compact: true })); });
      details.appendChild(detailGrid);
      wrapper.appendChild(details);
    }
    return wrapper;
  }

  function exampleVisual(payload) {
    if (payload.graph_id === "walking_vs_mall_accumulated_mechanical_load") {
      const panels = element("div", "publication-graph-panels publication-graph-panels-single");
      (payload.panels || []).forEach(function (series) { const pairs = series.pairs || []; panels.appendChild(linePanel(series.title, series.unit, [
        { label: "Mall", points: pairs.map(function (p) { return { date: p.date, value: p.reference_value }; }) },
        { label: "Walk", points: pairs.map(function (p) { return { date: p.date, value: p.comparison_value }; }) }
      ])); }); return panels;
    }
    if (payload.graph_id === "triplet_functional_output_context") {
      const panels = element("div", "publication-graph-panels");
      [["distance_miles", "Actual authoritative distance", "miles"], ["duration_seconds", "Duration", "seconds"]].forEach(function (metric) { panels.appendChild(linePanel(metric[1], metric[2], ["mall", "walk", "pt"].map(function (role) { return { label: role === "pt" ? "PT" : role[0].toUpperCase() + role.slice(1), points: (payload.accessible_table || []).filter(function (row) { return String(row.sequence_role).toLowerCase().includes(role); }).map(function (row) { return { date: row.date, value: row[metric[0]] }; }) }; }))); }); return panels;
    }
    if (payload.graph_id === "fns_sns_longitudinal_functional_capacity") {
      return reviewerTimeSeriesHierarchy(payload);
    }
    if (payload.graph_id === "transportation_body_coupling_comparison") {
      const wrapper = element("div", "publication-metric-view"), select = element("select", "publication-metric-select"), chart = element("div", "publication-selected-chart");
      select.setAttribute("aria-label", "Select transportation burden metric");
      (payload.series || []).forEach(function (series, index) { const option = element("option", "", series.title); option.value = String(index); select.appendChild(option); });
      function draw() {
        chart.replaceChildren(); const series = (payload.series || [])[Number(select.value) || 0]; if (!series) return;
        const supported = new Set(["ParaTransit bus", "ParaTransit van", "ParaTransit sedan/taxi", "SilverRide"]), points = (series.points || []).filter(function (p) { return supported.has(p.label); });
        const field = {"Cumulative Shock":"cumulative_dynamic_shock", "Duration-normalized Cumulative Shock":"cumulative_dynamic_shock_per_min", "Jerk RMS":"jerk_rms_g_per_s", "Mean HR":"kubios_mean_hr_bpm", "RMSSD":"kubios_rmssd_ms", "SDNN":"kubios_sdnn_ms", "Shock Spike Rate":"shock_spike_rate_per_min", "Vertical RMS":"vertical_dynamic_g_rms", "Ride duration":"event_duration_seconds"}[series.title];
        const labelFor = {paratransit_bus:"ParaTransit bus", paratransit_van:"ParaTransit van", paratransit_sedan_or_taxi:"ParaTransit sedan/taxi", paratransit_silverride:"SilverRide"};
        const raw = (payload.accessible_table || []).filter(function (r) { return supported.has(labelFor[r.canonical_cohort]); });
        const rawValue = function (r) { const v = field ? r[field] : null; return series.title === "Ride duration" && Number.isFinite(Number(v)) ? Number(v) / 60 : v; };
        const values = raw.map(rawValue).concat(points.flatMap(function (p) { return [p.q1, p.value, p.q3]; })).map(Number).filter(Number.isFinite); if (!values.length) return;
        const minimum = Math.min.apply(null, values), maximum = Math.max.apply(null, values), padding = (maximum - minimum || Math.max(1, Math.abs(maximum) * .05)) * .05, domainMin = Math.max(0, minimum - padding), domainMax = maximum + padding, width = 820, rowHeight = 48, top = 18, left = 170, right = 112, plotWidth = width - left - right, x = function (value) { return left + ((Number(value) - domainMin) / (domainMax - domainMin || 1)) * plotWidth; };
        const panel = element("section", "publication-graph-panel"); panel.appendChild(element("h3", "", series.title + " (" + series.unit + ")"));
        const clipId = "transport-clip-" + String(series.title).replace(/[^a-z0-9]+/gi, "-").toLowerCase(), svg = svgNode("svg", { viewBox: "0 0 " + width + " " + (top + rowHeight * points.length + 20), class: "publication-distribution-chart", role: "img", "aria-label": series.title + " transportation distribution" }), defs = svgNode("defs"), clip = svgNode("clipPath", { id: clipId }); clip.appendChild(svgNode("rect", { x: left, y: 0, width: plotWidth, height: top + rowHeight * points.length + 20 })); defs.appendChild(clip); svg.appendChild(defs);
        points.forEach(function (point, index) { const y = top + index * rowHeight + 18, cohortRaw = raw.filter(function (r) { return labelFor[r.canonical_cohort] === point.label && Number.isFinite(Number(rawValue(r))); }), rawValues = cohortRaw.map(rawValue).map(Number), whiskerMin = Math.min.apply(null, rawValues.concat([Number(point.q1)])), whiskerMax = Math.max.apply(null, rawValues.concat([Number(point.q3)])), group = svgNode("g", { "clip-path": "url(#" + clipId + ")" }); const label = svgNode("text", { x: 4, y: y + 4, class: "publication-axis-label" }); label.textContent = point.label; svg.appendChild(label); group.appendChild(svgNode("line", { x1: x(whiskerMin), x2: x(whiskerMax), y1: y, y2: y, class: "publication-whisker" })); group.appendChild(svgNode("rect", { x: x(point.q1), y: y - 9, width: Math.max(1, x(point.q3) - x(point.q1)), height: 18, class: "publication-box" })); group.appendChild(svgNode("line", { x1: x(point.value), x2: x(point.value), y1: y - 12, y2: y + 12, class: "publication-median-line" })); cohortRaw.forEach(function (r) { const value = Number(rawValue(r)), labelText = labelFor[r.canonical_cohort] + ", " + series.title + ": " + displayNumber(value) + " " + series.unit + (r.event_date_local ? ", date " + r.event_date_local : "") + (r.mobility_event_id ? ", session " + r.mobility_event_id : ""), dot = svgNode("circle", { cx: x(value), cy: y, r: 4, class: "publication-raw-point-svg", tabindex: "0" }); dot.setAttribute("aria-label", labelText); const title = svgNode("title"); title.textContent = labelText; dot.appendChild(title); group.appendChild(dot); }); svg.appendChild(group); const valueLabel = svgNode("text", { x: width - right + 8, y: y + 4, class: "publication-axis-label" }); valueLabel.textContent = displayNumber(point.value) + " · n=" + point.sample_count; svg.appendChild(valueLabel); }); panel.appendChild(svg); chart.appendChild(panel);
      }
      select.addEventListener("change", draw); wrapper.appendChild(select); wrapper.appendChild(chart); draw(); return wrapper;
    }
    const panels = element("div", "publication-graph-panels"); selectedSeries(payload).forEach(function (series) { panels.appendChild(barPanel(series)); }); return panels;
  }

  function tableModel(payload) {
    const rows = payload.accessible_table || [];
    const keys = rows.length && rows[0] && typeof rows[0] === "object" ? Object.keys(rows[0]) : [];
    return {
      columns: keys.map(function (key) { return [key, key.replaceAll("_", " ")]; }),
      rows: rows
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
    mount.dataset.state = "ready";
    const example = element("article", "case-example");
    example.appendChild(element("p", "case-example-label", "N-of-1 case study example"));
    example.appendChild(element("h2", "", payload.title.replace(/^N-of-1 case study example — /, "")));
    if (payload.question) example.appendChild(element("p", "publication-question", "Question: " + payload.question));
    example.appendChild(element("p", "publication-finding", payload.finding || payload.interpretation));
    example.appendChild(element("p", "publication-meta", payload.method_disclosure));

    const chips = element("div", "publication-chips");
    chips.appendChild(element("span", "publication-chip", "Samples: " + sampleText(payload.sample_counts)));
    chips.appendChild(element("span", "publication-chip", "Units: " + (payload.units || []).join(", ")));
    chips.appendChild(element("span", "publication-chip", "Data through: " + payload.data_through_date));
    example.appendChild(chips);

    example.appendChild(exampleVisual(payload));

    if (payload.planned_comparator) {
      const planned = element("aside", "publication-planned-comparator");
      planned.appendChild(element("strong", "", payload.planned_comparator.label + " — PLANNED / UNMEASURED COMPARATOR"));
      planned.appendChild(element("p", "publication-planned-status", payload.planned_comparator.status));
      planned.appendChild(element("p", "", payload.planned_comparator.research_question));
      planned.appendChild(element("p", "publication-meta", "No measured value or zero bar is shown. " + payload.planned_comparator.limitation));
      example.appendChild(planned);
    }

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

    const link = element("a", "button button-secondary", "Review the canonical N-of-1 evidence on HandicapSkater.com");
    link.href = payload.canonical_case_route;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    example.appendChild(link);
    const inspect = element("a", "button button-secondary", "Inspect in Evidence Observatory");
    inspect.href = "https://evidence.handicapskater.com/#" + encodeURIComponent(payload.graph_id);
    inspect.target = "_blank";
    inspect.rel = "noopener noreferrer";
    example.appendChild(inspect);
    mount.appendChild(example);
  }

  function renderHypothesisRegistry(mount, payload) {
    const values = payload.approved_values || {};
    const hypotheses = values.canonical_hypotheses;
    if (!Array.isArray(hypotheses) || hypotheses.map(function (item) { return item.hypothesis_id; }).join(",") !== "H1,H2,H3,H4,H5,H6") {
      throw new Error("Canonical hypothesis registry unavailable");
    }
    mount.replaceChildren();
    const wrapper = element("div", "publication-hypothesis-registry");
    wrapper.appendChild(element("p", "publication-finding", payload.plain_language_finding));
    wrapper.appendChild(element("p", "publication-meta", "Registry " + values.registry_version + " · Generalized review projection"));
    const grid = element("div", "publication-hypothesis-grid");
    hypotheses.forEach(function (hypothesis) {
      const card = element("article", "publication-hypothesis-card");
      card.appendChild(element("p", "case-example-label", hypothesis.hypothesis_id + " · " + hypothesis.review_status));
      card.appendChild(element("h3", "", hypothesis.title));
      card.appendChild(element("p", "", hypothesis.scientific_question));
      const cohorts = element("div", "publication-chips");
      (hypothesis.comparison_cohorts || []).forEach(function (cohort) { cohorts.appendChild(element("span", "publication-chip", "Cohort: " + String(cohort).replaceAll("_", " "))); });
      (hypothesis.primary_metrics || []).forEach(function (metric) { cohorts.appendChild(element("span", "publication-chip", "Metric: " + metric)); });
      card.appendChild(cohorts);
      const conclusions = element("div", "publication-conclusion-grid");
      [
        ["N-of-1 case study observed result", hypothesis.observed_result],
        ["Integrated interpretation", hypothesis.integrated_interpretation],
        ["Scope", hypothesis.scope],
        ["Accommodation relevance", hypothesis.accommodation_relevance]
      ].forEach(function (section) {
        const block = element("section", "");
        block.appendChild(element("h4", "", section[0]));
        block.appendChild(element("p", "", section[1]));
        conclusions.appendChild(block);
      });
      card.appendChild(conclusions);
      const figureLinks = element("p", "publication-meta", "Publication figures: ");
      (hypothesis.publication_figure_ids || []).forEach(function (figureId, index) {
        if (index) figureLinks.appendChild(document.createTextNode(" · "));
        const figureLink = element("a", "", figureId);
        figureLink.href = "https://evidence.handicapskater.com/#" + encodeURIComponent(figureId);
        figureLinks.appendChild(figureLink);
      });
      card.appendChild(figureLinks);
      const details = element("details", "publication-details");
      details.appendChild(element("summary", "", "Open review rules, provenance, and evidence-quality limits"));
      details.appendChild(element("h4", "", "Inclusion rules"));
      list(details, hypothesis.inclusion_rules, "publication-source-list");
      details.appendChild(element("h4", "", "Exclusion rules"));
      list(details, hypothesis.exclusion_rules, "publication-source-list");
      details.appendChild(element("h4", "", "Limitations"));
      list(details, hypothesis.limitations, "publication-limitation-list");
      details.appendChild(element("h4", "", "Provenance"));
      details.appendChild(element("pre", "publication-provenance", JSON.stringify(hypothesis.provenance || {}, null, 2)));
      details.appendChild(element("p", "publication-meta", "Required figure contracts: " + (hypothesis.required_figures || []).map(function (figure) { return "Level " + figure.level + " " + String(figure.figure_type).replaceAll("_", " "); }).join(" · ")));
      card.appendChild(details);
      grid.appendChild(card);
    });
    wrapper.appendChild(grid);
    const order = element("section", "publication-registry-interpretation");
    order.appendChild(element("h3", "", "Required interpretation order"));
    const ordered = element("ol", "publication-source-list");
    (values.conclusion_contract || []).forEach(function (item) { ordered.appendChild(element("li", "", item.label + ": " + item.rule)); });
    order.appendChild(ordered);
    wrapper.appendChild(order);
    mount.appendChild(wrapper);
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
            .catch(function (error) { unavailable(mount, error); });
        });
        document.querySelectorAll("[data-reviewer-hypothesis-registry]").forEach(function (mount) {
          resource(manifest, mount.dataset.reviewerHypothesisRegistry)
            .then(function (payload) { renderHypothesisRegistry(mount, payload); })
            .catch(function (error) { unavailable(mount, error); });
        });
      })
      .catch(function (error) {
        document.querySelectorAll("[data-reviewer-publication-status], [data-reviewer-example], [data-reviewer-hypothesis-registry]").forEach(function (mount) {
          unavailable(mount, error);
        });
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
