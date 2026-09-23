import React from 'react';
import { Sparkles, MessageCircle, X } from 'lucide-react';

interface AIChatButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export const AIChatButton: React.FC<AIChatButtonProps> = ({ isOpen, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Close AssetFlow AI Assistant' : 'Open AssetFlow AI Assistant'}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-600/25 border-2 border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
    >
      {isOpen ? (
        <X className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
      ) : (
        <div className="relative flex items-center justify-center">
          <Sparkles className="w-6 h-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-indigo-600 rounded-full" />
        </div>
      )}
    </button>
  );
};
