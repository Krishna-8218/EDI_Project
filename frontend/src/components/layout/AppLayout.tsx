import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { AIChatButton, AIChatPanel } from '../ai';
import { PageContext } from '../../types/ai';

export const AppLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const location = useLocation();

  // Dynamically determine current active page and assetId context
  const getPageContext = (): PageContext => {
    const path = location.pathname;
    let page = 'dashboard';
    let assetId: string | null = null;

    if (path.startsWith('/assets/')) {
      page = 'asset-details';
      const parts = path.split('/');
      assetId = parts[2] || null;
    } else if (path.startsWith('/assets')) {
      page = 'assets';
    } else if (path.startsWith('/assignments')) {
      page = 'assignments';
    } else if (path.startsWith('/maintenance')) {
      page = 'maintenance';
    } else if (path.startsWith('/reports')) {
      page = 'reports';
    } else if (path.startsWith('/users')) {
      page = 'users';
    } else if (path.startsWith('/analytics')) {
      page = 'analytics';
    } else if (path.startsWith('/audit-logs') || path.startsWith('/audit')) {
      page = 'audit-logs';
    }

    return { page, assetId, path };
  };

  const pageContext = getPageContext();

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#0B0F19] text-slate-800 dark:text-slate-100 flex relative">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          collapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        <Navbar onMobileMenuToggle={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Global Floating AI Assistant - Overlays above all pages without shifting layout */}
      <AIChatPanel
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        pageContext={pageContext}
      />
      <AIChatButton
        isOpen={aiChatOpen}
        onClick={() => setAiChatOpen(!aiChatOpen)}
      />
    </div>
  );
};
