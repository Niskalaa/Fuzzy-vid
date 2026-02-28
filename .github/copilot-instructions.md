# 🎬 FUZZY SHORT — AI Story Studio
## GitHub Copilot Agent Instructions

---

## 🎯 PROJECT IDENTITY

**App Name:** Fuzzy Short  
**Purpose:** AI-powered short video production for YouTube Shorts, Instagram Reels & TikTok  
**Repo:** https://github.com/adryndian/Fuzzy-vid.git  

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

## 🚫 CRITICAL BEHAVIOR RULES

```
❌ NEVER create subfolder named 'fuzzy-vid' — you are already in project root
❌ NEVER run: npm create vite@latest fuzzy-vid
❌ NEVER run: npm run dev or any dev server
❌ NEVER put API keys in frontend code or VITE_ prefix
❌ NEVER use AWS SDK in Workers (use manual Signature V4)
❌ NEVER use any aspect ratio other than 9:16
❌ NEVER use Hono or any framework not in tech stack
❌ NEVER use bullet points in response, use prose

✅ ALWAYS run: pwd first to confirm location = /workspaces/Fuzzy-vid
✅ ALWAYS use: npm create vite@latest . (dot = current dir)
✅ ALWAYS after fixing: npx tsc --noEmit then git commit
✅ ALWAYS use TanStack Query v5 pattern (no onSuccess in useQuery)
✅ ALWAYS use named exports for components
✅ ALWAYS use import type for TypeScript type imports
```

---

## 🏗️ TECH STACK — STRICT

```
Frontend:
  React 18 + Vite + TypeScript (strict: true)
  Tailwind CSS + Shadcn/UI
  Zustand (global state)
  TanStack Query v5 (ALL API calls + polling)
  React Router v6
  Framer Motion

Backend:
  Cloudflare Workers (@cloudflare/vite-plugin)
  Cloudflare R2 (storage — bucket: igome-story-storage)
  Cloudflare KV (job status — id: fc732a268ca9435b8de8e50f34a35365)
```

---

## 🤖 AI MODELS

```
BRAIN:
  gemini    → Gemini 1.5 Flash (Google AI)
  llama4    → us.meta.llama4-maverick-17b-instruct-v1:0 (Bedrock)
  claude    → us.anthropic.claude-sonnet-4-6-20251001-v1:0 (Bedrock)
  regions   → us-west-2 (primary), us-east-1 (fallback)

IMAGE:
  gemini       → imagen-3.0-generate-002 (Google AI)
  nova_canvas  → amazon.nova-canvas-v1:0 (Bedrock)
  titan_v2     → amazon.titan-image-generator-v2:0 (Bedrock)
  regions      → us-west-2, us-east-1, ap-southeast-1

VIDEO:
  nova_reel        → amazon.nova-reel-v1:0 (Bedrock — us-east-1 FIXED)
  runway_gen4      → Runway API (global)
  runway_gen4_turbo → Runway API (faster)
  Nova Reel output → DIRECTLY to R2 via S3-compatible endpoint (zero egress)

AUDIO:
  polly       → AWS Polly Neural (multi-region)
  gemini_tts  → Google AI TTS
  elevenlabs  → ElevenLabs API (user key)
  ID voices   → Arlet (female), Satria (male)
  EN voices   → Joanna (female), Matthew (male)
```

---

## 📁 PROJECT STRUCTURE

```
/workspaces/Fuzzy-vid/          ← ROOT (pwd must show this)
├── src/
│   ├── components/
│   │   ├── glass/              → GlassCard, GlassButton, GlassInput, GlassModal, GlassBadge
│   │   ├── layout/             → Header, AppLayout
│   │   ├── forms/              → StoryInputForm
│   │   ├── scene/
│   │   │   ├── SceneCard.tsx
│   │   │   ├── SceneWorkspace.tsx
│   │   │   └── tabs/           → ImageTab, VideoTab, AudioTab
│   │   ├── storyboard/         → StoryboardGrid, ProgressBar
│   │   ├── skeletons/          → ImageSkeleton, VideoProgressBar
│   │   └── ui/                 → button, tabs, Shadcn components
│   ├── pages/                  → Home, Storyboard, Project, Settings
│   ├── store/                  → projectStore, settingsStore (Zustand)
│   ├── hooks/                  → useBrainGenerate, useImageGenerate, useVideoGenerate, useAudioGenerate
│   ├── types/                  → schema.ts (source of truth)
│   ├── lib/                    → api.ts, utils.ts
│   └── styles/                 → glass.css
├── worker/
│   ├── index.ts                → Main router + Env interface + CORS
│   ├── brain.ts                → AI Brain (3 models)
│   ├── image.ts                → Image gen (3 models)
│   ├── video.ts                → Video gen (Nova Reel + Runway)
│   ├── audio.ts                → Audio TTS (3 models)
│   ├── project.ts              → Save/load to R2
│   ├── storage.ts              → R2 operations + presigned URLs
│   └── lib/
│       ├── aws-signature.ts    → AWS Signature V4 (manual)
│       └── cors.ts             → CORS headers
├── .github/
│   └── copilot-instructions.md ← THIS FILE
├── .vscode/
│   └── mcp.json                → MCP servers
├── .devcontainer/
│   └── devcontainer.json       → Codespaces config
├── wrangler.toml
├── vite.config.ts
└── package.json
```

