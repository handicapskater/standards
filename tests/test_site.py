from __future__ import annotations

import json
import re
import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

CANONICAL_PAGES = (
    "index.html",
    "standards/index.html",
    "hypothesis-registry/index.html",
    "federal-source-anchors/index.html",
    "direct-threat-analysis/index.html",
    "evidence-review/index.html",
)

REDIRECTS = {
    "standards.html": "/standards/",
    "non-standard-mobility-aids.html": "/non-standard-mobility-aids/",
    "transportation-accommodation.html": "/transportation-accommodation/",
    "direct-threat-analysis.html": "/direct-threat-analysis/",
    "evidence-standards.html": "/evidence-review/",
    "fsi-css-platform.html": "/evidence-quality/",
    "reviewer-guidance.html": "/reviewer-guidance/",
    "dot-fta-doj-timeline.html": "/timeline/",
    "references.html": "/references/",
}

MERGED_REDIRECTS = {
    "actual-risk/index.html": "/standards/#actual-risk",
    "body-coupling/index.html": "/standards/#body-coupling",
    "non-standard-mobility-aids/index.html": "/standards/#non-standard-mobility-aid",
    "timeline/index.html": "/federal-source-anchors/#timeline",
    "references/index.html": "/federal-source-anchors/#sources",
    "evidence-quality/index.html": "/evidence-review/#quality",
    "transportation-accommodation/index.html": "/evidence-review/#transportation",
    "reviewer-guidance/index.html": "/evidence-review/#decision",
}


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class StandardsSiteTests(unittest.TestCase):
    def test_homepage_keeps_generalized_standards_separate_from_scientific_calculation(self) -> None:
        html = read("index.html").lower()
        self.assertIn("function-first review", html)
        self.assertIn("source provenance", html)
        self.assertIn("numerical-parity contracts", html)
        self.assertIn("checkpoint reuse is not accelerator execution", html)
        self.assertIn("same transportation purpose", html)
        self.assertIn("measurement scope", html)
        self.assertIn("sole scientific authority", html)
        self.assertNotIn("48.34x", html)
        self.assertNotIn("calculatef", html)

    def test_footer_has_no_sequence_or_related_navigation(self) -> None:
        footer = read("common/site-footer.js")
        css = read("common/css/site-chrome.css")
        for token in ("Previous", "Next", "Related", "sequence-nav"):
            self.assertNotIn(token, footer)
        self.assertNotIn(".sequence-nav", css)

    def test_canonical_pages_exist(self) -> None:
        for page in CANONICAL_PAGES:
            self.assertTrue((ROOT / page).is_file(), page)

    def test_canonical_pages_share_static_site_chrome(self) -> None:
        for page in CANONICAL_PAGES:
            html = read(page)
            self.assertIn('class="site-org', html, page)
            self.assertIn('id="site-header"', html, page)
            self.assertIn('/common/site-header.js', html, page)
            self.assertIn('id="site-footer"', html, page)
            self.assertIn('/common/site-footer.js', html, page)
            self.assertEqual(len(re.findall(r"<h1(?:\s|>)", html, re.I)), 1, page)

    def test_legacy_routes_are_accessible_redirects(self) -> None:
        for page, target in REDIRECTS.items():
            html = read(page).lower()
            self.assertIn('name="robots" content="noindex,follow"', html, page)
            self.assertIn(f'url={target}', html, page)
            self.assertIn(f'href="{target}"', html, page)
            self.assertIn('rel="canonical"', html, page)
        for page, target in MERGED_REDIRECTS.items():
            html = read(page).lower()
            self.assertIn('name="robots" content="noindex,follow"', html, page)
            self.assertIn(f'url={target}', html, page)
            self.assertIn(f'href="{target}"', html, page)

    def test_homepage_is_generalized_function_first_front_door(self) -> None:
        html = read("index.html")
        lower = html.lower()
        self.assertIn("function before appearance", lower)
        self.assertIn("individualized review", lower)
        self.assertIn("asserted risk", lower)
        self.assertIn("less-restrictive alternatives", lower)
        self.assertIn("evidence observatory remains the only scientific authority", lower)
        self.assertIn("source-specific measurement scope", lower)

    def test_homepage_has_no_page_directory(self) -> None:
        html = read("index.html")
        self.assertNotIn("Six pages · one guided sequence", html)
        self.assertNotIn("The complete standards experience", html)
        self.assertNotIn("card--accent", html)

    def test_standards_page_contains_ten_step_framework(self) -> None:
        html = read("standards/index.html")
        framework = html[html.index('id="framework"'):]
        self.assertEqual(framework.count("<li>"), 10)
        for concept in (
            "claimed mobility function",
            "comparison activity",
            "functional output",
            "physiological and movement burden",
            "body coupling",
            "n-of-1 observations",
            "source authority",
            "observations and interpretations",
            "actual risk",
            "less-restrictive alternatives",
        ):
            self.assertIn(concept, framework.lower())

    def test_non_standard_mobility_page_preserves_generalized_scope(self) -> None:
        lower = read("standards/index.html").lower()
        self.assertIn("what disability-related task", lower)
        self.assertIn("fit and control", lower)
        self.assertIn("evidence and alternatives", lower)
        self.assertIn("a non-standard mobility aid is a generalized review category", lower)
        self.assertEqual(lower.count("non-traditional mobility aid"), 1)

    def test_transport_page_preserves_authored_guidance_without_javascript(self) -> None:
        html = read("evidence-review/index.html")
        lower = html.lower()
        for term in ("body coupling", "vehicle environment", "duration", "routing", "alternatives"):
            self.assertIn(term, lower)
        self.assertIn("no transport category is inherently equivalent", lower)
        self.assertNotIn('data-reviewer-example=', html)

    def test_direct_threat_page_is_individualized_and_bounded(self) -> None:
        lower = read("direct-threat-analysis/index.html").lower()
        self.assertIn("name the asserted harm", lower)
        self.assertIn("objective evidence", lower)
        self.assertIn("less-restrictive alternatives", lower)
        self.assertIn("duration", lower)
        self.assertIn("severity", lower)
        self.assertIn("likelihood", lower)
        self.assertIn("actual circumstances", lower)
        self.assertIn("evidence observatory is the only scientific source", lower)
        self.assertIn("distinguish measured setting-specific risk from generalized assumptions", lower)

    def test_evidence_review_contains_generalized_sequence(self) -> None:
        lower = read("evidence-review/index.html").lower()
        self.assertIn("review output and burden together", lower)
        self.assertIn("source authority", lower)
        self.assertIn("sample counts", lower)
        self.assertIn("missingness", lower)
        self.assertIn("reproducibility", lower)

    def test_hypothesis_registry_has_one_canonical_principle_page(self) -> None:
        html = read("evidence-review/index.html")
        principle = read("hypothesis-registry/index.html")
        header = read("common/site-header.js")
        self.assertNotIn('data-reviewer-hypothesis-registry="hypothesis-registry"', html)
        self.assertIn('href: "/hypothesis-registry/"', header)
        self.assertIn("data-reviewer-hypothesis-registry", principle)
        self.assertIn("reviewer-publication.js", principle)
        self.assertNotIn('href="https://handicapskater.com/platform/#hypotheses"', principle)
        self.assertIn("evidence observatory is the only scientific source", principle.lower())

    def test_merged_principles_and_sources_have_stable_section_anchors(self) -> None:
        principles = read("standards/index.html")
        federal = read("federal-source-anchors/index.html")
        methods = read("evidence-review/index.html")
        for anchor in ('id="body-coupling"', 'id="actual-risk"', 'id="non-standard-mobility-aid"', 'id="framework"'):
            self.assertIn(anchor, principles)
        for anchor in ('id="principle"', 'id="sources"', 'id="timeline"', 'id="evaluate"'):
            self.assertIn(anchor, federal)
        for anchor in ('id="review-method"', 'id="quality"', 'id="transportation"', 'id="decision"'):
            self.assertIn(anchor, methods)

    def test_route_reviewer_guidance_moved_to_org(self) -> None:
        html = read("evidence-review/index.html")
        lower = html.lower()
        self.assertIn('id="route-evidence-review"', html)
        self.assertIn("what a mobility reviewer should notice", lower)
        for term in ("repeated function", "distance and duration", "source connection", "transportation context", "environmental context", "limits"):
            self.assertIn(term, lower)
        self.assertNotIn('class="chapter-rail"', html)

    def test_standards_mount_only_approved_observatory_projections(self) -> None:
        standards = read("standards/index.html")
        self.assertEqual(standards.count("data-reviewer-example="), 4)
        for graph_id in (
            "walking_vs_mall_accumulated_mechanical_load",
            "triplet_functional_output_context",
            "fns_sns_longitudinal_functional_capacity",
            "transportation_body_coupling_comparison",
        ):
            self.assertIn(f'data-reviewer-example="{graph_id}"', standards)
        self.assertIn("performs no scientific calculation", standards)

    def test_longitudinal_case_example_uses_compact_governed_panel_roles(self) -> None:
        reader = read("common/reviewer-publication.js")
        css = read("common/css/publication.css")
        self.assertIn("function reviewerTimeSeriesHierarchy(payload)", reader)
        self.assertIn("item.presentation_role", reader)
        self.assertIn('wrapper.dataset.initialHeightBudget = "one-chart-card"', reader)
        self.assertIn('wrapper.dataset.presentationAuthority = usesGovernedRoles ? "governed" : "legacy-compatible"', reader)
        self.assertIn('throw new Error("Invalid governed presentation hierarchy: " + payload.graph_id)', reader)
        self.assertIn('"More case-example metrics (" + detailItems.length + ")"', reader)
        self.assertIn("publication-line-chart-compact", css)
        self.assertIn("grid-auto-flow: column", css)

    def test_reviewer_case_examples_hydrate_from_the_synchronized_bundle(self) -> None:
        example_ids = re.findall(
            r'data-reviewer-example="([^"]+)"', read("standards/index.html")
        )
        self.assertEqual(len(example_ids), 4)
        reader_path = ROOT / "common/reviewer-publication.js"
        bundle_root = ROOT / "data/public/reviewer-guidance/v1"
        harness = """
const fs = require("fs");
const vm = require("vm");
const readerPath = __READER_PATH__;
const bundleRoot = __BUNDLE_ROOT__;
const exampleIds = __EXAMPLE_IDS__;

class Element {
  constructor(tag) {
    this.tagName = tag;
    this.dataset = {};
    this.children = [];
    this.attributes = {};
    this._text = "";
    this.style = { setProperty() {} };
    this.classList = { add() {}, toggle() {} };
  }
  appendChild(child) { this.children.push(child); return child; }
  append(...children) { children.forEach((child) => this.appendChild(child)); }
  replaceChildren(...children) { this.children = []; this._text = ""; this.append(...children); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name] || null; }
  addEventListener() {}
  get firstChild() { return this.children[0] || null; }
  get textContent() { return this._text + this.children.map((child) => child.textContent || "").join(""); }
  set textContent(value) { this.children = []; this._text = String(value); }
}

const mounts = exampleIds.map((exampleId) => {
  const mount = new Element("div");
  mount.dataset.reviewerExample = exampleId;
  mount.textContent = "Loading approved case example…";
  return mount;
});
global.document = {
  readyState: "complete",
  createElement(tag) { return new Element(tag); },
  createElementNS(_namespace, tag) { return new Element(tag); },
  addEventListener() {},
  querySelectorAll(selector) {
    return selector.includes("[data-reviewer-example]") ? mounts : [];
  },
};
global.window = {};
global.fetch = async (url) => {
  const prefix = "/data/public/reviewer-guidance/v1/";
  const relative = String(url).startsWith(prefix) ? String(url).slice(prefix.length).split("?")[0] : "";
  const target = relative ? bundleRoot + "/" + relative : "";
  if (!target || !fs.existsSync(target)) return { ok: false, json: async () => ({}) };
  return { ok: true, json: async () => JSON.parse(fs.readFileSync(target, "utf8")) };
};

(async () => {
  vm.runInThisContext(fs.readFileSync(readerPath, "utf8"), { filename: readerPath });
  await new Promise((resolve) => setTimeout(resolve, 75));
  for (const mount of mounts) {
    if (mount.dataset.state !== "ready" || mount.textContent.includes("Loading approved")) {
      throw new Error("reviewer example did not hydrate: " + mount.dataset.reviewerExample);
    }
  }
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
"""
        completed = subprocess.run(
            [
                "node",
                "-e",
                harness.replace("__READER_PATH__", json.dumps(str(reader_path)))
                .replace("__BUNDLE_ROOT__", json.dumps(str(bundle_root)))
                .replace("__EXAMPLE_IDS__", json.dumps(example_ids)),
            ],
            check=False,
            capture_output=True,
            text=True,
            timeout=15,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_standards_sections_link_to_their_evidence_cases(self) -> None:
        direct_threat = read("direct-threat-analysis/index.html")
        principles = read("standards/index.html")
        self.assertIn("#case-walking-mechanical-load", direct_threat)
        for case_id in (
            "case-walking-mechanical-load",
            "case-transportation-body-coupling",
            "case-fixed-rail-comparator",
            "case-functional-mobility",
            "case-longitudinal-capacity",
        ):
            self.assertIn(f"https://evidence.handicapskater.com/#{case_id}", principles)

    def test_reviewer_reader_keeps_case_context_visible(self) -> None:
        js = read("common/reviewer-publication.js")
        for token in (
            "N-of-1 case study example",
            "Samples:",
            "Limitations",
            "Source scope",
            "canonical_case_route",
            "https://handicapskater.com/",
            "Inspect in Evidence Observatory",
            "PLANNED / UNMEASURED COMPARATOR",
        ):
            self.assertIn(token, js)

    def test_evidence_quality_preserves_source_boundaries(self) -> None:
        lower = read("evidence-review/index.html").lower()
        for term in ("source and scope", "completeness", "reproducibility", "source boundaries"):
            self.assertIn(term, lower)
        self.assertIn("whoop overnight recovery", lower)
        self.assertIn("kubios", lower)
        self.assertIn("cohort similarity score", lower)
        self.assertNotIn("comparable similarity score", lower)

    def test_reviewer_guidance_records_reasoning_and_alternatives(self) -> None:
        lower = read("evidence-review/index.html").lower()
        for term in ("before review", "during review", "after review", "less-restrictive options", "record reasons"):
            self.assertIn(term, lower)

    def test_timeline_and_references_remain_generalized(self) -> None:
        timeline = read("federal-source-anchors/index.html").lower()
        references = timeline
        for year in ("2005", "2007", "2010"):
            self.assertIn(year, timeline)
        self.assertIn("roller skates analyzed as a mobility aid", timeline)
        self.assertIn("opdmd regulations", timeline)
        self.assertIn("federal source anchor", references)
        self.assertIn("how should authority be evaluated", references)

    def test_cross_site_navigation_is_not_duplicated(self) -> None:
        header = read("common/site-header.js")
        canonical = "\n".join(read(page) for page in CANONICAL_PAGES)
        self.assertNotIn("https://handicapskater.com/", header)
        self.assertNotIn('class="reference-card"', canonical)

    def test_navigation_is_route_owned_and_accessible(self) -> None:
        js = read("common/site-header.js")
        for label in ("Direct Threat", "Engineering Principles", "Federal Sources", "Hypothesis Registry", "Methods"):
            self.assertIn(f'label: "{label}"', js)
        self.assertNotIn('label: "Home"', js)
        config = js[js.index("primaryLinks:"):js.index("function normalizePath")]
        self.assertEqual(config.count("label:"), 5)
        self.assertNotIn("menuGroups", js)
        self.assertNotIn("renderNavMenu", js)

    def test_every_page_gets_exactly_the_five_direct_menu_destinations_after_the_home_title(self) -> None:
        header = read("common/site-header.js")
        config = header[header.index("primaryLinks:"):header.index("function normalizePath")]
        links = re.findall(r'\{ href: "([^"]+)", label: "([^"]+)"', config)
        self.assertEqual(links, [
            ("/direct-threat-analysis/", "Direct Threat"),
            ("/standards/", "Engineering Principles"),
            ("/federal-source-anchors/", "Federal Sources"),
            ("/hypothesis-registry/", "Hypothesis Registry"),
            ("/evidence-review/", "Methods"),
        ])
        self.assertIn('<a class="brand" href="/" aria-label="${config.brand}"${brandCurrent}>${config.brand}</a>', header)
        self.assertNotIn('label: "Home"', header)
        self.assertEqual(header.count("<nav"), 1)
        for page in CANONICAL_PAGES:
            self.assertIn('/common/site-header.js', read(page), page)

    def test_all_org_page_chrome_has_no_secondary_navigation_system(self) -> None:
        header = read("common/site-header.js")
        footer = read("common/site-footer.js")
        authored_pages = [path for path in ROOT.rglob("index.html") if "node_modules" not in path.parts]
        for token in (
            "dropdown",
            "nested-menu",
            "breadcrumb",
            "sequence-nav",
            "previous",
            "next",
            "related-page",
            "principle-nav",
            "reference-nav",
            "section-nav",
        ):
            self.assertNotIn(token, header.lower())
            self.assertNotIn(token, footer.lower())
        self.assertNotIn("<nav", footer)
        self.assertNotIn("<a ", footer)
        for path in authored_pages:
            self.assertNotIn("<nav", path.read_text(encoding="utf-8").lower(), str(path.relative_to(ROOT)))

    def test_navigation_top_level_order_and_canonical_urls(self) -> None:
        js = read("common/site-header.js")
        ordered = (
            'label: "Direct Threat"',
            'label: "Engineering Principles"',
            'label: "Federal Sources"',
            'label: "Hypothesis Registry"',
            'label: "Methods"',
        )
        positions = [js.index(label) for label in ordered]
        self.assertEqual(positions, sorted(positions))
        self.assertNotRegex(js, r'href: "/[^\"]+\.html')

        for path, anchor in (
            ("standards/index.html", 'id="function-before-appearance"'),
            ("direct-threat-analysis/index.html", 'id="environment-specific-review"'),
            ("evidence-review/index.html", 'id="effective-alternatives"'),
            ("evidence-review/index.html", 'id="avoidable-access-burden"'),
            ("evidence-review/index.html", 'id="terminology"'),
        ):
            self.assertIn(anchor, read(path), path)

    def test_static_site_has_no_browser_science_dependencies(self) -> None:
        joined = "\n".join(read(page).lower() for page in CANONICAL_PAGES)
        for forbidden in ("duckdb", "localhost", "mcp://", ".csv", ".jsonl"):
            self.assertNotIn(forbidden, joined)
        reader = read("common/reviewer-publication.js").lower()
        self.assertIn("fetch(", reader)
        self.assertNotIn("duckdb", reader)
        self.assertNotIn("localhost", reader)

    def test_no_universal_or_binding_claims(self) -> None:
        joined = "\n".join(read(page).lower() for page in CANONICAL_PAGES)
        for forbidden in (
            "skates must be allowed everywhere",
            "opdmd proves skates are covered",
            "universal right to use skates everywhere",
            "establishes binding law",
        ):
            self.assertNotIn(forbidden, joined)

    def test_shared_chrome_and_footer_contract(self) -> None:
        js = read("common/site-header.js")
        footer = read("common/site-footer.js")
        css = read("common/css/site-chrome.css")
        components = read("common/css/site-components.css")
        self.assertNotIn("nav-more-summary", js)
        self.assertIn('<a class="brand" href="/" aria-label="${config.brand}"${brandCurrent}>', js)
        self.assertNotIn(".nav-more", css)
        self.assertNotIn("footer-nav", footer)
        self.assertIn("footer-copy", footer)
        self.assertIn("footer-description", footer)
        for token in ("breadcrumb", "ecosystem-path", "evidence-authority-strip"):
            self.assertNotIn(token, js)
            self.assertNotIn(token, css)
        self.assertNotIn(".chapter-rail", components)
        for button in ("button-primary", "button-secondary", "button-light"):
            self.assertIn(button, components)


if __name__ == "__main__":
    unittest.main()
