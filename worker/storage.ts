import { Hono } from 'hono';
import { Env } from './index';
import { AwsV4Signer } from './lib/aws-signature';

const storage = new Hono<{ Bindings: Env }>();

storage.get('/presign', async (c) => {
  const { key } = c.req.query();

  if (!key) {
    return c.json({ error: 'Bad Request', message: 'Missing key' }, 400);
  }

  const r2Endpoint = `https://${c.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const url = new URL(`${r2Endpoint}/${key}`);

  const signer = new AwsV4Signer({
      awsAccessKeyId: c.env.R2_ACCESS_KEY_ID,
      awsSecretKey: c.env.R2_SECRET_ACCESS_KEY,
  }, 'auto', 's3');

  const request = new Request(url, {
      method: 'GET',
  });

  // This is a bit of a hack. The signer is meant for Fetch requests,
  // but we only need the URL with the signature in the query string.
  // So we sign a fake request and then extract the query params.
  const signedRequest = await signer.sign(request);
  const signedUrl = signedRequest.url;

  return c.json({ signedUrl });
});

export default storage;
