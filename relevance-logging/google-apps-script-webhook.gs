/**
 * CCIA / Giulia transcript logger.
 *
 * Deploy as a Google Apps Script Web App and point the RelevanceAI agent's
 * final logging step/tool at the deployed URL.
 *
 * Expected JSON body:
 * {
 *   "secret": "optional-shared-secret",
 *   "agent": "Giulia C.",
 *   "human_input_text": "What should I say before an Italian business meeting?",
 *   "bot_output_text": "A short greeting and brief context are usually appropriate...",
 *   "session_id": "optional",
 *   "conversation_id": "optional",
 *   "source": "relevance_embed"
 * }
 */

const SHEET_NAME = 'ccia_transcripts';
const EXPECTED_HEADERS = [
  'timestamp',
  'agent',
  'human_input_text',
  'bot_output_text',
  'session_id',
  'conversation_id',
  'source',
  'raw_json'
];

function doGet() {
  return jsonResponse({ ok: true, service: 'ccia-transcript-logger' });
}

function doPost(e) {
  try {
    const payload = parsePayload(e);
    validateSecret(payload);

    const sheet = getOrCreateSheet();
    ensureHeaders(sheet);

    const now = new Date().toISOString();
    const row = [
      now,
      clean(payload.agent),
      clean(payload.human_input_text),
      clean(payload.bot_output_text),
      clean(payload.session_id),
      clean(payload.conversation_id),
      clean(payload.source || 'relevance_embed'),
      JSON.stringify(payload)
    ];

    sheet.appendRow(row);

    return jsonResponse({ ok: true, timestamp: now });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error && error.message ? error.message : error) });
  }
}

function parsePayload(e) {
  if (!e || !e.postData || !e.postData.contents) {
    throw new Error('Missing POST body.');
  }

  const contentType = String(e.postData.type || '').toLowerCase();
  const body = e.postData.contents;

  if (contentType.includes('application/json')) {
    return JSON.parse(body);
  }

  // Relevance/webhook tools sometimes send form-encoded data. Accept that too.
  if (e.parameter && Object.keys(e.parameter).length > 0) {
    return Object.assign({}, e.parameter);
  }

  // Last-resort JSON parse.
  return JSON.parse(body);
}

function validateSecret(payload) {
  const expectedSecret = PropertiesService.getScriptProperties().getProperty('CCIA_LOG_SECRET');
  if (!expectedSecret) return;

  if (!payload || payload.secret !== expectedSecret) {
    throw new Error('Invalid or missing shared secret.');
  }
}

function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }

  return sheet;
}

function ensureHeaders(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, EXPECTED_HEADERS.length).getValues()[0];
  const hasHeaders = EXPECTED_HEADERS.every((header, index) => firstRow[index] === header);

  if (!hasHeaders) {
    sheet.getRange(1, 1, 1, EXPECTED_HEADERS.length).setValues([EXPECTED_HEADERS]);
    sheet.setFrozenRows(1);
  }
}

function clean(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
