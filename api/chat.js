export const config = { runtime: 'edge' };

// ═══════════════════════════════════════════════════════════════════
// 🔑 CLÉ API - REMPLACE ICI PAR TA CLÉ (ou utilise la variable d'env)
// ═══════════════════════════════════════════════════════════════════
const GROQ_API_KEY = process.env.GROQ_API_KEY || "gsk_XXXX_REMPLACE_MOI_PAR_TA_CLE";

// 🔗 Endpoint API (Groq par défaut)
const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_MODEL = "llama-3.3-70b-versatile";
// ═══════════════════════════════════════════════════════════════════

export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Messages requis' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Vérifie que la clé est bien configurée
    if (!GROQ_API_KEY || GROQ_API_KEY.includes("REMPLACE_MOI")) {
      return new Response(JSON.stringify({
        error: "Clé API non configurée. Ouvre api/chat.js et remplace gsk_XXXX_REMPLACE_MOI_PAR_TA_CLE par ta vraie clé (obtenue gratuitement sur https://console.groq.com/keys)."
      }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = {
      role: 'system',
      content: "Tu es Nova, un assistant IA francophone intelligent, précis et amical. Réponds toujours en français sauf si l'utilisateur demande une autre langue. Utilise du markdown pour formater tes réponses (code, listes, gras). Sois concis mais complet."
    };

    const apiRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: API_MODEL,
        messages: [systemPrompt, ...messages],
        stream: true,
        temperature: 0.7,
        max_tokens: 2048,
      }),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      return new Response(JSON.stringify({ error: `API (${apiRes.status}) : ${errText}` }), {
        status: apiRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(apiRes.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
