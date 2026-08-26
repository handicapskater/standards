from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_org_retains_generalized_reviewer_framing_and_visual_identity():
    page = (ROOT / "index.html").read_text()
    assert 'class="site-org"' in page
    assert "FUNCTION BEFORE APPEARANCE" in page
    assert "Evaluate the actual vehicle environment and the person’s task" in page
    assert "long-life mobility design" in page.lower()


def test_org_fixed_rail_wording_assigns_no_result():
    page = (ROOT / "index.html").read_text()
    assert "access-limited and unmeasured" in page
    assert "leave comparative values unassigned" in page


def test_org_longitudinal_method_is_generalized_and_contains_no_personal_phase2_graph():
    page = (ROOT / "evidence-review/index.html").read_text()
    lower = page.lower()
    for text in (
        "paired mobility context",
        "reference-distribution governance",
        "declared historical window",
        "minimum reference support",
        "measurement grain",
        "multiplicity",
        "effective-event authority",
        "evaluated, sensitivity, screening, or future experiment",
    ):
        assert text in lower
    for graph_id in (
        "paired_fns_sns_max_hr",
        "paired_fns_sns_outcome_summary",
        "extreme_hr_reference_sensitivity",
        "temporal_context_decomposition",
        "episodic_mechanical_hr_response",
    ):
        assert graph_id not in page
