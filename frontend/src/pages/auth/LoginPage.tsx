import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  Layers,
  ArrowRight,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { AssetEcosystem3D } from '../../components/3d/AssetEcosystem3D';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both work email and password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      success('Welcome back to AssetFlow!');
      navigate('/');
    } catch (err: any) {
      error(err.message || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#F8F9FD] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100">
      {/* Left Column: 3D Asset Ecosystem & Brand Message */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-indigo-50/70 via-slate-50 to-violet-50/70 dark:from-[#0F172A] dark:via-[#111827] dark:to-[#1E1B4B] p-10 flex-col justify-between border-r border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between relative z-20">
          <Link
            to="/landing"
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform duration-150">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
              Asset<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
            </span>
          </Link>

          <Link
            to="/landing"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs border border-slate-200/80 dark:border-slate-800 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </Link>
        </div>

        {/* Center: 3D Canvas with Soft Typography Overlay */}
        <div className="relative z-10 my-auto py-4 flex flex-col items-center text-center">
          <div className="w-full h-[360px] max-w-lg mb-4">
            <AssetEcosystem3D className="w-full h-full" />
          </div>

          <div className="max-w-md space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-100/70 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800 text-violet-700 dark:text-violet-300 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-violet-600 dark:text-violet-400" />
              Connected Asset Intelligence
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Organize, Track & Predict
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time telemetry, predictive maintenance scoring, and Gemini AI assistance.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-20 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
          <span>Enterprise Secure Architecture</span>
          <span>© {new Date().getFullYear()} AssetFlow</span>
        </div>
      </div>

      {/* Right Column: Clean Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200/90 dark:border-slate-800 rounded-2xl p-7 sm:p-9 shadow-card space-y-7 animate-fade-in">
          {/* Header Mobile Brand & Title */}
          <div>
            <div className="lg:hidden flex items-center justify-between mb-5">
              <Link to="/landing" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="font-bold text-lg text-slate-900 dark:text-white">
                  Asset<span className="text-indigo-600">Flow</span>
                </span>
              </Link>

              <Link
                to="/landing"
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400"
              >
                Overview
              </Link>
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Sign in to your account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter your organizational credentials to access the workspace.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@assetflow.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    error('Please contact your system administrator to reset credentials.');
                  }}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <Button
              type="submit"
              variant="gradient"
              loading={loading}
              className="w-full py-2.5 font-semibold text-sm shadow-xs"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to AssetFlow
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
