import { Hono } from 'hono';
import { Env } from './index';

const brain = new Hono<{ Bindings: Env }>();

const getSystemPrompt = (language: 'id' | 'en') => `
You are an expert Creative Director and Visual Storyteller
specializing in short-form video content for YouTube Shorts,
Instagram Reels, and TikTok.

Think in cinematic sequences. Understand visual continuity,
camera language, and narrative arc.

OUTPUT RULES:
- Respond with PURE JSON only — no markdown, no explanation, no backticks
- Follow the ProjectSchema exactly — include ALL required fields
- Image prompts ALWAYS in English (YouMind Nano Banana Pro format)
- Narasi voiceover in ${language}
- Every scene serves the story arc:
  Scene 1 → opening_hook (captures attention in 2 seconds)
  Middle scenes → rising_action / climax (builds tension)
  Final scene → resolution (closure + implicit CTA)
- Generate BOTH text_id (Bahasa Indonesia) AND text_en (English)
  even if narasi_language is set to one language
`;

brain.post('/generate', async (c) => {
  try {
    const { prompt, model, narasi_language = 'en' } = await c.req.json();

    if (!prompt || !model) {
      return c.json({ error: 'Bad Request', message: 'Missing prompt or model' }, 400);
    }

    if (model === 'gemini') {
        const systemPrompt = getSystemPrompt(narasi_language);
        const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${c.env.GEMINI_API_KEY}`;

        const geminiPayload = {
            contents: [
                { parts: [{ text: systemPrompt }] },
                { parts: [{ text: prompt }] }
            ],
            generationConfig: {
                response_mime_type: "application/json",
            }
        };

        const geminiRes = await fetch(geminiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(geminiPayload)
        });

        if (!geminiRes.ok) {
            const errorBody = await geminiRes.text();
            console.error("Gemini API Error:", errorBody);
            return c.json({ error: 'Gemini API Error', message: errorBody }, geminiRes.status);
        }

        const geminiData = await geminiRes.json();
        const projectSchemaText = geminiData.candidates[0].content.parts[0].text;
        const projectSchema = JSON.parse(projectSchemaText);

        return c.json(projectSchema);
    }

    // TODO: Implement other models

    return c.json({ error: 'Not Implemented', message: `Model ${model} is not supported yet` }, 501);

  } catch (error: any) {
    console.error('Error generating story:', error);
    return c.json({ error: 'Internal Server Error', message: error.message }, 500);
  }
});

brain.get('/health', (c) => {
  return c.json({ ok: true });
});

export default brain;
