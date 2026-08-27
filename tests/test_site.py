from __future__ import annotations

import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

CANONICAL_PAGES = (
    "index.html", "protocol/index.html", "review-tools/index.html",
    "actual-risk/index.html", "certification-model/index.html",
    "current-law-sources/index.html", "case-study/inline-skates/index.html",
    "feedback-and-pilots/index.html", "evidence-review/index.html",
)

REDIRECTS = {
    "standards/index.html": "/protocol/",
    "non-standard-mobility-aids/index.html": "/protocol/",
    "direct-threat-analysis/index.html": "/actual-risk/",
    "federal-source-anchors/index.html": "/current-law-sources/",
    "body-coupling/index.html": "/evidence-review/",
    "timeline/index.html": "/current-law-sources/",
    "references/index.html": "/current-law-sources/",
    "reviewer-guidance/index.html": "/review-tools/",
    "transportation-accommodation/index.html": "/protocol/#environment",
    "hypothesis-registry/index.html": "https://evidence.handicapskater.com/",
}

PERSONAL_GRAPH_IDS = (
    "functional_output_vs_burden_authoritative_miles",
    "walking_vs_mall_accumulated_mechanical_load",
    "accepted_triplet_stage_profiles",
    "fns_sns_longitudinal_functional_capacity",
    "transportation_body_coupling_comparison",
)


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class StandardsSiteTests(unittest.TestCase):
    def test_canonical_pages_exist_and_share_accessible_chrome(self) -> None:
        for page in CANONICAL_PAGES:
            html = read(page)
            self.assertIn('class="site-org', html, page)
            self.assertIn('href="#main"', html, page)
            self.assertIn('id="site-header"', html, page)
            self.assertIn('id="site-footer"', html, page)
            self.assertEqual(len(re.findall(r"<h1(?:\s|>)", html, re.I)), 1, page)

    def test_home_is_a_function_before_appearance_front_door(self) -> None:
        lower = read("index.html").lower()
        for phrase in ("function before appearance", "evaluation category", "eight stages", "portable mobility record", "function is not always visible", "motivating case"):
            self.assertIn(phrase, lower)
        self.assertNotIn("data-reviewer-example", lower)
        self.assertNotIn("personal hrv", lower)

    def test_protocol_has_all_eight_stages_in_order(self) -> None:
        html = read("protocol/index.html")
        stages = ("Mobility Function", "Device / Adaptation Function", "User Proficiency", "Functional Evidence", "Environment", "Actual Risk", "Mitigation Before Exclusion", "Documented Decision")
        positions = [html.index(stage) for stage in stages]
        self.assertEqual(positions, sorted(positions))
        self.assertIn("NSMAEP", html)
        self.assertIn("not prerequisites", html.lower())
        self.assertIn("no universal obstacle-course requirement", html.lower())

    def test_protocol_keeps_the_evaluation_category_boundary(self) -> None:
        lower = read("protocol/index.html").lower()
        self.assertIn("evaluation category", lower)
        self.assertIn("not an automatic legal classification, diagnosis, entitlement, permit, or universal authorization", lower)

    def test_optional_evidence_and_privacy_boundaries_are_explicit(self) -> None:
        evidence = read("evidence-review/index.html").lower()
        protocol = read("protocol/index.html").lower()
        pmr = read("certification-model/index.html").lower()
        for name in ("whoop", "polar", "kubios", "strava", "fsi", "css"):
            self.assertIn(name, evidence)
            self.assertIn(name, protocol)
        self.assertIn("not prerequisites", evidence)
        for phrase in ("proposed voluntary tool", "not a permit", "not a diagnosis card", "not a universal authorization", "not a legal entitlement", "not a prerequisite", "minimum necessary functional information", "raw medical or wearable records"):
            self.assertIn(phrase, pmr)

    def test_reassessment_and_review_do_not_invent_rights(self) -> None:
        pmr = read("certification-model/index.html").lower()
        self.assertIn("do not restart from zero when material facts have not changed", pmr)
        self.assertIn("does not create a legal appeal right", pmr)
        self.assertIn("material device or functional change", pmr)

    def test_five_generalized_diagrams_have_text_equivalents(self) -> None:
        pages = "\n".join(read(page) for page in CANONICAL_PAGES)
        for phrase in ("Eight-stage protocol flow", "Familiar device", "Actual-risk model", "Portable record model", "Reassessment loop"):
            self.assertIn(phrase, pages)
        self.assertGreaterEqual(pages.count("Text equivalent:"), 3)

    def test_actual_risk_is_generalized_and_scope_bounded(self) -> None:
        lower = read("actual-risk/index.html").lower()
        for phrase in ("hazard", "environment", "user control", "safeguards", "mitigation", "residual risk"):
            self.assertIn(phrase, lower)
        self.assertIn("proposed standard", lower)
        self.assertIn("does not itself classify every unfamiliar aid", lower)
        self.assertNotIn("case-walking-mechanical-load", lower)

    def test_case_study_is_bounded(self) -> None:
        lower = read("case-study/inline-skates/index.html").lower()
        for phrase in ("motivating case", "does not make inline skates the rule", "does not reproduce private medical records", "https://handicapskater.com/case/"):
            self.assertIn(phrase, lower)

    def test_current_law_case_lesson_and_proposed_standard_are_distinguished(self) -> None:
        lower = read("current-law-sources/index.html").lower()
        for phrase in ("current law / guidance", "case-derived lesson", "proposed standard", "not a universal device classification, skate approval, or skate prohibition"):
            self.assertIn(phrase, lower)

    def test_primary_standard_pages_have_no_personal_graph_ids_or_mounts(self) -> None:
        content = "\n".join(read(page) for page in ("index.html", "protocol/index.html", "actual-risk/index.html", "review-tools/index.html", "certification-model/index.html"))
        self.assertNotIn("data-reviewer-example", content)
        for graph_id in PERSONAL_GRAPH_IDS:
            self.assertNotIn(graph_id, content)

    def test_navigation_has_the_approved_public_paths(self) -> None:
        header = read("common/site-header.js")
        for href in ("/protocol/", "/review-tools/", "/actual-risk/", "/certification-model/", "/current-law-sources/", "/case-study/inline-skates/", "/feedback-and-pilots/"):
            self.assertIn(f'href: "{href}"', header)

    def test_legacy_routes_are_accessible_redirects(self) -> None:
        for page, target in REDIRECTS.items():
            html = read(page).lower()
            self.assertIn('name="robots" content="noindex,follow"', html, page)
            self.assertIn(f"url={target}", html, page)
            self.assertIn(f'href="{target}"', html, page)

    def test_no_private_medical_content_is_published(self) -> None:
        content = "\n".join(read(page).lower() for page in CANONICAL_PAGES)
        for prohibited in ("valley radiology", "mri report", "pelvic fracture", "medical pdf"):
            self.assertNotIn(prohibited, content)


if __name__ == "__main__":
    unittest.main()
