# HandicapSkater.org Standards Site

This repository is the public standards, doctrine, policy, and accommodation guidance site for HandicapSkater.org.

It is intentionally separate from HandicapSkater.com:

- `biomechanics/` is the public .com case study and wearable evidence site.
- `standards/` is the public .org standards and policy site.
- `handicapskater-workspace/` remains coordination only.

The site should use public source anchors rather than visible citation TODOs. Do not copy private legal files or raw evidence into this repo.

## Initial structure

- Home: mission and standards purpose.
- Non-standard mobility aids: function over appearance.
- Evidence standards: records, labels, surrogate labels, duplicates, baselines, uncertainty, and caveats.
- Reviewer guidance: safe review practices for clinicians, agencies, employers, courts, and platforms.
- Public record: selected public accommodation history with legal caution.
- Relationship to `.com`: `.org` carries standards and public-interest education; `.com` carries the commercial platform and healthcare/product story.

## Pages publication boundary

Pages is configured as **Deploy from a branch**, `main` / repository root.
GitHub's managed `pages build and deployment` uses Jekyll (last observed:
github-pages 232 / Jekyll 3.10.0), then uploads/deploys its `_site` artifact.
There is no custom workflow or copy step in this repository. Keep that mechanism.

`_config.yml` excludes `nsmaep/` using Jekyll's supported exclusion mechanism;
the three demo files remain committed source for the local API. Because Jekyll 3
replaces default exclusions, the config retains its seven default exclusions.
Do not add `.nojekyll`, use `.gitignore` as publication control, re-include the
demo, add a redirect, or deploy a source-tree copy that bypasses Jekyll.

```text
NSMAEP_SOURCE_ONLY=true
PUBLICATION_EXCLUDED=true
PUBLIC_REGISTRATION_DISABLED=true
```

Build a clean Git snapshot, not a dirty working directory. For example, after
the reviewed changes are committed, with Jekyll 3.10.0 installed locally:

```sh
pages_check_dir=$(mktemp -d)
pages_repository=$(pwd)
mkdir "$pages_check_dir/source"
git archive HEAD | tar -x -C "$pages_check_dir/source"
jekyll build --safe --source "$pages_check_dir/source" --destination "$pages_check_dir/site"
python3 scripts/check_pages_artifact.py "$pages_check_dir/site"
(cd "$pages_check_dir/source" && PAGES_REPOSITORY="$pages_repository" PAGES_ARTIFACT="$pages_check_dir/site" python3 -m unittest discover -s tests)
python3 "$pages_check_dir/source/scripts/check_links.py"
python3 "$pages_check_dir/source/scripts/check_site_links.py"
```

Local Jekyll proves the exclusion/static-byte behavior; GitHub's managed build
adds its normal Pages theme/plugins. After push, download that run's `github-pages`
artifact with `gh run download RUN_ID -n github-pages -D NEW_TEMP_DIRECTORY` and
run the same guard on `artifact.tar`. It checks tracked demo source, absence of
the demo directory/renamed files, required public routes, and byte parity of
committed public HTML/CSS/JS/JSON/images/CNAME. It uses committed bytes, not local
unrelated edits. Never upload the unfiltered Git source as the site artifact.

The publication tests require `PAGES_ARTIFACT` and fail rather than skip when no
real build is supplied. Negative tests reject leaked directories, renamed demo
source and missing public routes. A future custom Pages workflow or `.nojekyll`
requires an explicit migration of this guard to run **before** artifact upload;
classic branch Pages cannot run a custom pre-deploy hook. Do not represent this
local release gate as a configured GitHub branch-protection check.

Expected live result: `/nsmaep/`, `/nsmaep/index.html`, `/nsmaep/nsmaep.css` and
`/nsmaep/nsmaep.js` are not found. Existing public pages, including `/review-tools/`,
retain their committed contents. No registration backend, Firebase auth, database
or uploaded document service is deployed by Pages.

References: [GitHub Pages and Jekyll](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll)
and [Jekyll exclude configuration](https://jekyllrb.com/docs/configuration/options/).
