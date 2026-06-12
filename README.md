# HandicapSkater.org Standards Site

This repository is the public standards, doctrine, policy, and accommodation guidance site for HandicapSkater.org.

It is intentionally separate from HandicapSkater.com:

- `biomechanics/` is the public .com case study and wearable evidence site.
- `standards/` is the public .org standards and policy site.
- `handicapskater-workspace/` remains coordination only.

The initial site uses TODO citation markers for federal source material until public source URLs or approved public copies are added. Do not copy private legal files or raw evidence into this repo.

## Local checks

```sh
python3 -m unittest discover -s tests
python3 scripts/check_links.py
```