---

## 🎨 DESIGN SYSTEM — iOS 26 LIQUID GLASS

```
Colors (STRICT — never deviate):
  #000000  → Base background (Pure Black)
  #F05A25  → Primary accent (Orange Fire)
  #3FA9F6  → Secondary (Sky Blue)
  #EFE1CF  → Text primary (Cream Sand)

Glass CSS Variables (src/styles/glass.css):
  --glass-01: rgba(255,255,255,0.04)   subtle panels
  --glass-02: rgba(255,255,255,0.07)   cards
  --glass-03: rgba(255,255,255,0.10)   modals
  --glass-04: rgba(255,255,255,0.14)   hover
  --glass-border-02: rgba(239,225,207,0.14)
  --glass-specular: rgba(255,255,255,0.55)
  --blur-md: blur(20px) saturate(180%)
  --glow-orange: 0 0 24px rgba(240,90,37,0.35)
  --glow-blue: 0 0 24px rgba(63,169,246,0.35)
  --text-primary: #EFE1CF
  --text-secondary: rgba(239,225,207,0.6)
```

---

## 📋 TYPESCRIPT — KEY RULES

```typescript
// ✅ CORRECT — TanStack Query v5 polling (no onSuccess)
const query = useQuery({
  queryKey: ['image-status', jobId],
  queryFn: () => api.get(`/api/image/status/${jobId}`),
  enabled: !!jobId && enabled,
  refetchInterval: (query) => {
    const data = query.state.data
    if (data?.status === 'done' || data?.status === 'failed') return false
    return 5000
  }
})
// Then use useEffect to react to data changes

// ✅ CORRECT — Type imports
import type { ProjectSchema, Scene } from '../types/schema'

// ✅ CORRECT — Named exports
export { GlassCard }
export { SceneCard }
export { ImageTab }

// ✅ CORRECT — api.ts with Vite env
/// <reference types="vite/client" />
const WORKERS_URL = import.meta.env.VITE_WORKERS_URL ?? ''

// ✅ CORRECT — Cloudflare vite plugin
import { cloudflare } from '@cloudflare/vite-plugin'

// ✅ CORRECT — Worker handler pattern (NO Hono)
export async function handleBrainRequest(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    // handler code
  } catch (error) {
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
```

---

## ⚙️ WRANGLER CONFIG

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

## 🔧 WORKER ENV INTERFACE

```typescript
export interface Env {
  JOB_STATUS: KVNamespace
  STORY_STORAGE: R2Bucket
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

---

## 🔄 API ENDPOINTS

```
POST /api/brain/generate       → AI Brain
POST /api/image/generate       → Image gen (async)
GET  /api/image/status/:id     → Poll 5s
POST /api/video/generate       → Video gen (async)
GET  /api/video/status/:id     → Poll 30s
POST /api/audio/generate       → TTS
GET  /api/audio/status/:id     → Poll audio
POST /api/project/save         → Save to R2
GET  /api/project/:id          → Load from R2
GET  /api/storage/presign      → Presigned URL
```

---

## 📋 PHASE STATUS

```
Phase 0 — Foundation        ✅ Complete
Phase 1 — AI Brain          ✅ Complete
Phase 2 — Image Generation  ✅ Complete
Phase 3 — Video Generation  ✅ Complete
Phase 4 — Audio TTS         ✅ Complete
Phase 5 — Polish            ✅ Complete
CURRENT — Fix Build Errors  ← IN PROGRESS
```

---

## 🐛 KNOWN BUILD ERRORS TO FIX

```
Priority 1 — TypeScript errors (blocking deploy):
1. All component imports → use named exports { ComponentName }
2. All type imports → use import type { TypeName }
3. TanStack Query v5 → remove onSuccess from useQuery
4. vite.config.ts → import { cloudflare } from '@cloudflare/vite-plugin'
5. src/lib/api.ts → use /// <reference types="vite/client" />
6. src/App.tsx → remove vite template SVG imports
7. Missing: src/components/ui/button.tsx
8. Missing: src/components/ui/tabs.tsx
9. Missing: src/components/skeletons/ImageSkeleton.tsx
10. Missing: src/components/skeletons/VideoProgressBar.tsx
11. SceneWorkspace.tsx → import Tabs from '../ui/tabs' not SegmentedControl

After fixing: npx tsc --noEmit must return 0 errors
Then: npm run build must succeed
Then: git add . && git commit -m "fix: all build errors resolved" && git push
```
