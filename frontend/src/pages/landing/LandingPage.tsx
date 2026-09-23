import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Activity,
  Sparkles,
  CheckCircle2,
  Lock,
  ChevronRight,
  Database,
  BarChart3,
  Bot,
} from 'lucide-react';
import { AssetEcosystem3D } from '../../components/3d/AssetEcosystem3D';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCtaClick = () => {
    if (user) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500/20 selection:text-indigo-600">
      {/* Top Enterprise Navigation */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-[#0B0F19]/80 border-b border-slate-200/70 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 duration-200">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              Asset<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </span>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-600 dark:text-slate-300">
            <a
              href="#ecosystem"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Ecosystem
            </a>
            <a
              href="#intelligence"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Asset Health & AI
            </a>
            <a
              href="#compliance"
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Enterprise Security
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
              >
                Go to Workspace
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
                >
                  Access Platform
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-200/60 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Value Proposition & CTAs */}
              <div className="lg:col-span-6 space-y-6 z-10">
                {/* Enterprise Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>ENTERPRISE ASSET MANAGEMENT</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                  Manage Every Asset.{' '}
                  <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent block mt-1">
                    Understand Every Detail.
                  </span>
                </h1>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  AssetFlow brings inventory, assignments, maintenance, and
                  intelligent asset health into one connected platform designed
                  for modern enterprises.
                </p>

                {/* Dual CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCtaClick}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <a
                    href="#ecosystem"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors shadow-xs"
                  >
                    <span>Explore Platform</span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </a>
                </div>

                {/* Human-Designed Proof Points */}
                <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/80 dark:border-slate-800/80 max-w-lg">
                  <div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      100%
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Custody Tracking
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
                      Zero
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Lost Hardware
                    </p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                      99.8%
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Operational Health
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive 3D Asset Ecosystem */}
              <div className="lg:col-span-6 relative flex items-center justify-center">
                <div className="relative w-full max-w-lg lg:max-w-none h-[420px] sm:h-[480px] lg:h-[540px] rounded-3xl bg-gradient-to-b from-indigo-50/40 via-white/80 to-violet-50/40 dark:from-slate-900/60 dark:via-slate-950 dark:to-indigo-950/40 border border-slate-200/70 dark:border-slate-800 p-2 shadow-xl shadow-indigo-500/5">
                  <AssetEcosystem3D className="w-full h-full rounded-2xl" />

                  {/* Floating Telemetry Badge Overlay */}
                  <div className="absolute bottom-5 left-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-xl px-3.5 py-2 shadow-md flex items-center gap-2.5 pointer-events-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-900 dark:text-white">
                        Connected Telemetry Active
                      </p>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400">
                        Interactive 3D Ecosystem
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ECOSYSTEM CAPABILITIES SECTION */}
        <section id="ecosystem" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Connected Infrastructure
            </span>
            <h2 className="text-3xl sm:text-3.5xl font-bold tracking-tight text-slate-900 dark:text-white">
              Built for Complete Lifecycle Transparency
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Replace fragmented spreadsheets and manual logs with an interconnected,
              intelligent enterprise asset management suite.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: Asset Lifecycle */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-4">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Comprehensive Inventory
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Centralized registry for laptops, workstations, monitors, servers, and
                networking devices with serial numbers, warranty tracking, and purchase telemetry.
              </p>
            </div>

            {/* Card 2: Chain of Custody */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-4">
              <div className="w-11 h-11 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Verifiable Chain of Custody
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Assign and transfer hardware to organizational staff with digital return verification,
                due date scheduling, and automated overdue alerts.
              </p>
            </div>

            {/* Card 3: Maintenance & Work Orders */}
            <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 space-y-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Preventive Maintenance
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Schedule routine servicing, track repair costs, assign field technicians,
                and maintain complete historical service records.
              </p>
            </div>
          </div>
        </section>

        {/* INTELLIGENCE & AI SECTION */}
        <section
          id="intelligence"
          className="py-16 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6 space-y-5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100/80 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-xs font-semibold">
                  <Bot className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                  AssetFlow AI & Telemetry Engine
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Predictive Health Scoring & Real-Time AI Assistance
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                  Understand asset depreciation, calculate risk scores (0–100) before hardware fails,
                  and interact with our database-aware AI Assistant to query inventories using natural language.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <strong>Asset Health Predictions:</strong> Multi-factor risk analysis evaluating maintenance gaps, age, and open incident tickets.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-0.5 shrink-0" />
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                      <strong>Gemini-Powered Floating Chatbot:</strong> Ask natural questions about warranty, assignments, and work orders from any workspace screen.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sample Telemetry Card */}
              <div className="lg:col-span-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          AST-PRN-013 • HP LaserJet MFP
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Main Copy & Print Hub 1st Floor
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/60">
                      Score: 45 / 100 • HIGH RISK
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    AI Assistant Recommendation: Fuser Roller replacement currently in progress. Baseline inspection recommended upon maintenance completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* COMPLIANCE & SECURITY SECTION */}
        <section id="compliance" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-800/60 border border-indigo-700/60 text-indigo-200 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" />
                Enterprise Security Guardrails
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Ready to elevate your asset operations?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Role-based access control (Admin, Manager, Employee), tamper-evident audit logging,
                and PostgreSQL reliability.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCtaClick}
              className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-white text-indigo-950 hover:bg-slate-100 shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 shrink-0 cursor-pointer"
            >
              Enter Workspace Now
            </button>
          </div>
        </section>
      </main>

      {/* Enterprise Footer */}
      <footer className="py-8 bg-white dark:bg-[#0B0F19] border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">
              AssetFlow
            </span>
            <span className="text-slate-400">
              — Enterprise Asset Management Platform
            </span>
          </div>

          <p>© {new Date().getFullYear()} AssetFlow Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
