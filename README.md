# 🎨 PixelPerfect

> A modern, beautifully animated web app for **resizing and compressing images** with pixel-perfect precision — built with React 19, Vite 7, and Tailwind CSS.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC)](https://tailwindcss.com)

## ✨ Features

- 🖼️ **Image Resize** — exact dimensions, with optional aspect-ratio lock
- 🗜️ **Smart Compression** — target a file size, the app gets you there
- 🎨 **Multiple Formats** — JPEG, PNG, and WebP output
- 🌓 **Dark Mode** — sleek dark theme
- 💫 **Gradient Animations** — vibrant, eye-catching UI
- 🪶 **Zero Backend** — everything runs client-side, your images never leave the browser

## 🛠️ Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS 3** + PostCSS
- **ESLint 9** with React Hooks + Refresh plugins
- Public assets: `manifest.json`, `robots.txt`, `sitemap.xml`

## 📁 Project Structure

```
.
├── public/
│   ├── manifest.json
│   ├── robots.txt
│   └── sitemap.xml
├── src/
│   ├── App.jsx
│   ├── FormFit.jsx        # core image-resize/compress logic
│   ├── main.jsx
│   └── index.css
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## 🚀 Getting Started

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production bundle
npm run preview      # preview the build
```

## 🔍 SEO

SEO-friendly out of the box — see `SEO_STRATEGY.md` for the full plan, plus `robots.txt` and `sitemap.xml` shipped in `public/`.

## 📜 License

[MIT](LICENSE) © 2026 Pranav Gawas
