# Cooee — public site

Public pages for [Cooee](https://github.com/daviddef/Cooee-Private), an
Australian phone-number scam-risk project.

## `index.html` — Report a scam call

Verified fraud-reporting numbers for major Australian banks, plus who else to
tell and why a bank's own number can appear on a scam call.

**This page is generated, not hand-written.** It is built from a machine-checked
registry in the private repo, where every number carries the URL it was read
from and the date it was checked. Each row on the page links to that source.
Regenerate with:

```
node scripts/build-public-page.ts > out/index.html
```

Two rules the generator enforces, because getting them wrong could hurt someone:

- **Every number is validated** as a real Australian number before it is
  published. Anything that fails is dropped, never repaired by guesswork.
- **Numbers an organisation says it never calls from are never rendered as
  callable links.** Some are lines scammers use for impersonation, so they
  appear only in a warning block — listed to be recognised, not rung.

If a bank changes a number, this page can be stale until it is rebuilt. The
source link beside each entry is the authority.
