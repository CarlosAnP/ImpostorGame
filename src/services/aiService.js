import { fallbackPairs } from '../data/wordPairs';

// Simulates an AI API call to generate a unique word pair
export const generateWordPair = async () => {
    // In a real implementation, this would call OpenAI/Gemini API
    // For now, we simulate network delay and pick from fallback

    return new Promise((resolve) => {
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * fallbackPairs.length);
            resolve(fallbackPairs[randomIndex]);
        }, 1500); // 1.5s delay to make it feel like "thinking"
    });
};
