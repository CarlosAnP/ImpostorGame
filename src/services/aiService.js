import { GoogleGenerativeAI } from "@google/generative-ai";
import { fallbackPairs } from '../data/wordPairs';

const API_KEY = "AIzaSyC6wsXnBy9L1z57nZWA33cii9gdpaxvWbg";

const genAI = new GoogleGenerativeAI(API_KEY);

// Categorías para dar variedad y evitar que la IA repita siempre lo mismo
const TOPICS = [
    "Animales", "Comida", "Objetos de Casa", "Profesiones", "Lugares",
    "Deportes", "Emociones", "Tecnología", "Naturaleza", "Ropa",
    "Instrumentos Musicales", "Vehículos", "Cuerpo Humano", "Películas/Arte"
];

export const generateWordPair = async () => {
    // Si la key sigue siendo el placeholder o está vacía/corta
    if (!API_KEY || API_KEY === "PEGA_TU_API_KEY_AQUI" || API_KEY.length < 10) {
        console.warn("API Key no configurada o inválida. Usando modo offline.");
        return getRandomFallback();
    }

    // Elegir tema aleatorio para forzar variedad
    const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `Genera un objeto JSON válido para un juego de "Impostor" (Word Game):
        1. 'word': Una palabra sustantivo en español relacionada con el tema: "${randomTopic}".
        2. 'hint': ÚNICAMENTE la categoría general o familia a la que pertenece. NO des definiciones ni descripciones.
        
        EJEMPLOS DE PISTA (HINT) CORRECTOS:
        - Si la palabra es "Gato" -> hint: "Animal"
        - Si la palabra es "Hamburguesa" -> hint: "Comida"
        - Si la palabra es "Juez" -> hint: "Profesión"
        - Si la palabra es "Fútbol" -> hint: "Deporte"

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
            console.warn("⚠️ API Key inválida o sin permisos.");
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
