---
name: superpowers-lite
description: Minimal port of obra/superpowers — brainstorm→plan→implement→verify workflow with systematic debugging. Use for multi-step features, "계획해서 만들어", or any non-trivial change in this repo.
---

Extracted essence (full repo is 20+ skills; only the core loop is ported):

1. **Brainstorm** — restate goal + constraints; check `docs/*.md` for an existing
   spec before designing; list 2-3 approaches, pick one, say why.
2. **Plan** — ordered checklist of small, individually verifiable steps (TaskCreate).
3. **Implement** — one step at a time; this repo shares its Neon DB with `lexistyle`
   (docs/dashboard-split.md) — schema/env changes need both sides considered.
4. **Debug systematically** — reproduce first; ONE hypothesis at a time; smallest
   possible probe; fix root cause, never patch symptoms.
5. **Report** — `npm run build` (and `smoke:studio` for Studio changes) output
   included; no "완료" without it (CLAUDE.md rule).
