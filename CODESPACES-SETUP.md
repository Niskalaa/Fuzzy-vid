# 🚀 Fuzzy Short — Codespaces Setup Guide

## Step 1 — Copy Files ke Repo

Dari Firebase Studio terminal:
```bash
# Buat folders
mkdir -p .github .vscode .devcontainer

# Copy instructions
cp .idx/airules.md .github/copilot-instructions.md

# Copy file baru dari download
# Upload semua file ini ke repo
```

## Step 2 — Push ke GitHub

```bash
git add .
git commit -m "feat: add Codespaces config"
git push origin main
```

## Step 3 — Buka Codespaces

1. Buka https://github.com/adryndian/Fuzzy-vid
2. Klik tombol hijau **Code**
3. Tab **Codespaces**
4. **Create codespace on main**
5. Tunggu ~2 menit (auto install semua dependencies)

## Step 4 — Set Secrets di GitHub

Sebelum buka Codespaces, set secrets dulu:
1. https://github.com/settings/codespaces
2. **New secret** → tambahkan satu per satu:

```
CLOUDFLARE_API_TOKEN  → token Cloudflare
GEMINI_API_KEY        → Google AI key
AWS_ACCESS_KEY_ID     → AWS key
AWS_SECRET_ACCESS_KEY → AWS secret
R2_ACCOUNT_ID         → Cloudflare account ID
R2_ACCESS_KEY_ID      → R2 token key
R2_SECRET_ACCESS_KEY  → R2 token secret
RUNWAY_API_KEY        → Runway ML key
ELEVENLABS_API_KEY    → ElevenLabs key
```

## Step 5 — Fix Build Errors (First Task)

Di Codespaces terminal:
```bash
# Verify location
pwd
# Expected: /workspaces/Fuzzy-vid

# Test current build
npm run build 2>&1 | head -30
```

Lalu di Copilot Chat ketik:
```
@workspace Read .github/copilot-instructions.md completely.
Then fix ALL TypeScript build errors listed in the 
"KNOWN BUILD ERRORS TO FIX" section.
Fix all files, then run npx tsc --noEmit.
After clean, run npm run build.
After successful build, git commit and push.
```

## Step 6 — Deploy

```bash
# Set Cloudflare token (sudah dari secrets)
wrangler whoami

# Deploy Workers
wrangler deploy

# Push → Cloudflare Pages auto-rebuild
git push origin main
```

## MCP Servers

Context7 dan Cloudflare MCP sudah dikonfigurasi di `.vscode/mcp.json`.
Akan auto-start saat Codespaces dibuka.

## Tips Copilot Agent

- Gunakan `@workspace` untuk context seluruh codebase
- Gunakan `#file:.github/copilot-instructions.md` untuk attach instructions
- Untuk fix TypeScript: `@workspace Fix the TypeScript error in #file:src/hooks/useImageGenerate.ts`
- Untuk multiple files: describe semua yang perlu difix dalam 1 prompt
