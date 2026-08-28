import { GoogleGenerativeAI } from '@google/generative-ai';

export async function askGemini(prompt: string, apiKey: string): Promise<{ success: boolean; result?: string; error?: string }> {
  try {
    if (!apiKey) {
      return { success: false, error: 'Kunci API Gemini tidak ditemukan. Harap atur di menu Pengaturan.' };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return { success: true, result: text };
  } catch (error: unknown) {
    console.error('Gemini API Error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return { success: false, error: msg };
  }
}
