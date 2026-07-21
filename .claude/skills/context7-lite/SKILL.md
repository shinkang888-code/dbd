---
name: context7-lite
description: Minimal port of Context7 — pull current official docs before using an unfamiliar or version-sensitive library API. Use when adding/upgrading a dependency, or touching drizzle-orm, @neondatabase/serverless, Neon Auth, or Tosspayments/Stripe APIs.
---

Extracted essence (upstream is an MCP server; ported as a doc-fetch discipline):

1. Check the pinned version first (`package.json`).
2. WebFetch the official docs/changelog FOR THAT VERSION — not from memory.
   Key sources here: orm.drizzle.team, neon.tech/docs (serverless driver + Auth),
   docs.tosspayments.com, stripe.com/docs, nextjs.org/docs (App Router).
3. Quote the doc line that justifies any non-obvious API usage in your report.
4. Schema changes go through `drizzle-kit push` (`npm run db:push`) — never
   hand-write DDL against the shared Neon DB.
