# CCIA frictionless transcript logging

This setup logs public CCIA / Giulia test conversations without asking visitors to fill out a second form, install an extension, copy/paste transcripts, or leave the normal chat flow.

## Architecture

```txt
Visitor uses the existing RelevanceAI embedded chat
  -> Giulia C. / Giulia B. responds normally
  -> final RelevanceAI logging step sends one JSON POST
  -> Google Apps Script webhook
  -> Google Sheet row
```

The public `index.html` can stay as a static GitHub Pages site because logging happens from inside RelevanceAI, not by trying to scrape the iframe from the parent page.

## Why this is necessary

The RelevanceAI chat is embedded inside a cross-origin iframe from `app.relevanceai.com`. Browser security prevents the GitHub Pages parent page from reading message text inside that iframe. Frictionless transcript logging therefore needs to happen inside RelevanceAI or through a custom backend chat UI.

## Files

- `google-apps-script-webhook.gs`: paste this into a Google Apps Script project attached to a Google Sheet.

## Google Sheet setup

1. Create a new Google Sheet, for example `CCIA Transcript Logs`.
2. Go to **Extensions -> Apps Script**.
3. Paste the contents of `google-apps-script-webhook.gs` into `Code.gs`.
4. Optional but recommended: set a shared secret.
   - In Apps Script, go to **Project Settings -> Script Properties**.
   - Add property name: `CCIA_LOG_SECRET`.
   - Add a long random value.
5. Deploy the script:
   - Click **Deploy -> New deployment**.
   - Type: **Web app**.
   - Execute as: **Me**.
   - Who has access: **Anyone** or **Anyone with the link**, depending on what your Google account allows.
6. Copy the deployed web app URL.

The script will create or reuse a sheet tab named `ccia_transcripts` and append rows with these columns:

| Column | Description |
| --- | --- |
| `timestamp` | Server-side ISO timestamp from Apps Script |
| `agent` | `Giulia C.` or `Giulia B.` |
| `human_input_text` | Visitor's prompt/input |
| `bot_output_text` | Agent's final response |
| `session_id` | Optional session ID if RelevanceAI exposes one |
| `conversation_id` | Optional conversation/conversation run ID if exposed |
| `source` | Usually `relevance_embed` |
| `raw_json` | Full submitted payload for debugging |

## RelevanceAI setup for each Giulia

For each agent, add a final logging step/tool after the response is produced. The step should send an HTTP POST to the Apps Script web app URL.

Suggested JSON body:

```json
{
  "secret": "YOUR_SHARED_SECRET_IF_USED",
  "agent": "Giulia C.",
  "human_input_text": "{{ latest_user_message }}",
  "bot_output_text": "{{ final_agent_response }}",
  "session_id": "{{ session_id }}",
  "conversation_id": "{{ conversation_id }}",
  "source": "relevance_embed"
}
```

For Giulia B., change `agent` to `Giulia B.`.

The exact variable names may differ inside RelevanceAI. The key task is to map:

- latest human/user input -> `human_input_text`
- final visible agent answer -> `bot_output_text`
- any available session/conversation ID -> `session_id` or `conversation_id`

## Test payload

After deployment, test the Apps Script webhook with a POST request. Replace the URL and secret.

```bash
curl -X POST 'YOUR_APPS_SCRIPT_WEB_APP_URL' \
  -H 'Content-Type: application/json' \
  -d '{
    "secret": "YOUR_SHARED_SECRET_IF_USED",
    "agent": "Giulia C.",
    "human_input_text": "How formal should I be when emailing an Italian professor?",
    "bot_output_text": "Begin formally with a greeting and title, then adjust only if invited.",
    "session_id": "test-session",
    "conversation_id": "test-conversation",
    "source": "manual_test"
  }'
```

Expected response:

```json
{"ok":true,"timestamp":"..."}
```

## Fallback: custom chat UI

If RelevanceAI cannot expose both `latest_user_message` and `final_agent_response` from embedded chat turns, the fallback is a custom CCIA chat UI backed by a serverless endpoint.

```txt
Public chat UI
  -> serverless endpoint with secret Relevance API key
  -> RelevanceAI agent/workflow
  -> same Google Apps Script logging endpoint
  -> response displayed to visitor
```

Do **not** put a RelevanceAI API key in GitHub Pages/static frontend code.

## Privacy / IRB-ish note

The public page already asks visitors not to provide sensitive or identifying information. If transcript logging becomes part of a formal study, update the transparency notice and consent language to explicitly state that chat messages and agent responses may be logged for research, debugging, and evaluation.
