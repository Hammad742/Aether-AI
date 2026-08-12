# Aether-AI — Interactive AI Assistant

A high-performance, responsive, and mobile-optimized web application interface for chat interactions and image generation. Built with React, Vite, Tailwind CSS, and custom hardware-accelerated animations.

## 🔗 Live Demo

Try the live app here: [hammad-aether-ai-zvis.vercel.app](https://hammad-aether-ai-zvis.vercel.app/)

![Version](https://img.shields.io/badge/version-1.0.0-blue) ![React](https://img.shields.io/badge/React-19-blue?logo=react) ![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)

---

## ✨ Features & Optimizations

- **Apple-Inspired Design:** Redesigned premium dark login screen featuring an interactive, mouse-tracked diagonal horizon luminous arc.
- **0ms Input Latency:** Uncontrolled DOM input textarea bypasses React's virtual-DOM rendering loops for completely latency-free typing.
- **Dynamic Input Auto-Grow:** Text area expands naturally up to `200px` height as you type multiline messages, resetting instantly upon submission.
- **Throttled Streaming State commits:** Aggregates incoming token streams in memory, rendering to React state at a throttled frame threshold (80ms / ~12.5 FPS) to eliminate layout thrashing during generation.
- **CORS API Proxies:** Configured for both development (Vite proxies) and production (Vercel rewrites) to guarantee that DuckDuckGo searches and Pollinations AI generations execute without CORS errors or adblocker blocks.

---

## 🤖 Integrated AI Models

Aether-AI comes pre-configured with five model options:

1. **Gemma 4 26B** — A highly capable, open text model by Google.
2. **GPT OSS 20B** — Balanced open-source language model for general requests.
3. **Laguna XS** — Light, high-speed model optimized for rapid task execution.
4. **Nemotron 12B VL** — Capable multimodal model supporting visual queries.
5. **FLUX Image Generation** — Pre-fetched image generation utilizing Hugging Face API pipelines or Pollinations AI with robust client-side retry/failover fallbacks.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env` in the root of the project:

```env
# OpenRouter API key for text models (Required)
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here

# Hugging Face API Token for image models (Optional, falls back to Pollinations AI proxy)
VITE_HUGGING_FACE_API_KEY=your_huggingface_api_key_here
```

---

## 🚀 Local Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd Aether-AI
   ```

2. **Configure Environment:**
   Create a `.env` file and populate it with your OpenRouter and Hugging Face keys.

3. **Install Dependencies:**
   ```bash
   npm install
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/Aether-AI/` in your browser.

5. **Production Build & Preview:**
   ```bash
   npm run build
   npm run preview
   ```

---

## ☁️ Vercel Deployment

Aether-AI is fully prepared for one-click Vercel deployments:

1. **Import Project:** Import your GitHub repository in Vercel.
2. **Set Environment Variables:** In the Vercel project settings, define:
   - `VITE_OPENROUTER_API_KEY`
   - `VITE_HUGGING_FACE_API_KEY` (optional)
3. **Automatic Routing & Proxies:** The build settings will automatically detect Vite. The custom [`vercel.json`](vercel.json) routes requests through Vercel's rewrite proxies (bypassing CORS barriers) and maps all SPA routes back to `index.html`.
4. **Build & Deploy:** Click **Deploy**. Your app is live!

---

## 🛡️ Security Guidelines

- **Never commit `.env` files** to GitHub. The `.gitignore` is pre-configured to block `.env`, local configurations, and development test logs.
- All client-side console logs and debuggers are automatically stripped from production builds via Vite's `esbuild` configuration.
