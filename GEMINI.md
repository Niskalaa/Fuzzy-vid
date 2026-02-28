# FUZZY SHORT — Gemini CLI Instructions

## Quick Context
- App: AI-powered short video production (YouTube Shorts, Reels, TikTok)
- Stack: React 18 + Vite + Cloudflare Workers + AWS Bedrock + Google AI
- UI: iOS 26 Liquid Glass — palette #F05A25 #3FA9F6 #EFE1CF on #000000
- State: Zustand (global) + TanStack Query v5 (API + polling)
- Storage: Cloudflare R2 (zero egress) — bucket: igome-story-storage

## Critical Rules
1. ALL API keys → Cloudflare Workers secrets only (wrangler secret put)
2. NO AWS SDK → manual Signature V4 in worker/lib/aws-signature.ts
3. NO bare fetch → always TanStack Query hooks
4. NO prop drilling → always Zustand store
5. ALL images/videos → 9:16 aspect ratio ONLY
6. Image prompts → English ALWAYS (YouMind Nano Banana Pro format)

## Worker Endpoints
POST /api/brain/generate     → AI Brain (Gemini | Llama4 | Claude)
POST /api/image/generate     → Image gen async
GET  /api/image/status/:id   → Poll 5s
POST /api/video/generate     → Video gen async  
GET  /api/video/status/:id   → Poll 30s (Nova Reel 2-5 min)
POST /api/audio/generate     → TTS (sync)
POST /api/project/save       → Save to R2
GET  /api/project/:id        → Load from R2
GET  /api/storage/presign    → Get presigned URL

## AWS Bedrock Model IDs
Brain:
  Llama 4: us.meta.llama4-maverick-17b-instruct-v1:0
  Claude:  us.anthropic.claude-sonnet-4-6-20251001-v1:0
  Regions: us-west-2, us-east-1

Image:
  Nova Canvas: amazon.nova-canvas-v1:0
  Titan V2:    amazon.titan-image-generator-v2:0
  Regions: us-west-2, us-east-1, ap-southeast-1

Video:
  Nova Reel: amazon.nova-reel-v1:0 → us-east-1 ONLY (FIXED)
  Output: directly to R2 via S3-compatible endpoint
  R2 endpoint: https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com

Audio:
  Polly Neural: AWS Polly API (not Bedrock)
  Regions: us-west-2, us-east-1, ap-southeast-1
  ID voices — id: Arlet (female), Satria (male)
  EN voices — en: Joanna (female), Matthew (male)

## R2 Key Patterns
projects/{project_id}/scene_{n}/image_{timestamp}.png
projects/{project_id}/scene_{n}/video_{timestamp}.mp4
projects/{project_id}/scene_{n}/audio_{lang}_{timestamp}.mp3
projects/{project_id}/schema.json

## KV Pattern
job:{job_id} → { status, created_at, r2_key?, completed_at?, error? }
TTL: 3600 seconds

## Tab Unlock Logic
image: pending → generating → done → APPROVED
                                          ↓
video: locked ——————————————————→ pending → generating → done → APPROVED
                                                                      ↓
audio: locked ————————————————————————————————————————→ pending → done

## Glass Component Pattern
Use GlassCard from src/components/glass/GlassCard.tsx
Never use raw divs for panels — always GlassCard variant
Variants: 'default' | 'strong' | 'subtle'

## Current Phase
Phase 0 — Foundation (update as you progress)

## When Stuck
- Workers runtime issues → check @cloudflare/workers-types
- Bedrock API issues → check AWS Signature V4 in worker/lib/aws-signature.ts
- React Query issues → check TanStack Query v5 docs via Context7 MCP
