# 🎬 Fuzzy Short — AI Story Studio

> AI-powered short video production for YouTube Shorts, Instagram Reels & TikTok

---

## ✨ Overview

Input a story prompt → AI generates a complete storyboard schema → Generate images, videos, and voiceovers scene by scene → Download individual files for CapCut editing.

---

## 🎨 Design System

**iOS 26 Liquid Glass** on pure black background:

| Token | Hex | Usage |
|-------|-----|-------|
| Orange Fire | `#F05A25` | Primary CTA, accent |
| Sky Blue | `#3FA9F6` | Secondary, status done |
| Cream Sand | `#EFE1CF` | Text, borders |
| Pure Black | `#000000` | Base background |

---

## 🧠 AI Models

### Brain (Story Schema Generation)
- Gemini 1.5 Flash (Google AI)
- Llama 4 Maverick (AWS Bedrock)
- Claude Sonnet 4.6 (AWS Bedrock)

### Image Generation
- Gemini Imagen 3 (Google AI)
- Nova Canvas v1 (AWS Bedrock — us-west-2)
- Titan Image V2 (AWS Bedrock — us-west-2)

### Video Generation
- Nova Reel v1 (AWS Bedrock — us-east-1 **fixed**)
- Runway Gen-4 (Runway API)
- Runway Gen-4 Turbo (Runway API)

### Audio TTS
- AWS Polly Neural (multi-region)
- Gemini TTS (Google AI)
- ElevenLabs (user API key)

---

## 🛠️ Setup

### Prerequisites
- Node.js 20+
- Wrangler CLI (`npm install -g wrangler`)
- Cloudflare account
- AWS account with Bedrock access

### 1. Clone & Install
```bash
git clone https://github.com/adryndian/Fuzzy-vid.git
cd Fuzzy-vid
npm install
```

### 2. Wrangler Login
```bash
export CLOUDFLARE_API_TOKEN=your_token
wrangler whoami
```

### 3. Set Secrets
```bash
wrangler secret put GEMINI_API_KEY
wrangler secret put AWS_ACCESS_KEY_ID
wrangler secret put AWS_SECRET_ACCESS_KEY
wrangler secret put R2_ACCOUNT_ID
wrangler secret put R2_ACCESS_KEY_ID
wrangler secret put R2_SECRET_ACCESS_KEY
wrangler secret put RUNWAY_API_KEY
wrangler secret put ELEVENLABS_API_KEY
```

### 4. Dev Server
```bash
npm run dev
```

### 5. Deploy
```bash
wrangler deploy
```

---

## 📋 Constraints

- Max **15 scenes** per project
- Output: **9:16 portrait** only (Shorts/Reels/TikTok)
- **No video stitching** — individual scene files
- **No bulk ZIP** — download per file
- **No BGM** — user adds in CapCut
- **Image prompts: English only** (all models)
- Nova Reel output: **directly to R2** (zero egress)

---

## 🔧 R2 + KV Info

```
Bucket:  igome-story-storage
KV ID:   fc732a268ca9435b8de8e50f34a35365
Worker:  fuzzy-vid-worker
```

---

## 📦 Phase Status

- [ ] Phase 0 — Foundation (types, routing, glass UI)
- [ ] Phase 1 — AI Brain (3 models + storyboard)
- [ ] Phase 2 — Image Generation
- [ ] Phase 3 — Video Generation
- [ ] Phase 4 — Audio TTS
- [ ] Phase 5 — Polish & Deploy
