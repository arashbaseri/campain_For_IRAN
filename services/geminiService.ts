
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function optimizeCampaignContent(
  currentText: string, 
  tone: 'professional' | 'urgent' | 'empathetic' | 'concise'
) {
  const prompt = `
    Optimize the following email content intended for a Member of Parliament (MP). 
    The tone should be ${tone}. 
    Ensure the message is persuasive, respectful, and clearly states a call to action.
    
    Current Content:
    ${currentText}
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.7,
      thinkingConfig: { thinkingBudget: 0 }
    }
  });

  return response.text || currentText;
}

export async function suggestSubjectLines(body: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the following email body, suggest 3 compelling and professional subject lines for an email to an MP. Return as a JSON array of strings.
    
    Email Body:
    ${body}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
}
