"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askGemini = askGemini;
const generative_ai_1 = require("@google/generative-ai");
async function askGemini(prompt, apiKey) {
    try {
        if (!apiKey) {
            return { success: false, error: 'Kunci API Gemini tidak ditemukan. Harap atur di menu Pengaturan.' };
        }
        const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return { success: true, result: text };
    }
    catch (error) {
        console.error('Gemini API Error:', error);
        const msg = error instanceof Error ? error.message : String(error);
        return { success: false, error: msg };
    }
}
