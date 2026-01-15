import { GoogleGenerativeAI } from "@google/generative-ai";
import { fallbackPairs } from '../data/wordPairs';

const API_KEY = "AIzaSyC6wsXnBy9L1z57nZWA33cii9gdpaxvWbg";

const genAI = new GoogleGenerativeAI(API_KEY);

export const generateWordPair = async () => {
    // Si la key sigue siendo el placeholder o está vacía/corta
    if (!API_KEY || API_KEY === "PEGA_TU_API_KEY_AQUI" || API_KEY.length < 10) {
        console.warn("API Key no configurada o inválida. Usando modo offline.");
        return getRandomFallback();
    }


    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Genera un objeto JSON válido con dos campos: 
        1. 'word': Una palabra sustantivo común en español tambien emociones para un juego de adivinanzas (ej. "Manzana", "Fútbol", "Astronauta").
        2. 'hint': Categoria de la palabra ejemplo carro: vehiculo, perro: animal, etc.
        
        Responde SOLO con el JSON.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Limpiar para asegurar JSON válido
        const jsonString = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonString);

        if (data.word && data.hint) {
            return {
                word: data.word,
                hint: data.hint
            };
        }
        throw new Error("Respuesta inválida de IA");

    } catch (error) {
        console.error("Error Gemini:", error.message);
        if (error.message.includes("400") || error.message.includes("API key")) {
            console.warn("⚠️ Tu API Key no es válida o no tiene permisos. El juego usará palabras locales por ahora.");
        }
        return getRandomFallback();
    }
};

const getRandomFallback = () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * fallbackPairs.length);
            resolve(fallbackPairs[randomIndex]);
        }, 800);
    });
};
