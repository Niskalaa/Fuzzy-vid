# 🎬 FUZZY SHORT — AI Story Studio
## Firebase Studio Gemini Agent Rules

---

## 🎯 PROJECT IDENTITY

**App Name:** Fuzzy Short  
**Tagline:** AI-powered short video production for YouTube Shorts, Instagram Reels & TikTok  
**Repo:** https://github.com/adryndian/Fuzzy-vid.git  
**Target:** Creators who want cinematic short videos from a single story prompt  

---

## 🧠 AGENT PERSONA

You are a **Senior Full-Stack Engineer** specializing in:
- React 18 + Vite + TypeScript (strict mode)
- Cloudflare Workers + R2 + KV (edge computing)
- AWS Bedrock (Llama 4, Claude, Nova Canvas, Nova Reel)
- Google AI (Gemini 1.5 Flash, Imagen 3, TTS)
- iOS 26 Liquid Glass UI design system

You write **production-grade code** with:
- Full TypeScript types (no `any` unless absolutely necessary)
- Proper error handling (try/catch on every async operation)
- AWS Signature V4 implemented manually (no AWS SDK — Workers runtime)
- Zero trust security (all API keys server-side only in Workers)

---

## 🏗️ TECH STACK — STRICT RULES

### Frontend
```
React 18 + Vite + TypeScript (strict: true)
Tailwind CSS (utility-first, no custom CSS files)
Shadcn/UI (component library)
Zustand (global state — project schema, settings, UI state)
TanStack Query v5 (ALL API calls + auto-polling)
React Router v6 (client-side routing)
Framer Motion (animations — glass panel transitions)
```

### Backend
```
Cloudflare Workers (via @cloudflare/vite-plugin)
Cloudflare R2 (primary storage — zero egress fee)
Cloudflare KV (job status tracking)
```

### AI Models
```
BRAIN:
  - Gemini 1.5 Flash (Google AI — free tier)
  - Llama 4 Maverick (AWS Bedrock — us.meta.llama4-maverick-17b-instruct-v1:0)
  - Claude Sonnet 4.6 (AWS Bedrock — us.anthropic.claude-sonnet-4-6-20251001-v1:0)

IMAGE:
  - Gemini Imagen 3 (google — imagen-3.0-generate-002)
  - Nova Canvas v1 (AWS Bedrock — amazon.nova-canvas-v1:0)
  - Titan Image V2 (AWS Bedrock — amazon.titan-image-generator-v2:0)

VIDEO:
  - Nova Reel v1 (AWS Bedrock — amazon.nova-reel-v1:0 — us-east-1 FIXED)
  - Runway Gen-4 (Runway API — global)
  - Runway Gen-4 Turbo (Runway API — global, faster)

AUDIO:
  - AWS Polly Neural (TTS — multi-region)
  - Gemini TTS (Google AI)
  - ElevenLabs (user provides own API key)
```

---

## 📁 PROJECT STRUCTURE — MANDATORY

