
import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully,
  // maybe showing an error message in the UI.
  // For this context, throwing an error is sufficient.
  alert("API_KEY environment variable not set. Please set it to use the Gemini API.");
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

export async function* generateTuiResponseStream(prompt: string) {
  const systemInstruction = `You are an expert assistant specializing in Terminal User Interface (TUI) development. Provide concise, helpful, and technically accurate information. Format your output using simple text, suitable for a terminal display. Do not use markdown. The user asked: ${prompt}`;

  try {
    const stream = await ai.models.generateContentStream({
      model: model,
      contents: systemInstruction,
      config: {
        // Disable thinking for lower latency, which is ideal for a responsive TUI/chat experience.
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });

    for await (const chunk of stream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Error generating response from Gemini:", error);
    yield "Error: Could not get a response from the AI assistant. Please check your API key and network connection.";
  }
}
