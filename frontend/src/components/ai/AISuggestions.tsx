import React from 'react';
import { Sparkles, Wrench, AlertTriangle, Layers, Laptop, ShieldCheck } from 'lucide-react';

interface AISuggestionsProps {
  onSelect: (prompt: string) => void;
  pageContext?: { page?: string; assetId?: string | null };
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({ onSelect, pageContext }) => {
  const isAssetDetails = pageContext?.page === 'asset-details' && !!pageContext.assetId;

  const defaultSuggestions = [
    {
      icon: <Wrench className="w-3.5 h-3.5 text-amber-500" />,
      text: 'Which assets need maintenance?',
    },
    {
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />,
      text: 'Show high-risk assets',
    },
    {
      icon: <Layers className="w-3.5 h-3.5 text-indigo-500" />,
      text: 'How many assets are assigned?',
    },
    {
      icon: <Laptop className="w-3.5 h-3.5 text-blue-500" />,
      text: 'Which laptops are available?',
    },
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />,
      text: 'Give me an inventory summary',
    },
  ];

  const assetDetailSuggestions = [
    {
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />,
      text: 'What is the health and risk level of this asset?',
    },
    {
      icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />,
      text: 'Why is its health score affected?',
    },
    {
      icon: <Wrench className="w-3.5 h-3.5 text-amber-500" />,
      text: 'What are the recommended maintenance actions for this asset?',
    },
    {
      icon: <Layers className="w-3.5 h-3.5 text-indigo-500" />,
      text: 'Who has custody of this asset?',
    },
  ];

  const suggestions = isAssetDetails ? assetDetailSuggestions : defaultSuggestions;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
        <Sparkles className="w-3 h-3 text-indigo-500" />
        <span>Suggested Queries</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {suggestions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelect(item.text)}
            className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800/60 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 transition-colors shrink-0">
              {item.icon}
            </div>
            <span className="flex-1 truncate">{item.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
