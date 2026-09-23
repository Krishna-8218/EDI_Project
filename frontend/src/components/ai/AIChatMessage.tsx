import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, User, Copy, Check, AlertCircle } from 'lucide-react';
import { ChatMessage } from '../../types/ai';

interface AIChatMessageProps {
  message: ChatMessage;
}

export const AIChatMessage: React.FC<AIChatMessageProps> = ({ message }) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in group`}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
          <Sparkles className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Message Bubble */}
      <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-3.5 text-xs leading-relaxed transition-all ${
            isUser
              ? 'bg-indigo-600 text-white rounded-2xl rounded-br-xs shadow-xs font-medium'
              : message.isError
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 rounded-2xl rounded-bl-xs'
              : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 rounded-2xl rounded-bl-xs shadow-xs'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="markdown-ai space-y-2 text-xs">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>,
                  strong: ({ children }) => (
                    <strong className="font-bold text-slate-900 dark:text-white">{children}</strong>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-4 space-y-1 my-1.5 text-slate-700 dark:text-slate-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-4 space-y-1 my-1.5 text-slate-700 dark:text-slate-300">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  h1: ({ children }) => (
                    <h1 className="text-sm font-bold text-slate-900 dark:text-white mt-2 mb-1">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xs font-bold text-slate-900 dark:text-white mt-2 mb-1 uppercase tracking-wider">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5 mb-1">{children}</h3>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <table className="min-w-full text-left text-[11px] divide-y divide-slate-200 dark:divide-slate-800">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-2.5 py-1.5 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                      {children}
                    </td>
                  ),
                  code: ({ children }) => (
                    <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] rounded">
                      {children}
                    </code>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer info & copy button */}
        <div
          className={`flex items-center gap-2 px-1 text-[10px] text-slate-400 ${
            isUser ? 'justify-end' : 'justify-between'
          }`}
        >
          <span>{message.timestamp}</span>

          {!isUser && !message.isError && (
            <button
              type="button"
              onClick={handleCopy}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              title="Copy message"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 text-xs font-bold shadow-xs mt-0.5">
          <User className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
};
