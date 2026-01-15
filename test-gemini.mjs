import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyC6wsXnBy9L1z57nZWA33cii9gdpaxvWbg";
const genAI = new GoogleGenerativeAI(API_KEY);

async function checkModel(name) {
    console.log(`Checking ${name}...`);
    try {
        const model = genAI.getGenerativeModel({ model: name });
        await model.generateContent("Test");
        console.log(`✅ ${name} WORKS!`);
        return true;
    } catch (e) {
        console.log(`❌ ${name} FAILED.`);
        return false;
    }
}

async function run() {
    await checkModel("gemini-2.5-flash");
    await checkModel("gemini-pro");
    await checkModel("gemini-2.0-flash-exp");
    await checkModel("gemini-1.0-pro");
}

run();
