# Buyer Meeting App

App operativa per incontri con fornitori: raccolta note, (opz.) trascrizione audio, salvataggio su Notion, analisi e follow-up.

![CI](https://github.com/ltoe68/buyer-meeting-app/actions/workflows/ci.yml/badge.svg)

## Stack
- Client: React + Vite
- Server: Express + TypeScript
- Storage: Notion DB
- Transcription: OpenAI

## Setup (Local)
```bash
cp .env.example .env
npm install
npm run dev
```

## Deploy
- Vercel / Railway / Render
- Configura env vars da `.env.example`
