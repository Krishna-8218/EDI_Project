export interface PageContext {
  page?: string;
  assetId?: string | null;
  path?: string;
}

export interface ChatMessage {
  role: 'user' | 'model' | 'assistant';
  content: string;
}

export interface AIChatRequestBody {
  message: string;
  conversationHistory?: ChatMessage[];
  pageContext?: PageContext;
}

export interface AIChatResponseData {
  message: string;
  sources?: string[];
  conversationId?: string;
}
