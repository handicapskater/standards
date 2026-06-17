#!/usr/bin/env python3
"""Static internal-link checks for the public HandicapSkater site."""

from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parents[1]

PUBLIC_PAGES = [
    Path("index.html"),
    Path("accommodation-framework.html"),
    Path("fsi-css-platform.html"),
    Path("references.html"),
    Path("direct-threat-analysis.html"),
    Path("reviewer-guidance.html"),
    Path("dot-fta-doj-timeline.html"),
    Path("non-traditional-mobility-aids.html"),
    Path("standards.html"),
    Path("standards.html"),
    Path("evidence-standards.html"),
    Path("public-record.html"),
    Path("transportation-accommodation.html"),
]


class RefParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.refs: list[tuple[str, str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr_map = dict(attrs)
        for attr in ("href", "src"):
            value = attr_map.get(attr)
            if value:
                self.refs.append((tag, attr, value))


def is_ignored(url: str) -> bool:
    parsed = urlparse(url)
    return (
        url.startswith(("#", "mailto:", "tel:", "javascript:"))
        or parsed.scheme in {"http", "https", "data"}
    )


def resolve_local(page: Path, url: str) -> Path | None:
    if is_ignored(url):
        return None
    parsed = urlparse(url)
    path = unquote(parsed.path)
    if path.startswith("/"):
        target = ROOT / path.lstrip("/")
    else:
        target = (ROOT / page).parent / path
    if path.endswith("/") or url.endswith("/"):
        target = target / "index.html"
    return target


def collect_refs(page: Path) -> list[tuple[str, str, str]]:
    parser = RefParser()
    parser.feed((ROOT / page).read_text(errors="ignore"))
    return parser.refs


def check_pages(pages: list[Path]) -> list[str]:
    failures: list[str] = []
    for page in pages:
        full = ROOT / page
        if not full.exists():
            failures.append(f"missing page: {page}")
            continue
        for tag, attr, url in collect_refs(page):
            target = resolve_local(page, url)
            if target is not None and not target.exists():
                failures.append(f"{page}: broken {tag}[{attr}] {url} -> {target.relative_to(ROOT)}")
    return failures


def main() -> int:
    failures = check_pages(PUBLIC_PAGES)
    if failures:
        print("\n".join(failures))
        return 1
    print(f"OK: checked {len(PUBLIC_PAGES)} public pages")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
