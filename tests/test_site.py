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
        self.assertIn("How .org differs from .com", html)
        self.assertIn("Standards, not case adjudication", html)
        self.assertIn("handicapskater.com", lower)
        self.assertIn("https://handicapskater.com/", html)
        self.assertNotIn("[TODO", html)

    def test_homepage_contains_federal_timeline_years(self) -> None:
        html = read("index.html")
        self.assertIn("2005 DOT", html)
        self.assertIn("2007 DOT/FTA", html)
        self.assertIn("2010 DOJ", html)

    def test_timeline_contains_2005_2007_2010(self) -> None:
        html = read("dot-fta-doj-timeline.html")
        self.assertIn("2005 DOT", html)
        self.assertIn("2007 DOT/FTA", html)
        self.assertIn("2010 DOJ", html)
        self.assertIn("DOT recognized the non-traditional mobility-device concept before DOJ codified OPDMDs", html)

    def test_opdmd_and_skates_distinction_appears(self) -> None:
        for page in ("dot-fta-doj-timeline.html", "non-traditional-mobility-aids.html"):
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

    def test_todo_citations_are_explicitly_marked(self) -> None:
        html = "\n".join(read(page) for page in REQUIRED_PAGES)
        todos = re.findall(r"\[TODO:[^\]]+\]", html)
        self.assertGreaterEqual(len(todos), 4)
        self.assertIn("todo-citation", html)
        self.assertNotIn("<cite>[TODO:", html)

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


if __name__ == "__main__":
    unittest.main()
