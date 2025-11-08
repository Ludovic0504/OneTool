export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const { idea } = await req.json();
    if (!idea || !idea.trim()) {
      return new Response("Missing idea", { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response("Missing OPENAI_API_KEY (check .env.local and restart vercel dev)", { status: 500 });
    }

    const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      
      body: JSON.stringify({
    model: "gpt-4o-mini",
    stream: true,
    messages: [
      {
        role: "system",
        content:
          "You are VEO3 PromptMaker. Always write the main scene and all descriptions in ENGLISH, but the dialogues must be in FRENCH. " +
          "Structure your answer with these sections, each clearly labeled and separated by line breaks:\n" +
          "Scene (in English)\nStyle\nCamera\nLighting\nEnvironment\nTone\nImportant\nDialogue (in French, no exclamation or question marks).",
      },
      {
        role: "user",
        content: `Idea:\n${idea}\n\nPlease generate the full structured VEO3 prompt.`,
      },
    ],
      }),
    });

   // S'il y a une erreur OpenAI, renvoie un message plus clair
if (!upstream.ok || !upstream.body) {
  const errTxt = await upstream.text().catch(() => "");

  if (upstream.status === 429) {
    return new Response(
      "⚠️ OpenAI : quota insuffisant sur le projet ou la clé. " +
      "Active la facturation ou augmente ta limite de crédits sur platform.openai.com.",
      { status: 429 }
    );
  }

  return new Response(`OpenAI error (${upstream.status}): ${errTxt}`, { status: 502 });
}


    // Proxy du flux → client
    return new Response(upstream.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
        ...(process.env.NODE_ENV === "development" ? { "Access-Control-Allow-Origin": "*" } : {}),
      },
    });
  } catch (e: any) {
    return new Response(`Handler error: ${e?.message ?? e}`, { status: 500 });
  }
}
