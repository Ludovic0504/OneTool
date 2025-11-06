import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method not allowed')
  const { idea } = req.body as { idea?: string }
  if (!idea || idea.trim().length < 8) return res.status(400).json({ error: 'idea too short' })

  const system = `
You are "VEO3 Prompt Generator". Output ONLY a formatted prompt, no extra commentary.
Rules:
- Start with: Ultra realistic cinematic chaotic vlog shot
- Then a single line in square brackets [ ... ] that visually summarizes the scene in ENGLISH, derived from the user idea. No exclamation marks, no question marks.
- Then sections, each on its own line:
Style:
Camera:
Lighting:
Environment:
Tone:
Important:
- Clearly describe the action (e.g., "the character walks towards the camera")
- Specify who the character addresses (camera or another character)
- Describe the ambience (night, fast-food, bedroom, rain, etc.)
- No exclamation marks and no question marks
- After sections, add:
Dialogue (in French):
- 3 to 6 short lines, natural French, no exclamation marks, no question marks
- Keep everything concise and production-ready.
- Never include explanations.

Constraints:
- Keep English clean and cinematic. Avoid flowery prose.
- Respect “no !, no ?” everywhere (including the bracket line and dialogues).
- If the user gives French, translate scene content to EN; keep dialogues in FR.
`

  // Few-shot (compact) to lock the format
  const userExample = `Un ado rentre sous la pluie, parle à la caméra façon vlog, passe par un fast-food néon. Ambiance nocturne, ton nerveux.`
  const assistantExample = `Ultra realistic cinematic chaotic vlog shot
[Teenager walks through rainy night streets, speaks to the camera while entering a neon fast food]

Style: ultra realistic, handheld vlog energy, film grain, shallow depth of field
Camera: handheld medium close-ups, occasional refocus, lens often close to face
Lighting: night neon highlights, wet streets, specular reflections inside
Environment: urban street to neon fast food interior, rainy night
Tone: nervous, raw, candid
Important:
- Clearly describe the action (e.g., "the character walks towards the camera")
- Specify who the character addresses: addresses the camera directly
- Describe the ambience (night, fast-food, bedroom, rain, etc.)
- No exclamation marks and no question marks
Dialogue (in French):
- J avance sous la pluie
- Je parle à la caméra pour rester lucide
- Les néons me suivent jusque dans la salle
- Je prends quelque chose et je repars`

  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 700,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userExample },
        { role: 'assistant', content: assistantExample },
        { role: 'user', content: idea },
      ],
    }) // Chat Completions or use the Responses API per docs

    const text = resp.choices[0]?.message?.content ?? ''
    return res.status(200).json({ prompt: text })
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || 'OpenAI error' })
  }
}
