import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI = null;
let model = null;

export const initializeGemini = (apiKey) => {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const analyzeMeetingNotes = async (notes) => {
    if (!model) {
        throw new Error("Gemini non inizializzato. Inserisci la API Key nelle impostazioni.");
    }

    const prompt = `
    Analizza i seguenti appunti presi durante un meeting con un fornitore di vini.
    Estrai le seguenti informazioni in formato JSON:
    
    1. "supplier": Nome del fornitore (se presente/deducibile)
    2. "summary": Un riassunto conciso del meeting (max 3 frasi)
    3. "action_items": Una lista di azioni da compiere (es. "Inviare listino", "Assaggiare campione")
    4. "sentiment": Il sentiment generale del meeting (Positivo, Neutro, Negativo)
    5. "tags": Lista di tag rilevanti (es. "Vino Rosso", "Borgogna", "Prezzi alti")

    Appunti:
    "${notes}"
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Errore analisi Gemini:", error);
        throw error;
    }
};

export const analyzeBusinessCard = async (imageBase64) => {
    if (!model) {
        throw new Error("Gemini non inizializzato. Inserisci la API Key per analizzare l'immagine.");
    }

    const prompt = `
    Analizza questa immagine di un biglietto da visita.
    Estrai le seguenti informazioni in formato JSON:
    
    1. "supplier": Nome dell'azienda o del fornitore principale.
    2. "attendees": Un array di stringhe con i nomi delle persone trovate sul biglietto (o dipendenti).
    3. "email": L'indirizzo email principale trovato.
    4. "phone": Il numero di telefono principale.
    5. "website": Il sito web (se presente).

    Se l'immagine non è chiara o non sembra un biglietto da visita, restituisci comunque un JSON valido con campi vuoti o null.
  `;

    try {
        // Gestione input base64 grezzo o con header
        const base64Data = imageBase64.includes('base64,')
            ? imageBase64.split('base64,')[1]
            : imageBase64;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Errore analisi Biglietto da Visita:", error);
        throw error;
    }
};
