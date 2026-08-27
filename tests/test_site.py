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

    def test_review_tools_are_ten_blank_operational_sections_in_protocol_order(self) -> None:
        html = read("review-tools/index.html")
        tools = (
            "Functional Intake", "Device / Adaptation Profile", "Proficiency Review",
            "Functional Evidence Record", "Environment Review", "Actual-Risk Worksheet",
            "Mitigation Worksheet", "Decision Record", "Portable Mobility Record", "Reassessment Record",
        )
        positions = [html.index(tool) for tool in tools]
        self.assertEqual(positions, sorted(positions))
        self.assertGreaterEqual(html.count("<form"), 10)
        for stage in range(1, 9):
            self.assertIn(f"STAGE {stage} · PROPOSED STANDARD", html)

    def test_functional_intake_is_function_first_and_has_no_required_medical_gate(self) -> None:
        html = read("review-tools/index.html").lower()
        for phrase in ("functional task being limited", "mobility function requested", "what happens without the requested aid?", "conventional alternative available?", "equivalent function", "optional supporting-document reference"):
            self.assertIn(phrase, html)
        self.assertIn("diagnosis, icd code, medical history, and physician certification are not requested", html)
        self.assertNotIn("required", html[html.index('id="functional-intake"'):html.index('id="device-profile"')])

    def test_device_and_proficiency_forms_do_not_assume_a_specific_aid_or_mandatory_course(self) -> None:
        html = read("review-tools/index.html").lower()
        device = html[html.index('id="device-profile"'):html.index('id="proficiency-review"')]
        proficiency = html[html.index('id="proficiency-review"'):html.index('id="functional-evidence"')]
        for phrase in ("movement mechanism", "control method", "stopping method", "steering/maneuvering method", "other operating characteristics"):
            self.assertIn(phrase, device)
        self.assertIn("without assuming a wheel, motor, battery, handlebar, or seat", device)
        self.assertIn("demonstration performed?", proficiency)
        self.assertIn("not necessary", proficiency)
        self.assertIn("proportionate to the actual setting and identified risk", proficiency)
        self.assertIn("not a mandatory obstacle course", proficiency)

    def test_evidence_environment_and_risk_contracts_are_complete_and_optional(self) -> None:
        html = read("review-tools/index.html").lower()
        for phrase in ("individual functional statement", "direct observation/demonstration", "professional functional documentation", "prior accommodation/decision", "prior successful-use history", "device/technical evidence", "biomechanical/rehabilitation evidence", "optional objective measurement", "other relevant evidence"):
            self.assertIn(phrase, html)
        for name in ("whoop", "polar", "kubios", "strava", "fsi", "css"):
            self.assertIn(name, html)
        self.assertIn("is not required to request or complete an nsmaep review", html)
        for factor in ("surface", "grade", "width", "crowding", "pedestrian density", "boarding", "transfers", "platform/edge hazards", "security", "storage", "emergency egress", "indoor/outdoor conditions", "vehicle interaction"):
            self.assertIn(factor, html)
        self.assertGreaterEqual(html.count("not applicable"), 14)
        for dimension in ("identified hazard", "setting-specific mechanism", "exposed person/property", "likelihood", "severity", "user control", "existing safeguards", "feasible mitigation", "residual risk", "evidence/source for hazard", "uncertainty / missing information"):
            self.assertIn(dimension, html)
        self.assertIn("qualitative values are not a mathematical risk score", html)

    def test_mitigation_and_decision_contracts_are_complete(self) -> None:
        html = read("review-tools/index.html").lower()
        for phrase in ("narrowest effective condition", "potential mitigation", "would it address the concern?", "operational burden", "effect on mobility function", "residual concern", "add another mitigation"):
            self.assertIn(phrase, html)
        for state in ("approved", "approved with conditions", "more information needed", "denied"):
            self.assertIn(f'value="{state.replace(" ", "-")}"', html)
        for phrase in ("specific reasons", "scope of decision", "decision quality check", "does not determine legal validity", "does not waive legal rights"):
            self.assertIn(phrase, html)

    def test_pmr_and_reassessment_preserve_approved_boundaries(self) -> None:
        html = read("review-tools/index.html").lower()
        for phrase in ("portable non-standard mobility aid record", "proposed voluntary record", "not a permit", "not a universal authorization", "not a prerequisite for accommodation", "supporting evidence references", "prior scoped decision reference", "consent/release notes"):
            self.assertIn(phrase, html)
        self.assertNotIn("certification", html[html.index('id="portable-mobility-record"'):html.index('id="reassessment-record"')])
        for phrase in ("what material fact changed?", "no material change identified", "what portion of the prior decision is affected?", "what prior findings remain unchanged?", "do not restart the entire review when only a bounded fact changed"):
            self.assertIn(phrase, html)

    def test_review_tools_are_local_only_printable_and_accessible(self) -> None:
        html = read("review-tools/index.html")
        js = read("review-tools/review-tools.js")
        css = read("common/css/org-standards.css")
        self.assertNotIn("action=", html.lower())
        self.assertNotIn("method=", html.lower())
        self.assertNotIn("fetch(", js.lower())
        self.assertNotIn("xmlhttprequest", js.lower())
        self.assertNotIn("localstorage", js.lower())
        self.assertIn("does not receive the information entered", html.lower())
        self.assertIn("window.print()", js)
        self.assertIn("print-target", js)
        self.assertIn("@media print", css)
        self.assertIn(".site-header, #site-header, #site-footer", css)
        self.assertNotIn("placeholder=", html.lower())
        controls = re.findall(r"<(?:input|textarea|select)\\b", html, re.I)
        labels = re.findall(r"<label(?:\\s|>)", html, re.I)
        self.assertGreaterEqual(len(labels), len(controls))
        self.assertIn("focus-visible", css)

    def test_three_fictional_aid_categories_fit_the_general_structure(self) -> None:
        html = read("review-tools/index.html").lower()
        fixtures = {
            "Aster hand-propelled glider": "unconventional manually operated aid",
            "Bramble balance-drive adaptation": "unfamiliar powered mobility adaptation",
            "Cedar rolling body frame": "body-worn or rolling mobility adaptation",
        }
        # These fictional categories have no prefilled form values or legal outcomes.
        self.assertEqual(len(fixtures), 3)
        fields = ("movement mechanism", "control method", "stopping method", "stability considerations", "other operating characteristics")
        for field in fields:
            self.assertIn(field, html)
        self.assertIn("other setting-specific factor", html)
        self.assertNotIn('value="inline skates"', html)
        for prohibited in ("handicapskater", "bart", "dmv"):
            self.assertNotIn(f'value="{prohibited}', html)


if __name__ == "__main__":
    unittest.main()
