import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Laptop, Users, Wrench, AlertTriangle, FileText, ArrowRight, X } from 'lucide-react';
import { assetsApi } from '../../api/assets.api';
import { usersApi } from '../../api/users.api';
import { Asset, User } from '../../types';

import { useAuth } from '../../context/AuthContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const { isAdmin, canManageAssets } = useAuth();
  const [query, setQuery] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setAssets([]);
      setUsers([]);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setAssets([]);
      setUsers([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const promises: Promise<any>[] = [assetsApi.getAll({ search: query, limit: 5 })];
        if (isAdmin) {
          promises.push(usersApi.getAll({ search: query, limit: 5 }));
        }
        const [assetRes, userRes] = await Promise.all(promises);
        if (assetRes?.success) setAssets(assetRes.data || []);
        if (userRes?.success) setUsers(userRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, isAdmin]);

  if (!isOpen) return null;

  const quickNav = [
    { label: 'All Assets', path: '/assets', icon: Laptop },
    ...(isAdmin ? [{ label: 'Users Directory', path: '/users', icon: Users }] : []),
    ...(canManageAssets ? [{ label: 'Active Maintenance', path: '/maintenance', icon: Wrench }] : []),
    { label: 'Incident Reports', path: '/reports', icon: AlertTriangle },
    ...(canManageAssets ? [{ label: 'Analytics Dashboard', path: '/analytics', icon: FileText }] : []),
  ];

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-10 animate-scale-up">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search assets by tag/name, users, or quick jump..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent border-0 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-200">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {loading && (
            <div className="py-8 text-center text-xs text-gray-400 animate-pulse">
              Searching database...
            </div>
          )}

          {!loading && query && assets.length === 0 && users.length === 0 && (
            <div className="py-8 text-center text-xs text-gray-400">
              No matching assets or users found for "{query}"
            </div>
          )}

          {/* Matched Assets */}
          {assets.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Assets ({assets.length})
              </p>
              <div className="space-y-1">
                {assets.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => handleSelect(`/assets/${asset.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/40 group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Laptop className="w-4 h-4 text-indigo-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {asset.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {asset.assetTag} • {asset.category} • {asset.status}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Users */}
          {users.length > 0 && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Users ({users.length})
              </p>
              <div className="space-y-1">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelect(`/users`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-indigo-50 dark:hover:bg-indigo-950/40 group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-4 h-4 text-purple-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {user.email} • {user.role} • {user.department || 'No Dept'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Navigations */}
          {!query && (
            <div>
              <p className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Quick Navigation
              </p>
              <div className="space-y-1">
                {quickNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-left hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors text-gray-700 dark:text-gray-300"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
          <span>Navigate with ⌘K / Ctrl+K</span>
          <span>AssetFlow Global Search</span>
        </div>
      </div>
    </div>
  );
};