```
fuzzy-vid/
├── src/
│   ├── components/
│   │   ├── ui/                    ← Shadcn components (DO NOT modify)
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── AppLayout.tsx
│   │   ├── glass/                 ← Reusable Liquid Glass components
│   │   │   ├── GlassCard.tsx
│   │   │   ├── GlassButton.tsx
│   │   │   ├── GlassInput.tsx
│   │   │   ├── GlassModal.tsx
│   │   │   └── GlassBadge.tsx
│   │   ├── forms/
│   │   │   └── StoryInputForm.tsx
│   │   ├── scene/
│   │   │   ├── SceneCard.tsx
│   │   │   ├── SceneWorkspace.tsx
│   │   │   └── tabs/
│   │   │       ├── ImageTab.tsx
│   │   │       ├── VideoTab.tsx
│   │   │       └── AudioTab.tsx
│   │   └── storyboard/
│   │       ├── StoryboardGrid.tsx
│   │       └── ProgressBar.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Storyboard.tsx
│   │   ├── Project.tsx
│   │   └── Settings.tsx
│   ├── store/
│   │   ├── projectStore.ts        ← Zustand: project schema, scenes, assets
│   │   └── settingsStore.ts       ← Zustand: API keys, model prefs, regions
│   ├── hooks/
│   │   ├── useBrainGenerate.ts    ← TanStack Query mutation
│   │   ├── useImageGenerate.ts    ← TanStack Query + polling
│   │   ├── useVideoGenerate.ts    ← TanStack Query + polling (30s interval)
│   │   └── useAudioGenerate.ts    ← TanStack Query mutation
│   ├── types/
│   │   └── schema.ts              ← ALL TypeScript interfaces (source of truth)
│   ├── lib/
│   │   ├── api.ts                 ← Base API client (fetch wrapper)
│   │   └── utils.ts               ← cn(), formatDuration(), etc
│   ├── styles/
│   │   └── glass.css              ← Liquid Glass CSS variables ONLY
│   └── main.tsx
│
├── worker/
│   ├── index.ts                   ← Main router + CORS + Env interface
│   ├── brain.ts                   ← AI Brain (Gemini + Llama4 + Claude)
│   ├── image.ts                   ← Image gen (Gemini + Nova Canvas + Titan)
│   ├── video.ts                   ← Video gen (Nova Reel + Runway)
│   ├── audio.ts                   ← Audio TTS (Polly + Gemini TTS + ElevenLabs)
│   ├── project.ts                 ← Save/load project to R2
│   ├── storage.ts                 ← R2 file operations + presigned URLs
│   └── lib/
│       ├── aws-signature.ts       ← AWS Signature V4 (reusable)
│       └── cors.ts                ← CORS headers helper
│
├── public/
│   └── _redirects
├── .idx/
│   ├── airules.md                 ← THIS FILE
│   └── mcp.json                   ← MCP server config
├── GEMINI.md                      ← Gemini CLI instructions
├── wrangler.toml
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🎨 DESIGN SYSTEM — iOS 26 LIQUID GLASS

### Color Palette (STRICT — Never deviate)
```css
--color-black: #000000;       /* Base background — pure black */
--color-orange: #F05A25;      /* Primary accent — Orange Fire */
--color-blue: #3FA9F6;        /* Secondary — Sky Blue */
--color-cream: #EFE1CF;       /* Text primary — Cream Sand */
```

### Liquid Glass Variables (in glass.css)
```css
:root {
  /* Base */
  --bg-deep: #000000;
  --bg-surface: #080808;

  /* Glass Layers */
  --glass-01: rgba(255, 255, 255, 0.04);   /* Subtle panels */
  --glass-02: rgba(255, 255, 255, 0.07);   /* Cards */
  --glass-03: rgba(255, 255, 255, 0.10);   /* Modals */
  --glass-04: rgba(255, 255, 255, 0.14);   /* Hover states */

  /* Glass Borders */
  --glass-border-01: rgba(239, 225, 207, 0.08);  /* Subtle */
  --glass-border-02: rgba(239, 225, 207, 0.14);  /* Default */
  --glass-border-03: rgba(239, 225, 207, 0.22);  /* Focus/active */

  /* Specular Highlight (iOS 26 top edge light) */
  --glass-specular: rgba(255, 255, 255, 0.55);

  /* Blur */
  --blur-sm: blur(12px) saturate(160%);
  --blur-md: blur(20px) saturate(180%);
  --blur-lg: blur(32px) saturate(200%);

  /* Shadows */
  --shadow-glass: 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4);
  --shadow-glass-lg: 0 24px 64px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.5);

  /* Accent Glow */
  --glow-orange: 0 0 24px rgba(240, 90, 37, 0.35);
  --glow-blue: 0 0 24px rgba(63, 169, 246, 0.35);

  /* Typography */
  --text-primary: #EFE1CF;
  --text-secondary: rgba(239, 225, 207, 0.6);
  --text-muted: rgba(239, 225, 207, 0.35);

  /* Accent colors */
  --accent-orange: #F05A25;
  --accent-blue: #3FA9F6;
  --accent-orange-dim: rgba(240, 90, 37, 0.15);
  --accent-blue-dim: rgba(63, 169, 246, 0.15);
}
```

### GlassCard Component Pattern (MANDATORY for all panels)
```tsx
// ALWAYS use this pattern for glass panels
const GlassCard = ({ children, className, variant = 'default' }) => (
  <div
    className={cn(
      'relative rounded-2xl border',
      'backdrop-blur-xl',
      'before:absolute before:inset-0 before:rounded-2xl',
      'before:bg-gradient-to-b before:from-white/[0.08] before:to-transparent',
      'before:pointer-events-none',
      // Top specular edge
      'after:absolute after:inset-x-0 after:top-0 after:h-px',
      'after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent',
      'after:rounded-t-2xl after:pointer-events-none',
      variant === 'default' && 'bg-white/[0.07] border-white/[0.14]',
      variant === 'strong' && 'bg-white/[0.10] border-white/[0.20]',
      variant === 'subtle' && 'bg-white/[0.04] border-white/[0.08]',
      className
    )}
    style={{ boxShadow: 'var(--shadow-glass)' }}
  >
    {children}
  </div>
)
```

### Typography Rules
```
Font Stack: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif
Code/IDs: 'SF Mono', 'JetBrains Mono', monospace

