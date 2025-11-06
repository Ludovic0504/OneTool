// onetool-functions/api/veo3-stream.ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { idea } = req.body as { idea?: string }
  if (!idea || idea.trim().length < 5) {
    return res.status(400).json({ error: 'Missing or too short idea' })
  }

  // Headers SSE
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  // CORS (optionnel si tu appelles depuis même domaine)
  res.setHeader('Access-Control-Allow-Origin', '*')

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  try {
    const system = `
You are "VEO3 Prompt Generator". Output ONLY a formatted prompt, no extra commentary.
Start with 'Ultra realistic cinematic chaotic vlog shot', then one bracket line in EN, then sections:
Style / Camera / Lighting / Environment / Tone / Important (with the 4 bullet rules),
then 'Dialogue (in French)' with 3-6 short lines. No exclamation marks, no question marks anywhere.
If the idea is French, translate scene parts to EN, keep dialogues FR.
`.trim()

    const user = `
Ultra realistic cinematic chaotic vlog shot
${idea}

Style :
Camera :
Lighting :
Environment :
Tone :
Important :
- Décris clairement l’action (ex : "the character walks towards the camera")
- Précise à qui le personnage s’adresse (camera ou autre personnage)
- Décris l’ambiance (night, fast-food, bedroom, rain, etc.)
- Pas de points d’exclamation ni de points d’interrogation
`.trim()

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 900,
      stream: true,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    })

    for await (const chunk of stream) {
      const piece = chunk.choices?.[0]?.delta?.content || ''
      if (piece) res.write(`data: ${piece}\n\n`)
    }

    res.write('data: [END]\n\n')
    res.end()
  } catch (err: any) {
    // Envoie l’erreur côté client et ferme proprement
    res.write(`data: [ERROR] ${String(err?.message || err)}\n\n`)
    res.end()
  }
}
