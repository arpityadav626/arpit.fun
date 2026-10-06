# AI HUB ✲ (arpit.fun)

> **High-Performance 3D AI Discovery Station & Media Suite**  
> Built with React 19, TypeScript, Three.js, Tailwind CSS v4, and Framer Motion.

---

## 🌟 Overview

**AI HUB** is a minimalist, luxury dark obsidian web application featuring a continuous periodic 3D helical spiral navigation system inspired by haute horlogerie and editorial aesthetics. It integrates five specialized intelligent discovery engines with direct in-app execution, zero-redirect workflows, and 2x Retina super-sampled visual rendering.

---

## ✨ Features & AI Tools

### 1. 🌀 3D Spiral Engine (`ThreeCardsSpiral.tsx`)
- Continuous closed-loop periodic helical geometry rendered with custom GLSL shaders.
- Depth-of-Field (DoF) multi-tap Gaussian disc blur for background depth cards.
- 2x Retina super-sampled artwork canvases (2048x1280) with 16x anisotropic filtering.
- Effortless high-sensitivity momentum wheel scrolling and touch dragging.

### 2. 🎬 Cinema & YouTube Hub (`FilmFinder.tsx`)
- **In-App 4K Theater Player**: Watch verified official trailers and full public domain cinema directly in-app.
- 100% legal, zero-piracy streaming directory (Internet Archive Cinema, JustWatch streaming availability guide, and YouTube storefront).
- Category filters for Sci-Fi, Action, Drama, Classic, Documentary, and Animation.

### 3. 🎵 Soundtracks & 24/7 Ambient Stations (`MusicFinder.tsx`)
- **Live In-App Ambient Player**: Stream 24/7 focus channels (Lofi Girl, Nightride FM Synthwave, Hans Zimmer Cinematic Suite, Ludovico Einaudi Piano, Cyberpunk Night City, Deep Space Drone, Rainy Cafe Jazz).
- Real-time animated audio visualizer waves with volume controls.
- Universal music search query dispatcher across Spotify, YouTube Music, Apple Music, SoundCloud, and Bandcamp.

### 4. 📚 Books & Research Finder (`BookFinder.tsx`)
- **In-App Book Reader**: Read timeless literary masterworks (*Frankenstein*, *Pride & Prejudice*, *The Great Gatsby*, *Meditations*, *Sherlock Holmes*, *Metamorphosis*, etc.) directly inside a focused reader frame.
- 1-click `.epub` downloads for offline Kindle reading.
- Live search across Project Gutenberg (70,000+ public domain works) and Open Library.

### 5. ⚡ AI Summarizer & Synthesis Studio (`AISummarizer.tsx`)
- Multi-mode text synthesis: Executive Brief, Key Takeaways, Simple (ELI5), and Deep Synthesis.
- Generative AI cloud processing (Google Gemini / Groq Llama-3) with local offline heuristic NLP fallback.
- Real-time metrics: Word count, character count, estimated reading time, and Compression Ratio gauge.
- 1-click Markdown export (`.md`) and concept entity hashtag extraction.

### 6. 🔍 Search Operator & Research Studio (`SearchOperators.tsx`)
- Surgical boolean dork builder with interactive active filter token tags.
- 1-click research presets for Academic Theses (`.edu`), ArXiv preprints, Public Domain PDFs, and GitHub architectures.
- Triple-engine execution across Google Search, DuckDuckGo, and Bing.

---

## 🛠 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **3D Graphics**: [Three.js](https://threejs.org/) (custom GLSL shaders & procedural canvas textures)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Audio Engine**: Custom Web Audio API synthesizer (subtle clicks, zero background humming)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/arpityadav626/arpit.fun.git
cd arpit.fun

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Type check and build optimized bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deploy to Vercel / Netlify / Google / Firebase

### 1-Click Deploy on Vercel
```bash
npm install -g vercel
vercel
```

### Deploy on GitHub Pages
Push to `main` branch with GitHub Actions Vite deploy workflow.

---

## 📄 License
MIT License. Created by [Arpit Yadav](https://github.com/arpityadav626).
