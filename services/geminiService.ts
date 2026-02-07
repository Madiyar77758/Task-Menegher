import { GoogleGenAI, Type } from "@google/genai";
import { Priority, AITaskParseResult } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to get today's date for context
const getTodayContext = () => {
  const now = new Date();
  return `Today is ${now.toISOString()}.`;
};

export const parseTaskFromNaturalLanguage = async (input: string): Promise<AITaskParseResult> => {
  if (!apiKey) throw new Error("API Key is missing");

  const modelId = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are an intelligent task parsing assistant. 
    Extract task details from the user's natural language input.
    Translate any relative dates (like "tomorrow", "next friday") into ISO 8601 date strings based on the current date context.
    If no priority is specified, default to MEDIUM.
    If no date is specified, return null.
    Language: The input is likely in Russian, but output must be in the specified JSON schema.
    ${getTodayContext()}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: input,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A concise title for the task" },
            description: { type: Type.STRING, description: "Any additional details mentioned" },
            priority: { type: Type.STRING, enum: [Priority.LOW, Priority.MEDIUM, Priority.HIGH] },
            dueDate: { type: Type.STRING, description: "ISO 8601 date string or null" },
          },
          required: ["title", "priority"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AITaskParseResult;
  } catch (error) {
    console.error("Error parsing task:", error);
    // Fallback if AI fails
    return {
      title: input,
      description: "",
      priority: Priority.MEDIUM,
      dueDate: null,
    };
  }
};

export const generateSubtasks = async (taskTitle: string, taskDescription?: string): Promise<string[]> => {
  if (!apiKey) throw new Error("API Key is missing");
  
  const modelId = "gemini-3-flash-preview";
  
  const prompt = `
    Break down the following task into 3-5 actionable subtasks.
    Task: ${taskTitle}
    Details: ${taskDescription || "None"}
    Output Language: Russian (same as input context usually).
    Return only a JSON array of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as string[];
  } catch (error) {
    console.error("Error generating subtasks:", error);
    return [];
  }
};