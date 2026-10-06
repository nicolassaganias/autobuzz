# ΛUTOBUZZ

Sitio del colectivo Autobuzz (archivo de obras + **AutobuzzIA**), listo para desplegar en Vercel.

Contenido migrado desde [cargocollective.com/autobuzz](https://cargocollective.com/autobuzz/): fotos, galerías, descripciones y videos.

## Desarrollo

```bash
npm install
cp .env.example .env.local
# Pegá tu GEMINI_API_KEY de https://aistudio.google.com/apikey (cuenta gratuita)
npm run dev
```

## AutobuzzIA

Chat en `/ia` con Gemini Flash (tier gratuito). Usa `GEMINI_API_KEY` o `GOOGLE_GENERATIVE_AI_API_KEY`.

En Vercel: Project → Settings → Environment Variables → `GEMINI_API_KEY`.

## Scripts

- `npm run dev` — local
- `npm run build` — build de producción
- `npm start` — servir build
