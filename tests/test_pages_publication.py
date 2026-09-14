"""Source policy plus real-artifact/negative publication tests; no network."""

import importlib.util
import io
import json
import os
import subprocess
import tarfile
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPOSITORY = Path(os.environ.get("PAGES_REPOSITORY", ROOT))
spec = importlib.util.spec_from_file_location(
    "pages_check", ROOT / "scripts/check_pages_artifact.py"
)
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)


class PagesPublicationTests(unittest.TestCase):
    def test_source_is_committed_and_jekyll_cannot_be_bypassed(self):
        tracked = (
            guard.git(REPOSITORY, "ls-tree", "-rz", "--name-only", "HEAD")
            .decode()
            .split("\0")
        )
        self.assertTrue(set(guard.DEMO_FILES).issubset(tracked))
        self.assertFalse(
            (ROOT / ".nojekyll").exists(), "Would bypass the publication exclusion"
        )
        config = json.loads(
            subprocess.check_output(
                [
                    "ruby",
                    "-ryaml",
                    "-rjson",
                    "-e",
                    "puts JSON.generate(YAML.safe_load(File.read(ARGV[0])))",
                    str(ROOT / "_config.yml"),
                ]
            )
        )
        required = {
            "Gemfile",
            "Gemfile.lock",
            "node_modules",
            "vendor/bundle/",
            "vendor/cache/",
            "vendor/gems/",
            "vendor/ruby/",
            "nsmaep/",
            "review-tools/",
            "scripts/",
            "tests/",
            "README.md",
        }
        self.assertTrue(required.issubset(config["exclude"]))
        self.assertNotIn(
            "include",
            config,
            "Review include/exclude precedence before changing policy",
        )
        self.assertNotIn(
            "keep_files", config, "Must not retain previously published demo files"
        )
        self.assertNotIn("plugins_dir", config)
        # Fail closed if the publishing mechanism changes. A replacement must
        # run the artifact guard BEFORE upload/deploy, not just test configuration.
        workflows = ROOT / ".github/workflows"
        for workflow in workflows.glob("*"):
            text = workflow.read_text().lower()
            self.assertFalse(
                any(
                    marker in text
                    for marker in (
                        "deploy-pages",
                        "upload-pages-artifact",
                        "gh-pages",
                        "pages-deploy",
                    )
                ),
                "Custom Pages workflow requires a reviewed artifact-guard migration",
            )

    def test_artifact_guard_rejects_demo_directory_even_if_empty(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "nsmaep").mkdir()
            with self.assertRaisesRegex(ValueError, "NSMAEP"):
                guard.validate(root, REPOSITORY)

    def test_guard_requires_normal_public_routes(self):
        with (
            tempfile.TemporaryDirectory() as directory,
            self.assertRaisesRegex(ValueError, "required public"),
        ):
            guard.validate(Path(directory), REPOSITORY)

    def test_archive_cannot_hide_demo_with_dot_prefix(self):
        with tempfile.TemporaryDirectory() as directory:
            archive = Path(directory) / "artifact.tar"
            with tarfile.open(archive, "w") as out:
                entry = tarfile.TarInfo("./nsmaep/index.html")
                entry.size = 4
                out.addfile(entry, io.BytesIO(b"demo"))
            with self.assertRaisesRegex(ValueError, "NSMAEP"):
                guard.validate(archive, REPOSITORY)

    def test_only_redirect_not_private_bundle_allowed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / "nsmaep").mkdir()
            redirect = (ROOT / guard.REDIRECT_SOURCE).read_bytes().split(b"---\n", 2)[2]
            (root / "nsmaep/index.html").write_bytes(redirect)
            self.assertEqual(guard.read_artifact(root)["nsmaep/index.html"], redirect)
            (root / "nsmaep/nsmaep.js").write_text("private demo")
            with self.assertRaisesRegex(ValueError, "NSMAEP"):
                guard.read_artifact(root)

    def test_renamed_demo_is_not_allowed(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name in guard.PUBLIC_REQUIRED:
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(guard.git(REPOSITORY, "show", f"HEAD:{name}"))
            (root / "registration.html").write_bytes(
                guard.git(REPOSITORY, "show", "HEAD:nsmaep/index.html")
            )
            with self.assertRaisesRegex(ValueError, "Renamed NSMAEP"):
                guard.validate(root, REPOSITORY)

    def test_actual_pages_artifact(self):
        # Mandatory: a missing build is a failure, never a silently skipped test.
        artifact = os.environ.get("PAGES_ARTIFACT")
        self.assertTrue(
            artifact, "Set PAGES_ARTIFACT to a real Jekyll build or Pages artifact.tar"
        )
        self.assertGreater(guard.validate(Path(artifact), REPOSITORY), 0)

    def test_review_shell_contains_no_questionnaire(self):
        shell = (ROOT / guard.REVIEW_SOURCE).read_text()
        self.assertNotIn("data-review-form", shell)
        self.assertNotIn("<input", shell)
        self.assertNotIn("<textarea", shell)
        self.assertIn("Sign in", shell)
        self.assertIn("Request access", shell)
        self.assertIn("/common/registered-review.js", shell)

    def test_renamed_questionnaire_is_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            for name in guard.PUBLIC_REQUIRED:
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(b"placeholder")
            (root / "innocent.txt").write_bytes(b'<input name="intake-limited-task">')
            with self.assertRaisesRegex(ValueError, "Protected form"):
                guard.validate(root, REPOSITORY)


if __name__ == "__main__":
    unittest.main()
