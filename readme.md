# 🎬 Mar Nostoc Editor — Pro Studio

A high-performance, client-side multimedia video editor and CapCut alternative built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **HTML5 Canvas**, and the **Web Audio API**.

Everything is processed 100% in the user's browser with **zero backend dependencies**, making it deployable instantly to Vercel.

---

## ✨ Features

- **Media Library Drawer:** Drag-and-drop video import with automatic canvas thumbnail generation.
- **Magnetic Snap Timeline:** Multi-track timeline that snaps the playhead to cut boundaries and split markers within `0.22s`.
- **Clip Splitting & Trimming:** Cut clips at playhead (`Split`), duplicate, or delete segments.
- **Audio & SFX Synthesizer:** Built-in Web Audio API sound generator (Swish, Bass Drop, Bubble Pop, Glitch) + MP3 upload track.
- **Cinematic LUTs & Filters:** Cyberpunk Glow, Vintage 1970s, B&W Noir, Golden Hour, and VHS Glitch.
- **Keyframe Engine:** Dynamic Ken Burns zoom-in animations.
- **Animated Text Overlays:** On-screen draggable text with typewriter, fade, and custom styling.
- **Stickers & Badges:** Draggable and scalable emojis and overlays.
- **High-Bitrate 1080p Exporter:** Frame-by-frame canvas compositing recorded at 14 Mbps via MediaRecorder.
- **Touch & Mobile Compatible:** Uses Pointer Events (`setPointerCapture`) for Android 10+ and desktop browsers.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/<YOUR-USERNAME>/mar-nostoc-editor.git
cd mar-nostoc-editor