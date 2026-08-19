const DEFAULT_MODEL = process.env.QWEN_MODEL || 'qwen3.7-plus';
const BASE_URL = process.env.DASHSCOPE_BASE_URL;
const API_KEY = process.env.DASHSCOPE_API_KEY;

const routerPrompt = `You are the internal routing layer for Giulia, a Chapman Cultural Intelligence Agent focused on Italy. Classify the user's latest request using exactly one lowercase label: cultural, business, or both.

Use cultural for everyday culture, etiquette, social communication, norms, regional/social context, and non-workplace interpersonal questions.
Use business for workplaces, management, professional communication, negotiation, meetings, hiring, organizational expectations, and commercial/professional contexts.
Use both when a useful answer genuinely requires both cultural/social and professional/business expertise.

Return only the label. Do not answer the user.`;

const placeholderCore = `You are Giulia, a Chapman Cultural Intelligence Agent for Italian contexts. This is an internal lab prototype. You do not browse or search the web and have no tools. Use only the conversation, your system instructions, and the supplied internal knowledge base. If the provided knowledge is insufficient for a factual claim, say so rather than inventing information. Maintain one continuous Giulia identity regardless of which internal specialist produced the response.`;

const placeholderCultural = `${placeholderCore}\n\nROLE: Cultural specialist. Focus on Italian everyday culture, interpersonal communication, etiquette, social expectations, nonverbal communication, and relevant regional/contextual variation.\n\n[GIULIA CULTURAL PROMPT + KB WILL BE INSERTED HERE]`;
const placeholderBusiness = `${placeholderCore}\n\nROLE: Business specialist. Focus on Italian professional culture, workplace communication, meetings, management, negotiation, organizational expectations, and business etiquette.\n\n[GIULIA BUSINESS PROMPT + KB WILL BE INSERTED HERE]`;
const synthesisPrompt = `${placeholderCore}\n\nROLE: Synthesis layer. Two internal Giulia specialists have supplied draft perspectives. Produce one seamless answer in Giulia's voice. Do not mention routing, specialists, drafts, multiple bots, or internal architecture. Reconcile overlap and disagreement carefully.`;

function normalizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-24)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 12000) }));
}

async function qwen(system, messages, options = {}) {
  if (!API_KEY) throw new Error('DASHSCOPE_API_KEY is not configured.');
  if (!BASE_URL) throw new Error('DASHSCOPE_BASE_URL is not configured.');

  const response = await fetch(`${BASE_URL.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: options.model || DEFAULT_MODEL,
      messages: [{ role: 'system', content: system }, ...messages],
      temperature: options.temperature ?? 0.35,
      max_tokens: options.maxTokens || 1600,
      stream: false
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.message || `Qwen HTTP ${response.status}`;
    throw new Error(detail);
  }
  const content = payload?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) throw new Error('Qwen returned no text response.');
  return content.trim();
}

async function route(messages) {
  const latestUser = [...messages].reverse().find((m) => m.role === 'user');
  const routingContext = messages.slice(-8);
  const raw = await qwen(routerPrompt, routingContext.length ? routingContext : [latestUser], {
    temperature: 0,
    maxTokens: 12
  });
  const label = raw.toLowerCase().match(/\b(cultural|business|both)\b/)?.[1];
  return label || 'both';
}

async function answerOne(system, messages) {
  return qwen(system, messages, { temperature: 0.45, maxTokens: 1800 });
}

async function answerBoth(messages) {
  const [cultural, business] = await Promise.all([
    answerOne(placeholderCultural, messages),
    answerOne(placeholderBusiness, messages)
  ]);

  const latestUser = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
  return qwen(synthesisPrompt, [{
    role: 'user',
    content: `Original user request:\n${latestUser}\n\nCultural perspective:\n${cultural}\n\nBusiness perspective:\n${business}`
  }], { temperature: 0.35, maxTokens: 2000 });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const expectedToken = process.env.DEV_ACCESS_TOKEN;
  if (expectedToken && req.headers['x-dev-token'] !== expectedToken) {
    return res.status(401).json({ error: 'Developer access token required' });
  }

  const messages = normalizeMessages(req.body?.messages);
  if (!messages.length || !messages.some((m) => m.role === 'user')) {
    return res.status(400).json({ error: 'A user message is required' });
  }

  try {
    const selectedRoute = await route(messages);
    let reply;
    if (selectedRoute === 'cultural') reply = await answerOne(placeholderCultural, messages);
    else if (selectedRoute === 'business') reply = await answerOne(placeholderBusiness, messages);
    else reply = await answerBoth(messages);

    return res.status(200).json({
      reply,
      route: selectedRoute,
      model: DEFAULT_MODEL,
      prototype: true
    });
  } catch (error) {
    console.error('Giulia Qwen prototype error:', error);
    return res.status(500).json({ error: error.message || 'Qwen request failed' });
  }
}
