"""Fail closed on NSMAEP publication or changes to committed public assets.

Accepts a built Jekyll directory or GitHub Pages artifact.tar, not a source tree.
Uses Git blobs rather than dirty working files as the expected public authority.
"""

from __future__ import annotations

import argparse
import hashlib
import re
import subprocess
import tarfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
DEMO_FILES = ("nsmaep/index.html", "nsmaep/nsmaep.css", "nsmaep/nsmaep.js")
REDIRECT_SOURCE = "nsmaep-entry.html"
REVIEW_SOURCE = "review-tools-entry.html"
SOURCE_ONLY = ("review-tools/", "nsmaep/", "tests/", "scripts/")
PUBLIC_REQUIRED = (
    "index.html",
    "protocol/index.html",
    "review-tools/index.html",
    "actual-risk/index.html",
    "evidence-review/index.html",
    "current-law-sources/index.html",
    "common/site-header.js",
    "CNAME",
)


def git(repository: Path, *args: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(repository), *args])


def read_artifact(artifact: Path) -> dict[str, bytes]:
    files = {}
    nsmaep_present = False
    if artifact.is_dir():
        for path in artifact.rglob("*"):
            relative = path.relative_to(artifact).as_posix()
            if path.is_symlink():
                raise ValueError(f"Artifact symlink forbidden: {relative}")
            if "nsmaep" in path.relative_to(artifact).parts:
                nsmaep_present = True
                if relative not in {"nsmaep", "nsmaep/index.html"}:
                    raise ValueError(f"NSMAEP demo published: {relative}")
            if path.is_file():
                files[relative] = path.read_bytes()
    else:
        with tarfile.open(artifact) as archive:
            for member in archive:
                path = PurePosixPath(member.name)
                if (
                    path.is_absolute()
                    or ".." in path.parts
                    or member.issym()
                    or member.islnk()
                ):
                    raise ValueError(f"Unsafe artifact member: {member.name}")
                if "nsmaep" in path.parts:
                    nsmaep_present = True
                    if path.as_posix() not in {"nsmaep", "nsmaep/index.html"}:
                        raise ValueError(f"NSMAEP demo published: {member.name}")
                if member.isfile():
                    name = path.as_posix()
                    if name in files:
                        raise ValueError(f"Duplicate artifact member: {name}")
                    stream = archive.extractfile(member)
                    if stream is None:
                        raise ValueError(f"Unreadable member: {name}")
                    files[name] = stream.read()
    if nsmaep_present:
        # Only the exact small redirect is permitted, never the local app bundle.
        expected = (ROOT / REDIRECT_SOURCE).read_bytes().split(b"---\n", 2)[2]
        if files.get("nsmaep/index.html") != expected:
            raise ValueError("NSMAEP route is not the approved redirect")
    return files


def validate(artifact: Path, repository: Path = ROOT, revision: str = "HEAD") -> int:
    tracked = (
        git(repository, "ls-tree", "-rz", "--name-only", revision).decode().split("\0")
    )
    if not set(DEMO_FILES).issubset(tracked):
        raise ValueError("All three NSMAEP files must remain committed source")
    demo_hashes = {
        hashlib.sha256(git(repository, "show", f"{revision}:{name}")).digest()
        for name in DEMO_FILES
    }
    files = read_artifact(artifact)
    if not set(PUBLIC_REQUIRED).issubset(files):
        raise ValueError("Artifact missing required public routes/assets")
    for name, content in files.items():
        if hashlib.sha256(content).digest() in demo_hashes:
            raise ValueError(f"Renamed NSMAEP source published: {name}")
    # Check all artifact bytes, not only expected HTML filenames. A renamed
    # schema, script, source test or form archive must not bypass publication.
    authored = git(repository, "show", f"{revision}:review-tools/index.html")
    fields = set(re.findall(rb'\bname=["\x27]([^"\x27]+)', authored)) - {b"viewport", b"description"}
    for name, content in files.items():
        if name.startswith(SOURCE_ONLY) and name not in {"review-tools/index.html", "nsmaep/index.html"}:
            raise ValueError(f"Protected review source published: {name}")
        if b"data-review-form" in content or b'"question_id"' in content:
            raise ValueError(f"Protected questionnaire published: {name}")
        if any(re.search(rb'\bname=["\x27]' + re.escape(field) + rb'["\x27]', content) for field in fields):
            raise ValueError(f"Protected form control published: {name}")
    public = [
        name
        for name in tracked
        if name
        and not name.startswith(SOURCE_ONLY)
        and name not in {REDIRECT_SOURCE, REVIEW_SOURCE}
        and (
            Path(name).suffix in {".html", ".css", ".js", ".json", ".svg", ".ico"}
            or name == "CNAME"
        )
    ]
    for name in public:
        if files.get(name) != git(repository, "show", f"{revision}:{name}"):
            raise ValueError(f"Committed public asset missing or changed: {name}")
    if REDIRECT_SOURCE in tracked:
        expected = git(repository, "show", f"{revision}:{REDIRECT_SOURCE}").split(b"---\n", 2)[2]
        if files.get("nsmaep/index.html") != expected:
            raise ValueError("NSMAEP approved redirect missing or changed")
    if REVIEW_SOURCE in tracked:
        expected = git(repository, "show", f"{revision}:{REVIEW_SOURCE}").split(b"---\n", 2)[2]
        if files.get("review-tools/index.html") != expected:
            raise ValueError("Registered-only review shell missing or changed")
    return len(public)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("artifact", type=Path)
    parser.add_argument("--repository", type=Path, default=ROOT)
    parser.add_argument("--revision", default="HEAD")
    args = parser.parse_args()
    try:
        count = validate(args.artifact, args.repository, args.revision)
    except (
        ValueError,
        OSError,
        tarfile.TarError,
        subprocess.CalledProcessError,
    ) as error:
        parser.exit(1, f"FAIL: {error}\n")
    print(
        f"PASS: NSMAEP source tracked; artifact excludes demo; {count} public assets byte-identical"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
