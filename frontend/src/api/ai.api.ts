import api from './client';
import { AIChatRequest, AIChatResponse } from '../types/ai';

export const aiApi = {
  chat: (payload: AIChatRequest) =>
    api.post<AIChatResponse>('/ai/chat', payload),
};
