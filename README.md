# Aether AI - Optimized OpenRouter Client

A high-performance, mobile-optimized React AI chat application.

## 🚀 One-Click Deployment

### Vercel
1. Connect this repository to Vercel.
2. Add your `VITE_OPENROUTER_API_KEY` to the Environment Variables.
3. Your proxies for Web Search and Image Generation will work automatically via `vercel.json`.

### Netlify
1. Connect this repository to Netlify.
2. Add your `VITE_OPENROUTER_API_KEY` to the Environment Variables.
3. Proxies will be handled by `netlify.toml`.

## ✨ Key Features & Optimizations

- **0ms Native Typing (ChatGPT Style):** The input box uses an uncontrolled DOM architecture to bypass React's standard 60fps render lag, providing instantaneous typing speed.
- **Hardware-Accelerated Mobile UI:**
  - Standardized **Touch Response Engine** adds a premium scale-down effect (squish) to all buttons on mobile.
  - Eliminated the 300ms mobile tap delay for instant interaction.
  - Glassmorphism (Backdrop Blur) is isolated in its own GPU compositor layer to prevent stuttering.
- **Auto-Model Selection:** Defaults to `Step 3.5 Flash` for new sessions.
- **Full Proxy Support:** Seamless DuckDuckGo Web Search and Image Generation even in production environments.

## ⚙️ Setup

1. Copy `.env.example` to `.env`.
2. Enter your [OpenRouter API Key](https://openrouter.ai/keys).
3. `npm install`
4. `npm run dev`

## 🛠️ Build

```bash
npm run build
```
The build process includes vendor chunking and automatic console log removal for maximum security and performance.
