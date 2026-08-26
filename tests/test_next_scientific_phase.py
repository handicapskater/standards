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
