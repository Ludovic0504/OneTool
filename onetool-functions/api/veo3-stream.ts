// Edge Function (PAS @vercel/node)
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { idea } = await req.json();

  const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: "Tu génères un prompt VEO3 structuré." },
        { role: "user", content: idea },
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return new Response("Upstream error", { status: 500 });
  }

  // Proxy du flux OpenAI → client
  const stream = new ReadableStream({
    start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();

      const pump = () =>
        reader.read().then(({ done, value }) => {
          if (done) return controller.close();
          controller.enqueue(encoder.encode(decoder.decode(value)));
          return pump();
        }).catch(err => controller.error(err));

      pump();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      ...(process.env.NODE_ENV === "development" ? { "Access-Control-Allow-Origin": "*" } : {}),
    },
  });
}
