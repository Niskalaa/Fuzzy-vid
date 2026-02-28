import { Hono } from 'hono';
import { cors } from 'hono/cors';
import brain from './brain';
import image from './image';
import video from './video';
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

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/api/*', cors());

// Brain routes
app.route('/api/brain', brain);

// Image routes
app.route('/api/image', image);

// Video routes
app.route('/api/video', video);

// Storage routes
app.route('/api/storage', storage);

export default app;
