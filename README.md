# HandicapSkater.org Standards Site

This repository is the public standards, doctrine, policy, and accommodation guidance site for HandicapSkater.org.

It is intentionally separate from HandicapSkater.com:

- `biomechanics/` is the public .com case study and wearable evidence site.
- `standards/` is the public .org standards and policy site.
- `handicapskater-workspace/` remains coordination only.

The site should use public source anchors rather than visible citation TODOs. Do not copy private legal files or raw evidence into this repo.

## Initial structure

- Home: mission and standards purpose.
- Non-traditional mobility aids: function over appearance.
- Evidence standards: records, labels, surrogate labels, duplicates, baselines, uncertainty, and caveats.
- Reviewer guidance: safe review practices for clinicians, agencies, employers, courts, and platforms.
- Public record: selected public accommodation history with legal caution.
- Relationship to `.com`: `.org` carries standards and public-interest education; `.com` carries the commercial platform and healthcare/product story.

## Local checks

```sh
python3 -m unittest discover -s tests
python3 scripts/check_links.py
```
