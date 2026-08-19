# Qwen Giulia developer setup

The public CCIA site remains static. `developer.html` is an internal-facing test surface for the replacement Giulia architecture.

## What is already scaffolded

- One visible Giulia chat UI.
- Qwen router with `cultural`, `business`, and `both` routes.
- Qwen Cultural and Business specialist calls.
- Qwen synthesis pass for `both` questions.
- No web-search, URL-fetch, or browsing tools.
- Route diagnostics returned to the developer UI.
- Optional `DEV_ACCESS_TOKEN` gate for the backend endpoint.
- Placeholder locations for the forthcoming prompts and knowledge bases.

## Required backend environment variables

- `DASHSCOPE_API_KEY` — Alibaba Cloud Model Studio API key. Keep this server-side only.
- `DASHSCOPE_BASE_URL` — OpenAI-compatible Model Studio base URL for the region/workspace, ending in `/compatible-mode/v1`.
- `QWEN_MODEL` — optional; defaults to `qwen3.7-plus` for the prototype.
- `DEV_ACCESS_TOKEN` — optional but recommended for any externally reachable intra-lab endpoint.

Alibaba Cloud Model Studio's current Qwen API supports OpenAI-compatible `POST /chat/completions`; `api/chat.js` uses that HTTP shape directly so no SDK dependency is required.

## Hosting note

GitHub Pages cannot safely hold `DASHSCOPE_API_KEY` and cannot execute `api/chat.js`. The developer page can remain on GitHub Pages, but the `/api/chat` handler must be deployed to a server/serverless environment that supports JavaScript functions and environment secrets (or be run locally during lab testing). Point the developer page's **API endpoint** field at that URL.

Do not put a Qwen API key in `developer.html`, repository files, query strings, or browser local storage.

## When the lab prompts and KB arrive

1. Put shared Giulia identity/epistemic rules in `prompts/giulia-core.md`.
2. Put domain instructions in `prompts/cultural.md` and `prompts/business.md`.
3. Put approved source material under `knowledge/shared`, `knowledge/cultural`, and `knowledge/business`.
4. Replace the placeholder prompt constants in `api/chat.js` with a build/deploy loader that compiles those files into the handler environment.
5. Add retrieval only if the combined approved corpus becomes too large or expensive to include directly.

## Prototype privacy

The current scaffold does not persist transcripts. Conversation history lives in the browser tab and is sent with each request. Add controlled transcript storage only after the lab decides the logging/consent policy for this prototype.
