"""
import { Env } from './index';
import { corsHeaders } from './lib/cors';
import { AwsV4Signer } from './lib/aws-signature';

// Simplified nanoid, good enough for worker context
const nanoid = (size = 21) =>
  crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
    byte &= 63;
    if (byte < 36) {
      id += byte.toString(36);
    } else if (byte < 62) {
      id += (byte - 26).toString(36).toUpperCase();
    } else if (byte > 62) {
      id += '-';
    } else {
      id += '_';
    }
    return id;
  }, '');


export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const { method, url } = request;
    const { pathname } = new URL(url);

    try {
        if (method === 'POST' && pathname.endsWith('/generate')) {
            const body = await request.json();
            const { model, text, language, voice_character, scene_id, project_id } = body as any;

            if (!model || !text || !project_id || !scene_id) {
                return new Response(JSON.stringify({ error: 'Bad Request', message: 'Missing required fields: model, text, project_id, scene_id' }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            const jobId = `aud_${Date.now()}_${nanoid(8)}`;
            const r2Key = `projects/${project_id}/scene_${scene_id}/audio_${Date.now()}.mp3`;

            // Start generation async
            ctx.waitUntil(generateAudio(jobId, r2Key, model, text, language, voice_character, env));

            // Return job ID to client for polling
            return new Response(JSON.stringify({ jobId }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (method === 'GET' && pathname.startsWith('/api/audio/status/')) {
            const jobId = pathname.split('/').pop();
            if (!jobId) {
                return new Response(JSON.stringify({ error: 'Bad Request', message: 'Missing job ID' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            const jobStatus = await env.JOB_STATUS.get(jobId, { type: 'json' });

            if (!jobStatus) {
                return new Response(JSON.stringify({ error: 'Not Found', message: 'Job not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            return new Response(JSON.stringify(jobStatus), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    } catch (e: any) {
        console.error('Audio Worker Error:', e);
        return new Response(JSON.stringify({ error: 'Internal Server Error', message: e.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
  },
};

async function generateAudio(jobId: string, r2Key: string, model: string, text: string, language: string, voiceCharacter: string, env: Env) {
    await env.JOB_STATUS.put(jobId, JSON.stringify({ jobId, status: 'generating', model }), { expirationTtl: 3600 });

    try {
        let audioBuffer: ArrayBuffer;

        switch (model) {
            case 'polly':
                audioBuffer = await generateWithPolly(text, language, voiceCharacter, env);
                break;
            case 'gemini_tts':
                audioBuffer = await generateWithGeminiTTS(text, env);
                break;
            case 'elevenlabs':
                audioBuffer = await generateWithElevenLabs(text, voiceCharacter, env);
                break;
            default:
                throw new Error(`Unsupported audio model: ${model}`);
        }

        // Save to R2
        await env.STORY_STORAGE.put(r2Key, audioBuffer, {
            httpMetadata: { contentType: 'audio/mpeg' },
        });

        await env.JOB_STATUS.put(jobId, JSON.stringify({ jobId, status: 'done', r2Key }), { expirationTtl: 3600 });

    } catch (e: any) {
        console.error(`Failed to generate audio for job ${jobId}:`, e);
        await env.JOB_STATUS.put(jobId, JSON.stringify({ jobId, status: 'failed', error: e.message }), { expirationTtl: 3600 });
    }
}


async function generateWithPolly(text: string, language: string, voiceId: string, env: Env): Promise<ArrayBuffer> {
    const region = 'us-east-1'; // Or from config
    const endpoint = `https://polly.${region}.amazonaws.com/v1/speech`;
    const body = JSON.stringify({
        Engine: 'neural',
        LanguageCode: language === 'id' ? 'id-ID' : 'en-US',
        OutputFormat: 'mp3',
        Text: text,
        VoiceId: voiceId, // e.g., 'Joanna'
    });

    const signer = new AwsV4Signer({
        awsAccessKeyId: env.AWS_ACCESS_KEY_ID,
        awsSecretKey: env.AWS_SECRET_ACCESS_KEY,
    }, region, 'polly');

    const request = new Request(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': body.length.toString(),
        },
        body: body,
    });

    const signedRequest = await signer.sign(request);
    const response = await fetch(signedRequest);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Polly API error: ${errorText}`);
    }
    return response.arrayBuffer();
}

async function generateWithGeminiTTS(text: string, env: Env): Promise<ArrayBuffer> {
    const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GEMINI_API_KEY}`;
    const body = JSON.stringify({
        input: { text: text },
        voice: { languageCode: 'en-US', name: 'en-US-Studio-M' }, // example
        audioConfig: { audioEncoding: 'MP3' }
    });
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini TTS API error: ${errorText}`);
    }
    const data = await response.json() as any;
    const byteString = atob(data.audioContent);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return ab;
}

async function generateWithElevenLabs(text: string, voiceId: string, env: Env): Promise<ArrayBuffer> {
    if (!env.ELEVENLABS_API_KEY) {
        throw new Error('ElevenLabs API key is not configured.');
    }
    const endpoint = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const body = JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2"
    });

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': env.ELEVENLABS_API_KEY
        },
        body: body,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${errorText}`);
    }
    return response.arrayBuffer();
}
""