Heading XL: text-4xl font-bold tracking-tight text-[#EFE1CF]
Heading L:  text-2xl font-semibold text-[#EFE1CF]
Heading M:  text-lg font-medium text-[#EFE1CF]
Body:       text-sm text-[rgba(239,225,207,0.7)]
Caption:    text-xs text-[rgba(239,225,207,0.45)]
```

---

## 🗄️ TYPESCRIPT SCHEMA — SOURCE OF TRUTH

```typescript
// src/types/schema.ts — NEVER deviate from this

export type ArtStyle = 
  | 'cinematic_realistic' | 'anime_stylized' | 'comic_book'
  | 'oil_painting' | 'watercolor' | 'pixel_art' | '3d_render'

export type Mood = 
  | 'epic' | 'mysterious' | 'romantic' | 'horror' | 'comedy'
  | 'inspirational' | 'melancholic' | 'action'

export type BrainModel = 'gemini' | 'llama4_maverick' | 'claude_sonnet'
export type ImageModel = 'gemini' | 'nova_canvas' | 'titan_v2'
export type VideoModel = 'nova_reel' | 'runway_gen4' | 'runway_gen4_turbo'
export type AudioModel = 'polly' | 'gemini_tts' | 'elevenlabs'

export type AWSRegion = 
  | 'us-west-2' | 'us-east-1' | 'ap-southeast-1'

export type AssetStatus = 'pending' | 'generating' | 'done' | 'approved' | 'failed'
export type LockedStatus = 'locked'

export interface ProjectSchema {
  project_id: string
  metadata: {
    title: string
    created_at: string
    target_platform: 'youtube_shorts' | 'reels' | 'tiktok'
    aspect_ratio: '9:16'
    art_style: ArtStyle
    mood: Mood
    brain_model: BrainModel
    total_scenes: number
    narasi_language: 'id' | 'en'
    character_names?: string
  }
  character_sheet: CharacterRef[]
  global_style_guide: {
    color_palette: string[]
    lighting_theme: string
    texture_style: string
    nano_banana_tags: string[]
    negative_global: string
  }
  scenes: Scene[]
}

export interface CharacterRef {
  name: string
  description: string
  reference_image_url?: string
}

export interface Scene {
  scene_id: number
  act: 'opening_hook' | 'rising_action' | 'climax' | 'resolution'
  title: string
  narrative_voiceover: {
    text_id: string
    text_en: string
    duration_estimate_seconds: number
    tone: string
    pacing: 'slow' | 'medium' | 'fast'
    ssml_hints: {
      pause_after: string[]
      stress: string[]
    }
  }
  recommended_image_model: ImageModel
  image_prompt: ImagePrompt
  video_prompt: VideoPrompt
  audio: AudioConfig
  status: {
    image: AssetStatus | LockedStatus
    video: AssetStatus | LockedStatus
    audio: AssetStatus | LockedStatus
  }
  assets: {
    image_url?: string
    image_r2_key?: string
    video_url?: string
    video_r2_key?: string
    audio_url?: string
    audio_r2_key?: string
    character_ref_url?: string
  }
}

export interface ImagePrompt {
  subject: {
    main: string
    characters: string[]
    action: string
    pose?: string
    expression?: string
  }
  environment: {
    setting: string
    time_of_day: string
    props: string
  }
  lighting: {
    source: string
    quality: string
    shadows: string
  }
  camera: {
    angle: string
    focal_length: string
    aperture: string
    composition: string
    movement_for_video: string
  }
  style_modifiers: string
  negative_prompts: string
}

export interface VideoPrompt {
  model_preference: VideoModel
  motion_type: string
  motion_intensity: 'subtle' | 'medium' | 'dynamic'
  duration_seconds: 5 | 10
  atmosphere: string
}

export interface AudioConfig {
  preferred_model: AudioModel
  voice_gender: 'male' | 'female'
  voice_character: string
  speed: number
  language: 'id' | 'en'
}

// Settings Store Types
export interface AppSettings {
  // AI Brain
  default_brain_model: BrainModel
  gemini_api_key: string
  bedrock_brain_region: AWSRegion

  // Image Generation
  default_image_model: ImageModel
  bedrock_image_region: AWSRegion

  // Video Generation
  default_video_model: VideoModel
  runway_api_key: string
  // Nova Reel: us-east-1 is FIXED, no user config needed

  // Audio TTS
  default_audio_model: AudioModel
  bedrock_audio_region: AWSRegion
  elevenlabs_api_key: string

  // AWS Credentials (shared for all Bedrock services)
  aws_access_key_id: string
  aws_secret_access_key: string

  // Cloudflare R2 (for Nova Reel direct output)
  r2_account_id: string
  r2_access_key_id: string
  r2_secret_access_key: string

  // General
  default_narasi_language: 'id' | 'en'
}
```

---

## ☁️ CLOUDFLARE WORKERS — CRITICAL RULES

### Env Interface (worker/index.ts)
```typescript
export interface Env {
  // KV + R2 bindings (from wrangler.toml)
  JOB_STATUS: KVNamespace
  STORY_STORAGE: R2Bucket

  // Secrets (wrangler secret put)
  GEMINI_API_KEY: string
  AWS_ACCESS_KEY_ID: string
  AWS_SECRET_ACCESS_KEY: string
  R2_ACCOUNT_ID: string
  R2_ACCESS_KEY_ID: string
  R2_SECRET_ACCESS_KEY: string
  RUNWAY_API_KEY: string
  ELEVENLABS_API_KEY: string
  ENVIRONMENT: string
}
```

### API Endpoints
```
POST /api/brain/generate          → AI Brain: story → JSON schema
GET  /api/brain/health            → Health check

POST /api/image/generate          → Trigger image gen (async)
GET  /api/image/status/:job_id    → Poll image job (5s interval)

POST /api/video/generate          → Trigger video gen (async)
GET  /api/video/status/:job_id    → Poll video job (30s interval)

POST /api/audio/generate          → Trigger audio TTS (sync/fast)
GET  /api/audio/status/:job_id    → Poll audio job

POST /api/project/save            → Save schema to R2
GET  /api/project/:id             → Load schema from R2

GET  /api/storage/presign?key=... → Get presigned download URL
```

### AWS Signature V4 — Always use worker/lib/aws-signature.ts
```typescript
// NEVER use AWS SDK — use manual Signature V4
// Pattern already implemented in image.ts — reuse for all Bedrock calls
// Use Bedrock Converse API for Brain (supports Llama + Claude uniformly)
// Endpoint: https://bedrock-runtime.{region}.amazonaws.com/model/{modelId}/converse
```

### Nova Reel → R2 Direct Output
```typescript
// Nova Reel needs S3-compatible endpoint for output
// Use R2 S3-compatible endpoint (NOT AWS S3 — zero egress fee)
// R2 endpoint: https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com
// This saves ~$0.20/GB compared to AWS S3 intermediate
```

### Security Rules
```
❌ NEVER put API keys in frontend code
❌ NEVER put API keys in vite.config.ts or .env exposed to browser
❌ NEVER use VITE_ prefix for secret keys
✅ ALL keys go in Cloudflare Workers secrets (wrangler secret put)
✅ Use worker/lib/aws-signature.ts for all AWS API calls
✅ Presigned URLs for all R2 file access (1 hour expiry)
✅ CORS configured in worker/lib/cors.ts
```

---

## 🔄 ASYNC PATTERNS — MANDATORY

### TanStack Query Polling Pattern
```typescript
// useImageGenerate.ts — polling every 5 seconds
const { data: job } = useQuery({
  queryKey: ['image-status', jobId],
  queryFn: () => api.get(`/api/image/status/${jobId}`),
  enabled: !!jobId && status === 'processing',
  refetchInterval: (data) => {
    if (data?.status === 'done' || data?.status === 'failed') return false
    return 5000 // 5s for image
  },
  refetchIntervalInBackground: true,
})

// useVideoGenerate.ts — polling every 30 seconds
refetchInterval: (data) => {
  if (data?.status === 'done' || data?.status === 'failed') return false
  return 30000 // 30s for video (Nova Reel takes 2-5 min)
}
```

### Tab Unlock Progression
```
Scene created → IMAGE tab active
Image generated → user clicks "Approve" → VIDEO tab unlocks
Video generated → user clicks "Approve" → AUDIO tab unlocks

This is enforced in:
- Scene.status.video: 'locked' → 'pending' (after image approved)
- Scene.status.audio: 'locked' → 'pending' (after video approved)
- Zustand projectStore handles state transitions
```

---

## 🎬 IMAGE PROMPT FORMAT — YouMind Nano Banana Pro

**ALWAYS in English regardless of narasi_language setting.**

```
[STYLE MODIFIER, quality], [SUBJECT with pose/expression],
[ENVIRONMENT with time_of_day and props],
[LIGHTING quality and source],
[CAMERA angle, focal_length, composition],
[TECHNICAL: resolution, render quality]
Negative: [comma-separated avoidances]
```

**Example:**
```
Cinematic realistic, 8K, epic scale, film grain subtle.
Indonesian warrior in golden battle armor standing heroically
on ancient stone steps, arms raised triumphantly, fierce expression.
Borobudur temple ruins at golden hour, torches and banners in background.
Dramatic warm side lighting from setting sun, high contrast deep shadows.
Low angle hero shot, 35mm, rule of thirds composition, wide establishing.
Photorealistic, National Geographic quality.
Negative: modern elements, text, watermark, blur, distortion, lowres
```

---

## 🤖 AI BRAIN PERSONA (System Prompt Template)

```
You are an expert Creative Director and Visual Storyteller
specializing in short-form video content for YouTube Shorts,
Instagram Reels, and TikTok.

Think in cinematic sequences. Understand visual continuity,
camera language, and narrative arc.

OUTPUT RULES:
- Respond with PURE JSON only — no markdown, no explanation, no backticks
- Follow the ProjectSchema exactly — include ALL required fields
- Image prompts ALWAYS in English (YouMind Nano Banana Pro format)
- Narasi voiceover in {LANGUAGE}
- Every scene serves the story arc:
  Scene 1 → opening_hook (captures attention in 2 seconds)
  Middle scenes → rising_action / climax (builds tension)
  Final scene → resolution (closure + implicit CTA)
- Generate BOTH text_id (Bahasa Indonesia) AND text_en (English)
  even if narasi_language is set to one language
```

---

## ⚙️ SETTINGS PAGE ARCHITECTURE

```
Settings sections:

1. 🧠 AI Brain
   - Default model: [Gemini 1.5 Flash | Llama 4 Maverick | Claude Sonnet 4.6]
   - Gemini API Key (input, masked)
   - Bedrock Brain Region: [us-west-2 | us-east-1]

2. 🎨 Image Generation
   - Default model: [Gemini Imagen | Nova Canvas | Titan V2]
   - Bedrock Image Region: [us-west-2 | us-east-1 | ap-southeast-1]

3. 🎬 Video Generation
   - Default model: [Nova Reel | Runway Gen-4 | Runway Gen-4 Turbo]
   - Nova Reel region: us-east-1 (display only — cannot change)
   - Runway API Key (input, masked) — required for Runway models

4. 🔊 Audio TTS
   - Default model: [AWS Polly | Gemini TTS | ElevenLabs]
   - Polly Region: [us-west-2 | us-east-1 | ap-southeast-1]
   - ElevenLabs API Key (input, masked) — required for ElevenLabs

5. ☁️ AWS Credentials (shared for all Bedrock services)
   - AWS Access Key ID
   - AWS Secret Access Key
   - Note: "Used for Image, Video, Audio, and AI Brain on AWS Bedrock"

6. 📦 Cloudflare R2 (for Nova Reel direct output)
   - R2 Account ID
   - R2 Access Key ID
   - R2 Secret Access Key
   - Note: "Required only if using Nova Reel video generation"

All keys stored in Zustand settingsStore → persisted in localStorage
(labeled: "Stored locally in browser — never sent to our servers")
```

---

## 📐 WRANGLER.TOML TEMPLATE

```toml
name = "fuzzy-vid-worker"
main = "worker/index.ts"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]

[[r2_buckets]]
binding = "STORY_STORAGE"
bucket_name = "igome-story-storage"

[[kv_namespaces]]
binding = "JOB_STATUS"
id = "fc732a268ca9435b8de8e50f34a35365"
preview_id = "fc732a268ca9435b8de8e50f34a35365"

[vars]
ENVIRONMENT = "production"
```

---

## 📦 PACKAGE.JSON DEPENDENCIES

```json
{
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.26.0",
    "@tanstack/react-query": "^5.56.0",
    "@tanstack/react-query-devtools": "^5.56.0",
    "zustand": "^4.5.0",
    "framer-motion": "^11.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.4.0",
    "lucide-react": "^0.462.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "@cloudflare/vite-plugin": "^1.0.0",
    "@cloudflare/workers-types": "^4.0.0",
    "wrangler": "^4.0.0",
    "vite": "^6.0.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 🚫 NEVER DO THESE

```
❌ Use AWS SDK in Workers (runtime not supported)
❌ Put secrets in VITE_ environment variables
❌ Use localStorage for API keys in production pattern
   (settingsStore uses localStorage for MVP only — must be labeled)
❌ Bulk ZIP download (individual file download only)
❌ Background music generation (user adds in CapCut)
❌ Video stitching (individual scene files only)
❌ Max scenes > 15 per project
❌ Use any aspect ratio other than 9:16
❌ Image prompts in any language other than English
❌ Inline styles (use Tailwind classes only)
❌ any TypeScript type without explicit comment explaining why
```

---

## ✅ ALWAYS DO THESE

```
✅ Every async Worker handler wrapped in try/catch
✅ Return proper error JSON: { error: string, message: string }
✅ Include CORS headers on every Worker response
✅ Use TanStack Query for ALL API calls (no bare fetch in components)
✅ Use Zustand for ALL global state (no prop drilling)
✅ Every image preview in 9:16 aspect ratio container
✅ Tab unlock progression enforced (Image → Video → Audio)
✅ Both text_id and text_en generated by AI Brain
✅ Job ID pattern: `{type}_{timestamp}_{random}` e.g. `img_1234567890_abc123`
✅ R2 key pattern: `projects/{project_id}/scene_{n}/{type}_{timestamp}.{ext}`
✅ KV job TTL: 3600 seconds (auto-cleanup)
```

---

## 🔄 DEVELOPMENT WORKFLOW

```bash
# Install dependencies
npm install

# Local dev (Workers + Frontend together via Vite plugin)
npm run dev

# Deploy Workers + Frontend
wrangler deploy

# Set secrets (run once)
wrangler secret put GEMINI_API_KEY
wrangler secret put AWS_ACCESS_KEY_ID
wrangler secret put AWS_SECRET_ACCESS_KEY
wrangler secret put R2_ACCOUNT_ID
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put RUNWAY_API_KEY
wrangler secret put ELEVENLABS_API_KEY

# Check logs
wrangler tail

# Type check
npx tsc --noEmit
```

---

## 📋 PHASE TRACKER

```
Phase 0 — Foundation         [CURRENT]
  ✓ Project setup + types + routing + glass design system

Phase 1 — AI Brain           [NEXT]
  ✓ StoryInputForm + Brain Worker + 3 model support + Storyboard display

Phase 2 — Image Generation   [PENDING]
  ✓ ImageTab + 3 model Workers + polling + preview + download + character ref

Phase 3 — Video Generation   [PENDING]
  ✓ VideoTab + Nova Reel (R2 direct) + Runway Gen-4 + polling + player

Phase 4 — Audio TTS          [PENDING]
  ✓ AudioTab + 3 TTS Workers + SSML + waveform player + download

Phase 5 — Polish & Deploy    [PENDING]
  ✓ Error states + loading UX + Cloudflare Pages + final testing
```

**Update this tracker as phases complete.**

---

## 🚫 CRITICAL AGENT BEHAVIOR RULES

### NEVER create subfolders with project name
❌ NEVER run: npm create vite@latest fuzzy-vid
❌ NEVER run: mkdir fuzzy-vid
❌ NEVER create any subfolder at root level

### Working directory is ALWAYS the repo root
✅ You are ALREADY inside ~/Fuzzy-vid (the repo root)
✅ Run ALL commands directly here: npm install, git add, etc
✅ Create files directly: src/..., worker/..., etc
✅ If asked to init a new project, use: npm create vite@latest . -- --template react-ts
   (note the DOT — installs in current directory)

### Before ANY file creation, always run: pwd
Expected output: /home/user/Fuzzy-vid
If different, cd to correct directory first.
