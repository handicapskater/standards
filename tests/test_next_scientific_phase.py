from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_org_retains_generalized_reviewer_framing_and_visual_identity():
    page = (ROOT / "index.html").read_text()
    assert 'class="site-org"' in page
    assert "FUNCTION BEFORE APPEARANCE" in page
    assert "A proposed protocol" in page
    assert "data-reviewer-example" not in page


def test_org_protocol_and_evidence_review_remain_separate_from_case_science():
    protocol = (ROOT / "protocol/index.html").read_text().lower()
    evidence = (ROOT / "evidence-review/index.html").read_text().lower()
    assert "eight stages" in protocol
    assert "whoop, polar, kubios, strava, fsi, and css are not prerequisites" in protocol
    assert "advanced instrumentation is not a prerequisite" in evidence
    for graph_id in (
        "paired_fns_sns_max_hr",
        "paired_fns_sns_outcome_summary",
        "extreme_hr_reference_sensitivity",
        "temporal_context_decomposition",
        "episodic_mechanical_hr_response",
    ):
        assert graph_id not in protocol
        assert graph_id not in evidence


def test_org_current_law_boundary_does_not_generalize_fta_or_opdmd_scope():
    page = (ROOT / "current-law-sources/index.html").read_text().lower()
    assert "does not classify inline skates as opdmds" in page
    assert "not a universal device classification, skate approval, or skate prohibition" in page
    assert "not a permit" in page
