
import { Env } from './index';
import { AwsV4Signer } from './lib/aws-signature';
import { corsHeaders } from './lib/cors';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const { method, url } = request;
    const { pathname, searchParams } = new URL(url);

    // Endpoint: GET /api/storage/presign?key=...
    if (method === 'GET' && pathname.endsWith('/presign')) {
      try {
        const key = searchParams.get('key');

        if (!key) {
          const errorResponse = { error: 'Bad Request', message: 'Missing "key" query parameter' };
          return new Response(JSON.stringify(errorResponse), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const r2Endpoint = `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
        const urlToSign = new URL(`${r2Endpoint}/${key}`);

        // The original Hono code passed credentials and config separately.
        // Assuming the signer is instantiated like this based on the lib's likely design.
        const signer = new AwsV4Signer({
            awsAccessKeyId: env.R2_ACCESS_KEY_ID,
            awsSecretKey: env.R2_SECRET_ACCESS_KEY,
        }, 'auto', 's3');

        const requestToSign = new Request(urlToSign, {
            method: 'GET',
        });

        // Sign a fake request to generate the presigned URL with authentication query parameters
        const signedRequest = await signer.sign(requestToSign);
        const signedUrl = signedRequest.url;
        
        const response = { signedUrl };
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error: any) {
        console.error('Error generating presigned URL:', error);
        const errorResponse = { error: 'Internal Server Error', message: error.message };
        return new Response(JSON.stringify(errorResponse), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const notFoundResponse = { error: 'Not Found', message: `Method ${method} on ${pathname} not found` };
    return new Response(JSON.stringify(notFoundResponse), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};
