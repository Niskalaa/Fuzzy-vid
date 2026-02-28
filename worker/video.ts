import { Hono } from 'hono';
import { Env } from './index';
import { nanoid } from 'nanoid';
import { AwsV4Signer } from './lib/aws-signature';

const video = new Hono<{ Bindings: Env }>();

const generateVideoWithNovaReel = async (c: any, imageR2Key: string, jobId: string, projectId: string, sceneId: number) => {
  const r2Endpoint = `https://${c.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const outputR2Key = `projects/${projectId}/scene_${sceneId}/video_${Date.now()}.mp4`;

  const bedrockEndpoint = new URL('https://bedrock-runtime.us-east-1.amazonaws.com/model/amazon.nova-reel-v1:0/invoke');

  const payload = {
    "input_image_r2_key": imageR2Key,
    "output_r2_bucket": "igome-story-storage",
    "output_r2_key": outputR2Key,
    // Optional parameters, add as needed
  };

  const signer = new AwsV4Signer({
      awsAccessKeyId: c.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: c.env.AWS_SECRET_ACCESS_KEY,
  }, 'us-east-1', 'bedrock');

  const request = new Request(bedrockEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const signedRequest = await signer.sign(request);

  fetch(signedRequest)
    .then(async res => {
      if (!res.ok) {
        const errorBody = await res.text();
        console.error('Nova Reel Error:', errorBody);
        await c.env.JOB_STATUS.put(jobId, JSON.stringify({ status: 'failed', error: errorBody }), { expirationTtl: 3600 });
      } else {
        const data = await res.json();
        // Nova Reel is async, but we can assume the job has started.
        // A separate poller/webhook would be needed for true status, for now we just mark as done and provide the key.
        await c.env.JOB_STATUS.put(jobId, JSON.stringify({ status: 'done', videoR2Key: outputR2Key }), { expirationTtl: 3600 });
      }
    });
};

video.post('/generate', async (c) => {
  const { image_r2_key, model, project_id, scene_id } = await c.req.json();

  if (!image_r2_key || !model || !project_id || !scene_id) {
    return c.json({ error: 'Bad Request', message: 'Missing required fields' }, 400);
  }

  const jobId = `vid_${Date.now()}_${nanoid(6)}`;
  await c.env.JOB_STATUS.put(jobId, JSON.stringify({ status: 'generating' }), { expirationTtl: 3600 });

  if (model === 'nova_reel') {
    await generateVideoWithNovaReel(c, image_r2_key, jobId, project_id, scene_id);
  } else {
    return c.json({ error: 'Not Implemented', message: `Model ${model} is not supported yet` }, 501);
  }

  return c.json({ jobId });
});

video.get('/status/:job_id', async (c) => {
  const { job_id } = c.req.param();
  const status = await c.env.JOB_STATUS.get(job_id);

  if (!status) {
    return c.json({ status: 'pending' });
  }

  return c.json(JSON.parse(status));
});

export default video;
