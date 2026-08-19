# Giulia prompt and knowledge-base slots

This directory is the landing zone for the lab's forthcoming Giulia prompts and approved knowledge bases.

Planned files:

- `giulia-core.md` — shared identity, behavioral rules, epistemic limits, and continuity conventions used by every internal role.
- `router.md` — routing policy for `cultural`, `business`, and `both`.
- `cultural.md` — Giulia Cultural system prompt.
- `business.md` — Giulia Business system prompt.
- `../knowledge/cultural/` — approved cultural knowledge-base material.
- `../knowledge/business/` — approved business knowledge-base material.
- `../knowledge/shared/` — material both specialists may use.

The current prototype keeps placeholder prompts directly in `api/chat.js` so the backend can be exercised before the lab content arrives. Once the real material is supplied, move the substantive prompt text here and load/compile it during deployment or the build step.

None of the Giulia roles should receive web-search, URL-fetch, browsing, or arbitrary tool access. Their factual universe is the supplied conversation + approved prompt/KB context.
