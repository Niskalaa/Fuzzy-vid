import { Hono } from 'hono';
import { Env } from './index';
import { nanoid } from 'nanoid';

const image = new Hono<{ Bindings: Env }>();

const generateImageWithGemini = async (c: any, imagePrompt: string, jobId: string) => {
  const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/projects/fuzzy-pollen/locations/us-central1/publishers/google/models/imagen-3.0-generate-005:generateImage?key=${c.env.GEMINI_API_KEY}`;

  const geminiPayload = {
    "prompt": imagePrompt,
    "aspect_ratio": "9:16",
    "negative_prompt": "text, watermark, blur, distortion, lowres",
    "return_bytes": true, // Request bytes instead of a temporary URL
  };

  fetch(geminiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(geminiPayload)
  }).then(async (res) => {
    if(!res.ok) {
        const errorBody = await res.text();
        console.error("Gemini Image Gen Error:", errorBody);
        await c.env.JOB_STATUS.put(jobId, JSON.stringify({ status: 'failed', error: errorBody }), { expirationTtl: 3600 });
    } else {
        const data = await res.json();
        const imageBytes = data.images[0].image.b64_encoded;
        const imageBuffer = Uint8Array.from(atob(imageBytes), c => c.charCodeAt(0));

        const r2Key = `img_${Date.now()}.png`;

        try {
          await c.env.STORY_STORAGE.put(r2Key, imageBuffer, {
            httpMetadata: { contentType: 'image/png' },
          });
          await c.env.JOB_STATUS.put(jobId, JSON.stringify({ status: 'done', imageR2Key: r2Key }), { expirationTtl: 3600 });
        } catch (r2Error) {
          console.error("R2 Upload Error:", r2Error);
          await c.env.JOB_STATUS.put(jobId, JSON.stringify({ status: 'failed', error: 'Failed to upload image to storage.' }), { expirationTtl: 3600 });
        }
    }
  });
};

image.post('/generate', async (c) => {
  const { image_prompt, model } = await c.req.json();

  if (!image_prompt || !model) {
    return c.json({ error: 'Bad Request', message: 'Missing image_prompt or model' }, 400);
  }

  const jobId = `img_${Date.now()}_${nanoid(6)}`;
  await c.env.JOB_STATUS.put(jobId, JSON.stringify({ status: 'generating' }), { expirationTtl: 3600 });

  if (model === 'gemini') {
    // Fire-and-forget
    generateImageWithGemini(c, image_prompt, jobId);
  } else {
    return c.json({ error: 'Not Implemented', message: `Model ${model} is not supported yet` }, 501);
  }

  return c.json({ jobId });
});

image.get('/status/:job_id', async (c) => {
  const { job_id } = c.req.param();
  const status = await c.env.JOB_STATUS.get(job_id);

  if (!status) {
    return c.json({ status: 'pending' });
  }

  return c.json(JSON.parse(status));
});

export default image;
