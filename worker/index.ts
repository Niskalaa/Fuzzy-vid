
import { corsHeaders } from './lib/cors';
import brain from './brain';
import image from './image';
import video from './video';
import audio from './audio';
import project from './project';
import storage from './storage';

export interface Env {
  JOB_STATUS: KVNamespace;
  STORY_STORAGE: R2Bucket;
  GEMINI_API_KEY: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  R2_ACCOUNT_ID: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  RUNWAY_API_KEY: string;
  ELEVENLABS_API_KEY: string;
  ENVIRONMENT: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Simple path-based routing
    try {
      if (pathname.startsWith('/api/brain')) {
        return brain.fetch(request, env, ctx);
      }
      if (pathname.startsWith('/api/image')) {
        return image.fetch(request, env, ctx);
      }
       if (pathname.startsWith('/api/video')) {
        return video.fetch(request, env, ctx);
      }
       if (pathname.startsWith('/api/audio')) {
        return audio.fetch(request, env, ctx);
      }
       if (pathname.startsWith('/api/project')) {
        return project.fetch(request, env, ctx);
      }
      if (pathname.startsWith('/api/storage')) {
        return storage.fetch(request, env, ctx);
      }
      
      // Default 404
      return new Response(JSON.stringify({ error: 'Not Found', message: `Route ${pathname} not found` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (e: any) {
        console.error('Main Worker Error:', e, e.stack);
        return new Response(JSON.stringify({ error: 'Internal Server Error', message: e.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  },
};
