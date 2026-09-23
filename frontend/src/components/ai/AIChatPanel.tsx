import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, RotateCcw, Bot, AlertCircle } from 'lucide-react';
import { AIChatMessage } from './AIChatMessage';
import { AIChatInput } from './AIChatInput';
import { AISuggestions } from './AISuggestions';
import { ChatMessage, PageContext } from '../../types/ai';
import { aiApi } from '../../api/ai.api';

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  pageContext: PageContext;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({ isOpen, onClose, pageContext }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  // Handle sending a new message
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      // Prepare conversation history for backend context
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await aiApi.chat({
        message: text,
        conversationHistory: historyPayload,
        pageContext,
      });

      if (res.success && res.data) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: res.data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          sources: res.data.sources,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(res.message || 'Failed to get AI response');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: err.message || 'AI service is temporarily unavailable. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[410px] h-[580px] max-h-[calc(100vh-120px)] bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[20px] shadow-2xl flex flex-col overflow-hidden animate-fade-in transition-all"
      style={{
        boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* Header */}
      <div className="px-4 py-3.5 bg-slate-50/80 dark:bg-slate-850 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                AssetFlow AI
              </h3>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Your intelligent asset management assistant
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearChat}
              title="Clear conversation"
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            title="Close assistant"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/30 dark:bg-slate-950/30">
        {messages.length === 0 ? (
          /* Welcome state */
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                <Bot className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Hi! I'm your AssetFlow AI Assistant.</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                I can help you analyze organizational inventory, track maintenance schedules, check active assignments, and assess predictive asset health metrics in real-time.
              </p>
            </div>

            {/* Quick Starter Suggestions */}
            <AISuggestions onSelect={handleSendMessage} pageContext={pageContext} />
          </div>
        ) : (
          messages.map((msg) => <AIChatMessage key={msg.id} message={msg} />)
        )}

        {/* Loading / Thinking indicator */}
        {loading && (
          <div className="flex gap-2.5 items-start animate-fade-in">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl rounded-bl-xs shadow-xs flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" />
              </div>
              <span className="text-[11px] font-medium">Analyzing AssetFlow data...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <AIChatInput onSend={handleSendMessage} loading={loading} />
    </div>
  );
};
