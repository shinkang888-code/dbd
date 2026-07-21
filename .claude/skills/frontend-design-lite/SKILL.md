---
name: frontend-design-lite
description: Minimal port of Anthropic frontend-design — distinctive, non-generic UI for the admin/Studio dashboard. Use when creating or restyling anything under src/app/admin, src/app/studio, src/app/hq, or src/components.
---

Extracted essence, adapted to this repo (Next 15 + Tailwind v4 admin dashboard):

- Avoid the generic-AI look: no purple-gradient hero, no emoji bullets, no
  glassmorphism-by-default. Admin tools are read-dense — optimize for scanning,
  not marketing flourish.
- Reuse existing components in `src/components/{admin,ops,studio,hq}` before
  inventing new ones; one spacing grid, one type scale.
- Korean typography: `letter-spacing: 0`, body `line-height 1.6+`,
  `word-break: keep-all`, headings `text-wrap: balance`.
- Dense tables over cards for operational data (orders, sourcing, ledger);
  tabular-nums for numbers/currency.
- Charts must pass the dataviz six-checks before shipping.
- Tailwind v4 tokens only — don't introduce a second design system.
