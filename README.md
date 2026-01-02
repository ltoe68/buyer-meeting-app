# 📋 Buyer Meeting Tracker

> Traccia i tuoi incontri con i fornitori, scansiona biglietti da visita e organizza le tue note con l'IA.

## ✨ Funzionalità

- **📅 Gestione Incontri** - Traccia tutti i meeting con i fornitori
- **📇 Scansione Biglietti** - OCR integrato per acquisire contatti rapidamente
- **🤖 Note Intelligenti** - Organizza e categorizza le tue note con AI
- **📱 Mobile-First** - Design responsive ottimizzato per smartphone

## 🚀 Demo Live

👉 [https://buyer-insight--affaridivini.replit.app](https://buyer-insight--affaridivini.replit.app)

## 🛠 Tecnologie

- **React 19.2** - UI Library
- **Vite 5.0** - Build Tool & Dev Server
- **Notion API** - Database per meeting e contatti
- **OpenAI API** - AI-powered note organization
- **OCR Integration** - Business card scanning

## 📦 Installazione

```bash
# Clone repository
git clone https://github.com/ltoe68/buyer-meeting-app.git
cd buyer-meeting-app

# Installa dipendenze
npm install

# Configura variabili d'ambiente
cp .env.example .env
# Modifica .env con le tue chiavi API

# Avvia dev server
npm run dev
```

## 🔑 Configurazione

Crea un file `.env` basato su `.env.example` e configura:

- **NOTION_TOKEN** - Token API Notion per salvare i meeting
- **NOTION_DATABASE_ID** - ID del database Notion
- **OPENAI_API_KEY** - Chiave OpenAI per AI features
- **SESSION_SECRET** - Secret per sessioni (genera random)

```bash
# Genera un session secret sicuro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📝 Utilizzo

1. **Registra un incontro** - Aggiungi data, fornitore e note
2. **Scansiona biglietti** - Usa la camera per acquisire contatti
3. **Organizza con AI** - Lascia che l'AI categorizzi le tue note
4. **Esporta dati** - Scarica report e statistiche

## 🎯 Roadmap

- [ ] Export Excel/CSV
- [ ] Integrazione Calendar
- [ ] Dashboard Analytics
- [ ] Multi-lingua
- [ ] Dark Mode

## 👨‍💻 Autore

**Luca Toesca** - Wine Buyer & Developer

## 📄 Licenza

MIT License - vedi [LICENSE](LICENSE) per dettagli

---

*Creato con ❤️ per wine buyers professionisti*
