import { Request, Response, NextFunction } from 'express';
import { aiContextService } from '../services/aiContext.service';
import { geminiService } from '../services/gemini.service';
import { ApiResponse } from '../utils/apiResponse';
import { AIChatRequestBody, AIChatResponseData } from '../types/ai.types';

export class AIController {
  static async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, conversationHistory = [], pageContext = {} }: AIChatRequestBody = req.body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        ApiResponse.error(res, 'A non-empty message is required.', 400);
        return;
      }

      // 1. Retrieve structured context from PostgreSQL / Prisma
      const { contextText, sources } = await aiContextService.buildContext(
        message.trim(),
        pageContext
      );

      // 2. Generate response using Google Gemini
      const aiResponse = await geminiService.generateResponse(
        message.trim(),
        conversationHistory,
        contextText
      );

      const responseData: AIChatResponseData = {
        message: aiResponse,
        sources,
        conversationId: `conv-${Date.now()}`,
      };

      ApiResponse.success(res, responseData, 'AI response generated successfully', 200);
    } catch (error) {
      next(error);
    }
  }
}
