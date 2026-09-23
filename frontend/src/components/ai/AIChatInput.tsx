import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface AIChatInputProps {
  onSend: (message: string) => void;
  loading: boolean;
  placeholder?: string;
}

export const AIChatInput: React.FC<AIChatInputProps> = ({
  onSend,
  loading,
  placeholder = 'Ask AssetFlow AI anything about your assets...',
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || loading) return;
    onSend(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
      <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl p-1.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={loading}
          className="w-full px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 bg-transparent placeholder-slate-400 focus:outline-none resize-none max-h-28 leading-relaxed"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim() || loading}
          className={`p-2 rounded-lg text-white transition-all shrink-0 cursor-pointer ${
            !text.trim() || loading
              ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed opacity-60'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-xs active:scale-95'
          }`}
          aria-label="Send message"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
      <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-slate-400">
        <span>Press <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[9px]">Enter</kbd> to send, <kbd className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-[9px]">Shift+Enter</kbd> for newline</span>
      </div>
    </div>
  );
};
