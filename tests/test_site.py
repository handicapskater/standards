from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

CANONICAL_PAGES = (
    "index.html",
    "standards/index.html",
    "non-standard-mobility-aids/index.html",
    "transportation-accommodation/index.html",
    "direct-threat-analysis/index.html",
    "evidence-review/index.html",
    "evidence-quality/index.html",
    "reviewer-guidance/index.html",
    "timeline/index.html",
    "references/index.html",
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


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class StandardsSiteTests(unittest.TestCase):
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

    def test_homepage_is_generalized_function_first_front_door(self) -> None:
        html = read("index.html")
        lower = html.lower()
        self.assertIn("evaluate function before appearance", lower)
        self.assertIn("non-standard mobility aids require individualized review", lower)
        self.assertIn("actual risk", lower)
        self.assertIn("less-restrictive alternatives", lower)
        self.assertIn("review the standards", lower)
        self.assertIn("reviewer guidance", lower)
        self.assertIn('href="https://handicapskater.com/evidence/"', html)
        self.assertIn("Individual Case Study &amp; Evidence", html)
        self.assertIn("does not establish binding law", lower)

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
            "within-person observations",
            "source authority",
            "observations from diagnosis",
            "actual risk",
            "less-restrictive alternatives",
        ):
            self.assertIn(concept, framework.lower())

    def test_non_standard_mobility_page_preserves_generalized_scope(self) -> None:
        lower = read("non-standard-mobility-aids/index.html").lower()
        self.assertIn("start with the claimed function", lower)
        self.assertIn("fit and control", lower)
        self.assertIn("evidence and alternatives", lower)
        self.assertIn("a non-standard mobility aid is a generalized review category", lower)
        self.assertEqual(lower.count("non-traditional mobility aid"), 1)

    def test_transport_page_preserves_authored_guidance_without_javascript(self) -> None:
        html = read("transportation-accommodation/index.html")
        lower = html.lower()
        for term in ("body coupling", "vehicle environment", "duration", "routing", "alternatives"):
            self.assertIn(term, lower)
        self.assertIn("the standards above remain complete if this enhancement is unavailable", lower)
        self.assertIn('data-reviewer-example="transport_coupling_profiles"', html)

    def test_direct_threat_page_is_individualized_and_bounded(self) -> None:
        lower = read("direct-threat-analysis/index.html").lower()
        self.assertIn("document the asserted risk", lower)
        self.assertIn("evidence to seek", lower)
        self.assertIn("alternatives to test", lower)
        self.assertIn("duration", lower)
        self.assertIn("severity", lower)
        self.assertIn("likelihood", lower)
        self.assertIn("imminence", lower)
        self.assertIn("does not decide any case or establish binding law", lower)

    def test_evidence_review_contains_generalized_sequence(self) -> None:
        lower = read("evidence-review/index.html").lower()
        self.assertIn("review output and burden together", lower)
        self.assertIn("source authority", lower)
        self.assertIn("sample size", lower)
        self.assertIn("missingness", lower)
        self.assertIn("reproducibility", lower)

    def test_route_reviewer_guidance_moved_to_org(self) -> None:
        html = read("evidence-review/index.html")
        lower = html.lower()
        self.assertIn('id="route-evidence-review"', html)
        self.assertIn("what a mobility reviewer should notice", lower)
        for term in ("repeated function", "distance and duration", "source connection", "transportation context", "environmental context", "limits"):
            self.assertIn(term, lower)
        self.assertIn('href="https://handicapskater.com/evidence/strava-gps-skate-maps/"', html)

    def test_optional_examples_are_limited_and_labeled(self) -> None:
        example_pages = {
            "evidence-review/index.html": "mobility_output_and_burden",
            "transportation-accommodation/index.html": "transport_coupling_profiles",
        }
        all_html = "\n".join(read(page) for page in CANONICAL_PAGES)
        self.assertEqual(all_html.count("data-reviewer-example="), 2)
        for page, graph in example_pages.items():
            html = read(page)
            self.assertIn(f'data-reviewer-example="{graph}"', html)
            self.assertIn("Individual case-study example", html)
            self.assertIn("not universal", html)

    def test_reviewer_reader_keeps_case_context_visible(self) -> None:
        js = read("common/reviewer-publication.js")
        for token in (
            "Individual case-study example",
            "Samples:",
            "Limitations",
            "Source scope",
            "canonical_case_route",
            "https://handicapskater.com/",
        ):
            self.assertIn(token, js)

    def test_evidence_quality_preserves_source_boundaries(self) -> None:
        lower = read("evidence-quality/index.html").lower()
        for term in ("source and scope", "completeness", "reproducibility", "terminology and source boundaries"):
            self.assertIn(term, lower)
        self.assertIn("whoop overnight recovery", lower)
        self.assertIn("kubios", lower)
        self.assertIn("cohort similarity score", lower)
        self.assertNotIn("comparable similarity score", lower)

    def test_reviewer_guidance_records_reasoning_and_alternatives(self) -> None:
        lower = read("reviewer-guidance/index.html").lower()
        for term in ("before review", "during review", "after review", "less-restrictive options", "record reasons"):
            self.assertIn(term, lower)

    def test_timeline_and_references_remain_generalized(self) -> None:
        timeline = read("timeline/index.html").lower()
        references = read("references/index.html").lower()
        for year in ("2005", "2007", "2010"):
            self.assertIn(year, timeline)
        self.assertIn("roller skates analyzed as a mobility aid", timeline)
        self.assertIn("opdmd regulations", timeline)
        self.assertIn("federal source anchors", references)
        self.assertIn("evaluate source authority", references)

    def test_cross_site_label_and_url_are_exact(self) -> None:
        header = read("common/site-header.js")
        footer = read("common/site-footer.js")
        self.assertIn("Individual Case Study & Evidence", header)
        self.assertIn("Individual Case Study &amp; Evidence", footer)
        for source in (header, footer):
            self.assertIn("https://handicapskater.com/evidence/", source)

    def test_navigation_is_route_owned_and_accessible(self) -> None:
        js = read("common/site-header.js")
        for label in ("Standards", "Mobility Aids", "Transportation", "Evidence Review", "Reviewers", "Evidence Quality", "Direct Threat", "Timeline", "References"):
            self.assertIn(f'label: "{label}"', js)
        self.assertIn('target="_blank"', js)
        self.assertIn('rel="noopener noreferrer"', js)
        self.assertIn("wireMoreMenuCloseBehavior", js)

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
        self.assertIn("nav-more-summary", js)
        self.assertIn("position: absolute", css)
        self.assertIn("footer-nav", footer)
        self.assertIn("footer-copy", footer)
        self.assertIn("footer-description", footer)
        for button in ("button-primary", "button-secondary", "button-light"):
            self.assertIn(button, components)


if __name__ == "__main__":
    unittest.main()
