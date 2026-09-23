export interface PageContext {
  page?: string;
  assetId?: string | null;
  path?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'model';
  content: string;
  timestamp: string;
  sources?: string[];
  isError?: boolean;
}

export interface AIChatRequest {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'model' | 'assistant'; content: string }>;
  pageContext?: PageContext;
}

export interface AIChatResponse {
  message: string;
  sources?: string[];
  conversationId?: string;
}
