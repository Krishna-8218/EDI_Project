import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shadow-xl">
          <Compass className="w-12 h-12 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            404
          </h1>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            Page Not Found
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            The resource, asset, or destination you are looking for does not exist or has been relocated.
          </p>
        </div>

        <div className="pt-2">
          <Link to="/">
            <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />}>
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
