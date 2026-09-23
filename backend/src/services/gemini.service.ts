import { GoogleGenAI } from '@google/genai';
import { config } from '../config/env';
import { ChatMessage } from '../types/ai.types';

const SYSTEM_INSTRUCTION = `You are AssetFlow AI, an intelligent assistant for an enterprise asset management system.

Your role:
Help users understand their organization's assets, inventory, assignments, maintenance, repairs, damage, warranty information, asset health predictions, risk levels, and related organizational information.

Core Directives:
1. The provided AssetFlow database context is your sole source of truth for organizational data.
2. Never invent or hallucinate:
   - assets
   - users or employees
   - serial numbers or tags
   - numbers or statistical counts
   - maintenance records or expenses
   - health scores or risk ratings
   - database information
3. If specific information is unavailable in the provided context, clearly and politely say that it is unavailable.
4. When discussing asset health and predictive metrics:
   - Clearly distinguish between hard database facts (such as physical condition, past maintenance dates, open damage reports) and analytical health/risk scores and recommendations.
5. Formatting:
   - Keep answers structured, highly readable, and professional.
   - Use markdown headers, bullet points, bold key terms, and concise tables where appropriate.
   - Avoid overwhelming text blocks.
6. Identity:
   - You are a native assistant built into AssetFlow.
   - Be helpful, polite, and efficient.`;

export class GeminiService {
  private aiClient: GoogleGenAI | null = null;
  private apiKey: string;
  private modelName: string;

  constructor() {
    this.apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || '';
    this.modelName = config.geminiModel || process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (this.apiKey) {
      try {
        this.aiClient = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.warn('GoogleGenAI SDK initialization notice:', err);
      }
    }
  }

  /**
   * Generates natural language answer using Google Gemini with structured context
   */
  public async generateResponse(
    userMessage: string,
    conversationHistory: ChatMessage[] = [],
    contextText: string = ''
  ): Promise<string> {
    if (!this.apiKey) {
      return '⚠️ Gemini API key is not configured on the server. Please set GEMINI_API_KEY in the backend environment.';
    }

    const fullSystemInstruction = `${SYSTEM_INSTRUCTION}\n\n=== CURRENT ASSETFLOW DATABASE CONTEXT ===\n${contextText}\n=== END OF DATABASE CONTEXT ===`;

    // Try Google Gen AI SDK first
    if (this.aiClient) {
      try {
        const contents: any[] = [];

        // Include recent conversation history (limit to last 6 turns)
        const recentHistory = conversationHistory.slice(-6);
        for (const turn of recentHistory) {
          contents.push({
            role: turn.role === 'user' ? 'user' : 'model',
            parts: [{ text: turn.content }],
          });
        }

        // Add current user prompt
        contents.push({
          role: 'user',
          parts: [{ text: userMessage }],
        });

        const response = await this.aiClient.models.generateContent({
          model: this.modelName,
          contents,
          config: {
            systemInstruction: fullSystemInstruction,
            temperature: 0.2, // Low temperature for high factual accuracy
          },
        });

        if (response.text) {
          return response.text.trim();
        }
      } catch (sdkError: any) {
        console.warn('SDK call failed, attempting fallback REST method:', sdkError?.message || sdkError);
      }
    }

    // Direct REST Fallback to Google Generative Language API
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

      const contents: any[] = [];
      const recentHistory = conversationHistory.slice(-6);
      for (const turn of recentHistory) {
        contents.push({
          role: turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.content }],
        });
      }
      contents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const payload = {
        systemInstruction: {
          parts: [{ text: fullSystemInstruction }],
        },
        contents,
        generationConfig: {
          temperature: 0.2,
        },
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson: any = await res.json().catch(() => ({}));
        console.error('Gemini REST API error response:', errJson);
        throw new Error(errJson?.error?.message || `Gemini API returned status ${res.status}`);
      }

      const data: any = await res.json();
      const generatedText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I couldn't generate a response based on the current AssetFlow context. Please try asking again.";

      return generatedText.trim();
    } catch (restError: any) {
      console.error('Gemini Service failure:', restError?.message || restError);
      return 'AI service is temporarily unavailable. Please try again in a moment.';
    }
  }
}

export const geminiService = new GeminiService();
