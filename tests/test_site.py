from __future__ import annotations

import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REQUIRED_PAGES = [
    "index.html",
    "standards.html",
    "non-traditional-mobility-aids.html",
    "dot-fta-doj-timeline.html",
    "accommodation-framework.html",
    "direct-threat-analysis.html",
    "references.html",
]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


class StandardsSiteTests(unittest.TestCase):
    def test_required_pages_exist(self) -> None:
        for page in REQUIRED_PAGES:
            self.assertTrue((ROOT / page).exists(), page)

    def test_homepage_positions_org_site_and_links_to_com(self) -> None:
        html = read("index.html")
        lower = html.lower()

        self.assertIn("public standards and policy site", lower)
        self.assertIn("non-traditional mobility aid standards", lower)
        self.assertIn("what this site does", lower)
        self.assertIn("federal timeline", lower)
        self.assertIn("review framework", lower)
        self.assertIn("standards, not case adjudication", lower)
        self.assertIn("continue reading", lower)

        self.assertIn("handicapskater.org separates standards from case evidence", lower)
        self.assertIn("handicapskater.com documents the individual case study", lower)
        self.assertIn("opdmd is powered-device language", lower)
        self.assertIn("roller skates are presented here as a non-traditional mobility aid", lower)

        self.assertIn("handicapskater.com", lower)
        self.assertIn("https://handicapskater.com/", html)
        self.assertNotIn("[TODO", html)

    def test_homepage_contains_federal_timeline_years(self) -> None:
        html = read("index.html")
        self.assertIn("2005 DOT", html)
        self.assertIn("2007 DOT/FTA", html)
        self.assertIn("2010 DOJ", html)

    def test_homepage_is_not_overly_repetitive(self) -> None:
        lower = read("index.html").lower()

        # The homepage should introduce core concepts, not repeat the whole doctrine.
        self.assertLessEqual(lower.count("environment-specific"), 4)
        self.assertLessEqual(lower.count("source-linked"), 4)
        self.assertLessEqual(lower.count("individualized"), 6)
        self.assertLessEqual(lower.count("direct threat"), 4)
        self.assertLessEqual(lower.count("non-traditional mobility aid"), 6)

        # These old long-form section headings should be merged or moved off the homepage.
        self.assertNotIn("regulatory promise", lower)
        self.assertNotIn("three related but separate concepts", lower)
        self.assertNotIn("how .org differs from .com", lower)

    def test_homepage_has_compact_front_door_structure(self) -> None:
        html = read("index.html")
        lower = html.lower()

        expected_sections = [
            "what this site does",
            "federal timeline",
            "review framework",
            "standards, not case adjudication",
            "continue reading",
        ]

        for section in expected_sections:
            self.assertIn(section, lower)

        self.assertIn("2005 DOT", html)
        self.assertIn("2007 DOT/FTA", html)
        self.assertIn("2010 DOJ", html)

        for link in (
            "standards.html",
            "non-traditional-mobility-aids.html",
            "dot-fta-doj-timeline.html",
            "accommodation-framework.html",
            "direct-threat-analysis.html",
            "references.html",
            "https://handicapskater.com/",
        ):
            self.assertIn(link, html)


    def test_navigation_labels_are_compact(self) -> None:
        js = read("common/site-header.js")

        self.assertIn('label: "Home"', js)
        self.assertIn('label: "Mobility Aids"', js)
        self.assertIn('label: "Timeline"', js)
        self.assertIn('label: "Framework"', js)
        self.assertIn('label: "Direct Threat"', js)
        self.assertIn('label: "Case Study"', js)

        self.assertNotIn('label: "Non-Traditional Mobility Aids"', js)
        self.assertNotIn('label: "DOT/FTA/DOJ Timeline"', js)
        self.assertNotIn('label: "Accommodation Framework"', js)
        self.assertNotIn('label: "Case Study on .com"', js)

    def test_navigation_css_prevents_desktop_wrap(self) -> None:
        css = read("common/css/global.css")

        self.assertIn("flex-wrap: nowrap", css)
        self.assertIn("overflow-x: auto", css)
        self.assertIn("white-space: nowrap", css)
        self.assertIn(".site-nav a.external", css)
        self.assertIn(".brand", css)

    def test_case_study_link_is_prominent(self) -> None:
        html = read("index.html")

        self.assertIn("Case study and evidence record", html)
        self.assertIn("https://handicapskater.com/", html)
        self.assertIn("Open HandicapSkater.com case study", html)
        self.assertIn('class="btn primary"', html)


    def test_timeline_contains_2005_2007_2010(self) -> None:
        html = read("dot-fta-doj-timeline.html")
        self.assertIn("2005 DOT", html)
        self.assertIn("2007 DOT/FTA", html)
        self.assertIn("2010 DOJ", html)
        self.assertIn("DOT recognized the non-traditional mobility-device concept before DOJ codified OPDMDs", html)

    def test_opdmd_and_skates_distinction_appears(self) -> None:
        for page in ("index.html", "non-traditional-mobility-aids.html"):
            lower = read(page).lower()
            self.assertIn("opdmd", lower)
            self.assertIn("skates", lower)
            self.assertIn("powered-device", lower)
            self.assertNotIn("doj specifically codifying skates", lower)

    def test_no_universal_skates_access_overstatement(self) -> None:
        joined = "\n".join(read(page).lower() for page in REQUIRED_PAGES)
        forbidden = [
            "skates must be allowed everywhere",
            "opdmd proves skates are covered",
            "final legal victory",
            "universal right to use skates everywhere",
        ]
        for phrase in forbidden:
            self.assertNotIn(phrase, joined)

    def test_no_public_todo_citations(self) -> None:
        for page in REQUIRED_PAGES:
            html = read(page)
            self.assertNotIn("[TODO", html, page)
            self.assertNotIn("TODO:", html, page)
            self.assertNotIn("Sources being prepared", html)

    def test_accommodation_framework_questions_exist(self) -> None:
        lower = read("accommodation-framework.html").lower()
        self.assertIn("because of a mobility disability", lower)
        self.assertIn("functional limitation", lower)
        self.assertIn("physically accommodated", lower)
        self.assertIn("actual risk, not speculation", lower)
        self.assertIn("environment-specific", lower)
        self.assertIn("documented and reviewable", lower)

    def test_direct_threat_page_is_environment_specific(self) -> None:
        lower = read("direct-threat-analysis.html").lower()
        for term in ("speed", "control", "crowding", "platform edges", "vehicle boarding", "indoor concourses", "sidewalks", "waiting areas"):
            self.assertIn(term, lower)

    def test_navigation_labels_are_compact(self) -> None:
        js = read("common/site-header.js")

        self.assertIn('label: "Mobility Aids"', js)
        self.assertIn('label: "Timeline"', js)
        self.assertIn('label: "Framework"', js)
        self.assertIn('label: "Case Study"', js)

        self.assertNotIn('label: "Non-Traditional Mobility Aids"', js)
        self.assertNotIn('label: "DOT/FTA/DOJ Timeline"', js)
        self.assertNotIn('label: "Accommodation Framework"', js)
        self.assertNotIn('label: "Case Study on .com"', js)


    def test_only_external_nav_links_open_new_tab(self) -> None:
        js = read("common/site-header.js")

        self.assertIn('link.href.startsWith("http")', js)
        self.assertIn('target="_blank"', js)
        self.assertIn('rel="noopener noreferrer"', js)


    def test_homepage_case_study_cta_is_prominent(self) -> None:
        html = read("index.html")

        self.assertIn("Case study and evidence record", html)
        self.assertIn("Open HandicapSkater.com case study", html)
        self.assertIn('href="https://handicapskater.com/"', html)


    def test_homepage_does_not_duplicate_old_sections(self) -> None:
        lower = read("index.html").lower()

        self.assertNotIn("regulatory promise", lower)
        self.assertNotIn("three related but separate concepts", lower)
        self.assertNotIn("how .org differs from .com", lower)


    def test_language_consistency(self) -> None:
        html = "\n".join(read(page) for page in REQUIRED_PAGES)
        lower = html.lower()

        self.assertNotIn("environment specific", lower)
        self.assertNotIn("source linked", lower)
        self.assertNotIn("power driven", lower)
        self.assertIn("environment-specific", lower)
        self.assertIn("source-linked", lower)
        self.assertIn("power-driven", lower)


    def test_references_are_public_source_anchors_not_todos(self) -> None:
        html = read("references.html")
        lower = html.lower()

        self.assertIn("public source anchors", lower)
        self.assertIn("core federal timeline sources", lower)
        self.assertIn("doj opdmd regulations and public guidance", lower)

        self.assertNotIn("[TODO", html)
        self.assertNotIn("sources being prepared", lower)

    def test_language_consistency(self) -> None:
        html = "\n".join(read(page) for page in REQUIRED_PAGES)
        lower = html.lower()

        self.assertNotIn("environment specific", lower)
        self.assertNotIn("source linked", lower)
        self.assertNotIn("power driven", lower)

        self.assertIn("environment-specific", lower)
        self.assertIn("source-linked", lower)
        self.assertIn("power-driven", lower)


    def test_timeline_2010_language_is_clean(self) -> None:
        html = read("dot-fta-doj-timeline.html")
        lower = html.lower()

        self.assertIn("september 15, 2010", lower)
        self.assertIn("other power-driven mobility devices", lower)
        self.assertIn("skates and roller skates should be discussed separately from opdmds", lower)
        self.assertNotIn("other power driven mobility devices", lower)


    def test_direct_threat_has_do_do_not_guidance(self) -> None:
        html = read("direct-threat-analysis.html")
        lower = html.lower()

        self.assertIn("do / do not", lower)
        self.assertIn("actual safety facts", lower)
        self.assertIn("generalized discomfort", lower)


if __name__ == "__main__":
    unittest.main()
