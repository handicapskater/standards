from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
import sys

ROOT = Path(__file__).resolve().parents[1]
BASE_URL = "https://handicapskater.org/"
HTML_FILES = [path for path in ROOT.rglob("*.html") if ".git" not in path.parts]
SKIP_SCHEMES = {"mailto", "tel", "javascript"}


class LinkParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.links: list[tuple[str, str]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = dict(attrs)
        for name in ("href", "src"):
            value = attr.get(name)
            if value:
                self.links.append((tag, value))


def local_path_for_url(url: str) -> Path | None:
    parsed = urlparse(url)
    if parsed.scheme and parsed.netloc and parsed.netloc not in {"handicapskater.org", "www.handicapskater.org"}:
        return None
    path = parsed.path or "/"
    if path.endswith("/"):
        path += "index.html"
    candidate = ROOT / path.lstrip("/")
    if candidate.exists():
        return candidate
    if not candidate.suffix:
        html_candidate = ROOT / (path.lstrip("/") + ".html")
        if html_candidate.exists():
            return html_candidate
    return candidate


def check_links() -> list[str]:
    failures: list[str] = []
    for html_file in HTML_FILES:
        parser = LinkParser()
        parser.feed(html_file.read_text(encoding="utf-8", errors="ignore"))
        page_url = urljoin(BASE_URL, str(html_file.relative_to(ROOT)).replace("index.html", ""))
        for _, raw in parser.links:
            raw = raw.strip()
            if not raw or raw.startswith("#"):
                continue
            parsed_raw = urlparse(raw)
            if parsed_raw.scheme in SKIP_SCHEMES:
                continue
            absolute = urljoin(page_url, raw)
            parsed = urlparse(absolute)
            if parsed.netloc in {"", "handicapskater.org", "www.handicapskater.org"}:
                candidate = local_path_for_url(absolute)
                if not candidate or not candidate.exists():
                    failures.append(f"{html_file.relative_to(ROOT)}: broken internal {raw} -> {candidate}")
    return failures


def main() -> int:
    failures = check_links()
    if failures:
        print("Broken links found:")
        for failure in failures:
            print(f"  - {failure}")
        return 1
    print(f"OK: checked {len(HTML_FILES)} HTML files. External links are intentionally not fetched.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
