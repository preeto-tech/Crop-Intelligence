import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeatherData } from "./api";

const API_KEY = "AIzaSyAcAYQdVFs_19qMQkF68ydAEeTqQMPXUIQ";
const genAI = new GoogleGenerativeAI(API_KEY);

export interface AIWidget {
    type: 'weather' | 'market' | 'health' | 'irrigation' | 'fertilizer';
    title: string;
    details: string[];
    status: 'positive' | 'warning' | 'neutral';
    summary: string;
}

export interface AIResponsePayload {
    main_response: string;
    image_keyword?: string;
    widgets: AIWidget[];
}

/**
 * Generates an AI response based on user query and weather context
 */
export async function generateAIResponse(query: string, weather?: WeatherData): Promise<AIResponsePayload> {
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const weatherContext = weather
        ? `Current Weather in ${weather.city}: ${weather.temperature}°C, ${weather.condition}, Humidity: ${weather.humidity}%, Wind: ${weather.windSpeed}km/h.`
        : "Weather data currently unavailable.";

    const prompt = `
    You are an expert AgriTech AI Assistant for the "Crop Intelligence" platform.
    Your goal is to provide concise, professional, highly actionable advice to farmers.
    
    Context:
    - ${weatherContext}
    
    User Query: ${query}
    
    CRITICAL INSTRUCTION: You MUST return your response as a valid, parsable JSON object EXACTLY matching this structure, and absolutely nothing else. Do not use markdown blocks around the JSON (e.g., no \`\`\`json).
    
    {
      "main_response": "A detailed conversational response formatted in Markdown. Use bolding and lists, but do NOT include the widget data here.",
      "image_keyword": "A single word or short phrase describing a farm scene relevant to the answer (e.g., 'wheat field sunset', 'tomato plant pests', 'tractor watering'). Keep it simple for better search results. Omit if not applicable.",
      "widgets": [
        // Include 1 to 5 widgets depending on the query's relevance.
        // Try to include at least one relevant widget for farming questions.
        {
          "type": "weather" OR "market" OR "health" OR "irrigation" OR "fertilizer",
          "title": "A short, catchy title (e.g., 'Rain Incoming', 'Price Alert')",
          "details": ["Bullet point 1", "Bullet point 2"],
          "status": "positive" OR "warning" OR "neutral",
          "summary": "One line actionable takeaway"
        }
      ]
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const textResponse = await result.response.text();

        // Clean up potential markdown blocks if the model ignores instructions
        const jsonStr = textResponse.replace(/^```json/i, '').replace(/^```/, '').replace(/```$/, '').trim();

        return JSON.parse(jsonStr) as AIResponsePayload;
    } catch (error) {
        console.error("Gemini API Error or JSON Parsing Error:", error);

        // Fallback if the AI fails or parsing fails
        return {
            main_response: "I apologize, but I couldn't properly process that request. Please try asking again.",
            widgets: []
        };
    }
}
