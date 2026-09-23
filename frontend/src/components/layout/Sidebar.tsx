import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Laptop,
  Users,
  ArrowRightLeft,
  Wrench,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../common/Badge';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) => {
  const { user, logout, isAdmin, canManageAssets } = useAuth();
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Assets', path: '/assets', icon: Laptop },
    { label: 'Assignments', path: '/assignments', icon: ArrowRightLeft },
    ...(canManageAssets ? [{ label: 'Maintenance', path: '/maintenance', icon: Wrench }] : []),
    { label: 'Reports', path: '/reports', icon: AlertTriangle },
    ...(isAdmin ? [{ label: 'Users', path: '/users', icon: Users }] : []),
    ...(canManageAssets ? [{ label: 'Analytics', path: '/analytics', icon: BarChart3 }] : []),
    ...(isAdmin ? [{ label: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck }] : []),
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#111827] border-r border-slate-200/80 dark:border-slate-800 select-none">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-none">
                Asset<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
              </span>
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                Enterprise
              </span>
            </div>
          )}
        </div>

        {/* Collapse button on desktop */}
        <button
          onClick={onToggle}
          className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {!collapsed && (
          <div className="px-3 pb-2">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Navigation
            </p>
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group relative ${
                isActive
                  ? 'bg-violet-50 text-violet-700 font-semibold dark:bg-violet-950/40 dark:text-violet-300'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium'
              }`}
            >
              <Icon
                className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                  isActive
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}

              {/* Active indicator bar */}
              {isActive && (
                <span
                  className={`absolute left-0 top-1.5 bottom-1.5 w-1 bg-violet-600 rounded-r-full ${
                    collapsed ? '' : ''
                  }`}
                />
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        <div
          className={`flex items-center gap-2.5 p-1.5 rounded-xl transition-colors ${
            collapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center text-xs shrink-0 border border-indigo-200/80 dark:border-indigo-800/80">
              {user?.name?.charAt(0) || 'U'}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <div className="mt-0.5">
                  <Badge role={user?.role} size="sm" />
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={logout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed left-0 top-0 bottom-0 z-30 transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={onMobileClose} />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-modal animate-fade-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
