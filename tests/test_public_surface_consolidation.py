from __future__ import annotations

import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class StandardsPublicSurfaceTests(unittest.TestCase):
    def test_primary_standard_pages_have_no_personal_graph_mounts(self) -> None:
        for page in ("index.html", "protocol/index.html", "review-tools/index.html", "actual-risk/index.html", "certification-model/index.html", "current-law-sources/index.html", "case-study/inline-skates/index.html", "feedback-and-pilots/index.html"):
            self.assertNotIn('data-publication-graph="', (ROOT / page).read_text(errors="ignore"), page)

    def test_observatory_link_is_centralized_for_current_temporary_url(self) -> None:
        config = (ROOT / "common/evidence-observatory.js").read_text()
        self.assertIn("PUBLIC_EVIDENCE_OBSERVATORY_URL", config)
        self.assertIn("https://evidence.handicapskater.com/", config)
        for page in ("case-study/inline-skates/index.html", "evidence-review/index.html"):
            html = (ROOT / page).read_text()
            self.assertIn("data-evidence-observatory-link", html)
            self.assertIn("evidence-observatory.js", html)
