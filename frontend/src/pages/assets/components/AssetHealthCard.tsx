import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Wrench,
  Calendar,
  ArrowRightLeft,
  Activity,
  History,
  TrendingUp,
  Info,
  Layers,
  ChevronRight,
  Shield,
  CalendarCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { healthApi } from '../../../api/health.api';
import { AssetHealthPrediction, HealthFactor, HealthRecommendation } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { Card, CardHeader } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';

interface AssetHealthCardProps {
  assetId: string;
}

export const AssetHealthCard: React.FC<AssetHealthCardProps> = ({ assetId }) => {
  const { success, error: toastError } = useToast();
  const [prediction, setPrediction] = useState<AssetHealthPrediction | null>(null);
  const [history, setHistory] = useState<AssetHealthPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);
  const [predictStep, setPredictStep] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const [healthRes, historyRes] = await Promise.all([
        healthApi.getAssetHealth(assetId),
        healthApi.getAssetHealthHistory(assetId),
      ]);

      if (healthRes.success) {
        setPrediction(healthRes.data);
      }
      if (historyRes.success && historyRes.data) {
        setHistory(historyRes.data);
      }
    } catch (err: any) {
      console.error('Failed to load asset health data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (assetId) {
      loadData();
    }
  }, [assetId]);

  const handleRunPrediction = async () => {
    try {
      setPredicting(true);
      setPredictStep(1);

      // Visual step simulation for polished enterprise UX
      const step1Timer = setTimeout(() => setPredictStep(2), 500);
      const step2Timer = setTimeout(() => setPredictStep(3), 1100);
      const step3Timer = setTimeout(() => setPredictStep(4), 1700);

      const res = await healthApi.runAssetHealthPrediction(assetId);

      clearTimeout(step1Timer);
      clearTimeout(step2Timer);
      clearTimeout(step3Timer);
      setPredictStep(4);

      if (res.success && res.data) {
        setPrediction(res.data);
        // Refresh history to include the new prediction point
        const historyRes = await healthApi.getAssetHealthHistory(assetId);
        if (historyRes.success && historyRes.data) {
          setHistory(historyRes.data);
        }
        success('AI Health & Risk prediction completed');
      }
    } catch (err: any) {
      toastError(err.message || 'AI Health Prediction service is temporarily unavailable. Please try again.');
    } finally {
      setPredicting(false);
      setPredictStep(0);
    }
  };

  // Helper for rendering icons dynamically
  const renderFactorIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wrench':
        return <Wrench className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'Clock':
        return <Clock className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'AlertOctagon':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
      case 'Calendar':
        return <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
      case 'CalendarCheck':
        return <CalendarCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'ArrowRightLeft':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-blue-500 shrink-0" />;
      case 'History':
        return <History className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
      case 'Sparkles':
        return <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/50',
          text: 'text-emerald-700 dark:text-emerald-400',
          border: 'border-emerald-200 dark:border-emerald-800',
          stroke: '#10b981',
          gradient: 'from-emerald-500 to-teal-600',
          label: 'Healthy',
        };
      case 'MAINTENANCE_REQUIRED':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/50',
          text: 'text-amber-700 dark:text-amber-400',
          border: 'border-amber-200 dark:border-amber-800',
          stroke: '#f59e0b',
          gradient: 'from-amber-500 to-orange-600',
          label: 'Maintenance Required',
        };
      case 'REPLACE_SOON':
      default:
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/50',
          text: 'text-rose-700 dark:text-rose-400',
          border: 'border-rose-200 dark:border-rose-800',
          stroke: '#ef4444',
          gradient: 'from-rose-500 to-red-600',
          label: 'Replace Soon',
        };
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 border-orange-300';
      case 'CRITICAL':
      default:
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300';
    }
  };

  const getImpactBadge = (impact: string) => {
    switch (impact) {
      case 'POSITIVE':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/50';
      case 'NEGATIVE':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/50';
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/50';
      case 'NEUTRAL':
      default:
        return 'bg-slate-50 text-slate-600 dark:bg-slate-900/40 dark:text-slate-400 border-slate-200/60 dark:border-slate-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300 border-orange-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'LOW':
      default:
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 animate-pulse" />
          <div className="h-5 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="mt-6 space-y-4">
          <div className="h-32 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
          <div className="h-24 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
        </div>
      </Card>
    );
  }

  // Initial State (No analysis yet)
  if (!prediction && !predicting) {
    return (
      <Card className="overflow-hidden border border-indigo-100 dark:border-indigo-950/60 shadow-sm">
        <div className="p-6 sm:p-7 text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              AI Asset Health & Risk
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              No prediction available yet.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Analyze this asset using its lifecycle, maintenance and usage history.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="gradient"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={handleRunPrediction}
              className="shadow-sm"
            >
              Run AI Prediction
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Loading / Stepwise State
  if (predicting) {
    return (
      <Card className="overflow-hidden border border-indigo-100 dark:border-indigo-950/60 shadow-sm">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Analyzing Asset...
                </h3>
                <p className="text-xs text-slate-400">Evaluating telemetry against ML model</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 animate-pulse">
              Processing...
            </span>
          </div>

          {/* Stepper animation */}
          <div className="space-y-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            {[
              { step: 1, label: 'Collecting asset information' },
              { step: 2, label: 'Analyzing maintenance history' },
              { step: 3, label: 'Evaluating usage and damage patterns' },
              { step: 4, label: 'Generating health prediction' },
            ].map((item) => {
              const isDone = predictStep > item.step;
              const isCurrent = predictStep === item.step;
              return (
                <div key={item.step} className="flex items-center gap-3 text-xs">
                  {isDone ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    </div>
                  )}
                  <span
                    className={`font-medium ${
                      isDone
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : isCurrent
                        ? 'text-indigo-600 dark:text-indigo-300 font-semibold'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }

  if (!prediction) return null;

  const statusConfig = getStatusColor(prediction.status);
  const probabilities = prediction.probabilities || {
    HEALTHY: 0,
    MAINTENANCE_REQUIRED: 0,
    REPLACE_SOON: 0,
  };

  // Radial Score SVG calculation
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (prediction.healthScore / 100) * circumference;

  // Chart data formatting
  const chartData = history.map((item) => ({
    date: new Date(item.predictedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    }),
    score: item.healthScore,
    status: item.status,
  }));

  const lastAnalyzedDate = new Date(prediction.predictedAt).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 sm:p-6 pb-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                AI Asset Health & Risk Prediction
              </h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                v{prediction.modelVersion || '1.0'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Probabilistic health evaluation based on lifecycle telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={handleRunPrediction}
          >
            Run Prediction Again
          </Button>
        </div>
      </div>

      <div className="p-5 sm:p-6 pt-0 space-y-6">
        {/* Top Section: Health Score Radial Visualizer & Probabilities */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-900/30 dark:to-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
          {/* Radial Gauge Left (5 Cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-3 text-center">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
                {/* Background Ring */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  className="stroke-slate-200 dark:stroke-slate-800"
                  strokeWidth="10"
                  fill="transparent"
                />
                {/* Score Progress Ring */}
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  stroke={statusConfig.stroke}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Centered Score */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {prediction.healthScore}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">
                  out of 100
                </span>
              </div>
            </div>

            {/* Badges */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
              >
                {statusConfig.label}
              </span>

              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getRiskColor(
                  prediction.riskLevel
                )}`}
              >
                {prediction.riskLevel} Risk
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-2">
              Last analyzed: <span className="text-slate-600 dark:text-slate-300 font-medium">{lastAnalyzedDate}</span>
            </p>
          </div>

          {/* Probabilities Breakdown Right (7 Cols) */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-4 border-t md:border-t-0 md:border-l border-slate-200/80 dark:border-slate-800/80 pt-4 md:pt-0 md:pl-6">
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Predicted Class Probabilities
              </h4>
              <p className="text-[11px] text-slate-400">
                Machine learning classification distribution across lifecycle states
              </p>
            </div>

            <div className="space-y-3">
              {/* Healthy Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    HEALTHY
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {(probabilities.HEALTHY * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(2, probabilities.HEALTHY * 100)}%` }}
                  />
                </div>
              </div>

              {/* Maintenance Required Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    MAINTENANCE REQUIRED
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {(probabilities.MAINTENANCE_REQUIRED * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(2, probabilities.MAINTENANCE_REQUIRED * 100)}%` }}
                  />
                </div>
              </div>

              {/* Replace Soon Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    REPLACE SOON
                  </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {(probabilities.REPLACE_SOON * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all duration-700"
                    style={{ width: `${Math.max(2, probabilities.REPLACE_SOON * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/40 text-[11px] text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>
                Calculated via weighted probability scoring:{' '}
                <code className="font-mono font-semibold">P(H)×100 + P(M)×60 + P(R)×20</code>
              </span>
            </div>
          </div>
        </div>

        {/* Middle Section: Contributing Factors & AI Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contributing Factors */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                Contributing Factors
              </h4>
              <span className="text-[11px] text-slate-400">
                {prediction.factors?.length || 0} telemetry points
              </span>
            </div>

            <div className="space-y-2">
              {prediction.factors && prediction.factors.length > 0 ? (
                prediction.factors.map((factor, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {renderFactorIcon(factor.icon)}
                      <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                        {factor.label}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 ${getImpactBadge(
                        factor.impact
                      )}`}
                    >
                      {factor.impact}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No specific anomaly factors identified.
                </p>
              )}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                AI Recommendations
              </h4>
              <span className="text-[11px] text-slate-400">Deterministic decision rules</span>
            </div>

            <div className="space-y-2.5">
              {prediction.recommendations && prediction.recommendations.length > 0 ? (
                prediction.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        {rec.title}
                      </p>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border shrink-0 ${getPriorityBadge(
                          rec.priority
                        )}`}
                      >
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-5 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No actions required at this time.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Section: Health History Chart */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Health Trajectory & History
              </h4>
              <p className="text-[11px] text-slate-400">
                Chronological asset health score progression across predictions
              </p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              {history.length} Analysis Point(s)
            </span>
          </div>

          {chartData.length > 0 ? (
            <div className="w-full h-52 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl p-3 border border-slate-100 dark:border-slate-800/60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="healthScoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    ticks={[0, 20, 40, 60, 80, 100]}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white text-xs py-2 px-3 rounded-lg shadow-xl border border-slate-700 backdrop-blur-md space-y-1">
                            <p className="text-[10px] text-slate-400 font-semibold">{d.date}</p>
                            <p className="text-white font-bold text-sm">
                              Health Score: <span className="text-indigo-400">{d.score} / 100</span>
                            </p>
                            <p className="text-[10px] uppercase font-semibold text-slate-300">
                              Status: {d.status}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#healthScoreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              Historical chart will appear after multiple evaluations.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AssetHealthCard;
