import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Wrench,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { CommandPalette } from './CommandPalette';

interface NavbarProps {
  onMobileMenuToggle: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenuToggle }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Derive breadcrumb from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/assets/')) return 'Asset Details';
    if (path.startsWith('/assets')) return 'Assets Inventory';
    if (path.startsWith('/assignments')) return 'Asset Assignments';
    if (path.startsWith('/maintenance')) return 'Maintenance & Repairs';
    if (path.startsWith('/reports')) return 'Incident Reports';
    if (path.startsWith('/users')) return 'Users Directory';
    if (path.startsWith('/analytics')) return 'Analytics & Reports';
    if (path.startsWith('/audit-logs')) return 'System Audit Trail';
    return 'AssetFlow';
  };

  const sampleNotifications = [
    {
      id: '1',
      title: 'New Incident Report',
      description: 'Elena Rostova filed a damage report for Panasonic Toughbook.',
      time: '15m ago',
      icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
    },
    {
      id: '2',
      title: 'Maintenance In Progress',
      description: 'HP LaserJet Enterprise MFP service underway by technician.',
      time: '1h ago',
      icon: <Wrench className="w-4 h-4 text-amber-500" />,
    },
    {
      id: '3',
      title: 'Asset Checkout Completed',
      description: 'MacBook Pro 16" assigned to Devon Patel.',
      time: '3h ago',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-20 h-16 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between transition-colors">
        {/* Left: Mobile Toggle & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:block">
              Overview
            </span>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right: Search Command Bar, Theme Toggle, Notifications, User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Command Bar Button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 text-xs transition-all shadow-card group cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 group-hover:text-indigo-600 transition-colors" />
            <span className="hidden md:inline font-normal text-slate-500">Quick search...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 shadow-xs">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>

            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-dropdown z-20 overflow-hidden animate-fade-in">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      Notifications
                    </span>
                    <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-100 dark:border-indigo-900/40">3 Unread</span>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto">
                    {sampleNotifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-3 transition-colors cursor-pointer"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                          {n.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-white">
                            {n.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                            {n.description}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 inline-block">
                            {n.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 shadow-dropdown z-20 py-2 animate-fade-in">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <div className="px-4 py-1.5 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                      <span>Role</span>
                      <span className="font-semibold text-indigo-600 capitalize bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md">{user?.role}</span>
                    </div>
                  </div>
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Command Palette Keyboard Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </>
  );
};
