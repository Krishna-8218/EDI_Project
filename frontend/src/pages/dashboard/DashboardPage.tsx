import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Laptop,
  CheckCircle2,
  ArrowRightLeft,
  Wrench,
  AlertTriangle,
  Flame,
  Plus,
  ArrowUpRight,
  Clock,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { dashboardApi } from '../../api/dashboard.api';
import { DashboardStats } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { CardSkeleton } from '../../components/common/Skeleton';
import { DonutChart } from '../../components/charts/DonutChart';
import { BarChart } from '../../components/charts/BarChart';
import { AssetModal } from '../assets/AssetModal';
import { AssignmentModal } from '../assignments/AssignmentModal';
import { ReportModal } from '../reports/ReportModal';

export const DashboardPage: React.FC = () => {
  const { user, canManageAssets, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick action modals
  const [addAssetModalOpen, setAddAssetModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await dashboardApi.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 w-80 animate-pulse bg-gray-200 dark:bg-gray-800 rounded-2xl" />
        <CardSkeleton count={4} />
      </div>
    );
  }

  const summary = stats?.summary;

  const kpiCards = [
    {
      title: 'Total Assets',
      value: summary?.totalAssets || 0,
      subtext: 'Catalogued inventory',
      icon: Laptop,
      iconStyle: 'bg-violet-50 text-violet-600 border-violet-100 dark:bg-violet-950/50 dark:border-violet-800/60 dark:text-violet-300',
    },
    {
      title: 'Available',
      value: summary?.availableAssets || 0,
      subtext: 'Ready for deployment',
      icon: CheckCircle2,
      iconStyle: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/50 dark:border-emerald-800/60 dark:text-emerald-300',
    },
    {
      title: 'Assigned',
      value: summary?.assignedAssets || 0,
      subtext: 'In active employee use',
      icon: ArrowRightLeft,
      iconStyle: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/50 dark:border-blue-800/60 dark:text-blue-300',
    },
    {
      title: 'Under Maintenance',
      value: summary?.maintenanceAssets || 0,
      subtext: 'Active service tickets',
      icon: Wrench,
      iconStyle: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/50 dark:border-amber-800/60 dark:text-amber-300',
    },
    {
      title: 'Damaged / Lost',
      value: (summary?.damagedAssets || 0) + (summary?.lostAssets || 0),
      subtext: 'Requires review / write-off',
      icon: AlertTriangle,
      iconStyle: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/50 dark:border-rose-800/60 dark:text-rose-300',
    },
    ...(canManageAssets
      ? [
          {
            title: 'Maintenance Spend',
            value: `$${Number(summary?.totalMaintenanceCost || 0).toLocaleString()}`,
            subtext: 'YTD servicing total',
            icon: DollarSign,
            iconStyle:
              'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-950/50 dark:border-indigo-800/60 dark:text-indigo-300',
          },
        ]
      : []),
  ];

  const formatActivityTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="space-y-6 sm:space-y-7">
      {/* Header with Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Dashboard Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome back, <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.name || 'User'}</span>. Live physical asset telemetry and inventory health.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isAdmin && (
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setAddAssetModalOpen(true)}
            >
              Add Asset
            </Button>
          )}

          {canManageAssets && (
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />}
              onClick={() => setAssignModalOpen(true)}
            >
              Assign
            </Button>
          )}

          {!isAdmin && (
            <Button
              variant="secondary"
              size="sm"
              icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
              onClick={() => setReportModalOpen(true)}
            >
              Report Issue
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${canManageAssets ? 'xl:grid-cols-6' : 'xl:grid-cols-5'} gap-3.5 sm:gap-4`}>
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} hover className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-xl border ${kpi.iconStyle} shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                  {kpi.subtext}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Main Charts & Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Donut */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Asset Status Distribution"
            subtitle="Operational lifecycle breakdown"
          />
          <DonutChart data={stats?.charts?.assetsByStatus || []} />
        </Card>

        {/* Category Breakdown Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Assets by Category"
            subtitle="Equipment quantity across classifications"
            action={
              <button
                onClick={() => navigate('/assets')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                View Inventory <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            }
          />
          <BarChart data={stats?.charts?.assetsByCategory || []} />
        </Card>
      </div>

      {/* Recent Activity Timeline - Visible to Admin Only */}
      {isAdmin && (
        <Card>
          <CardHeader
            title="Recent System Activity"
            subtitle="Audit log of checkouts, servicing, reports, and asset modifications"
            action={
              <button
                onClick={() => navigate('/audit-logs')}
                className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                View Full Audit Trail <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            }
          />

          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recentActivities.slice(0, 6).map((activity) => (
                <div
                  key={activity.id}
                  className="py-3 flex items-start justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white leading-snug">
                        {activity.description}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        By <span className="font-semibold text-slate-600 dark:text-slate-300">{activity.user?.name || 'System / Admin'}</span> • Action:{' '}
                        <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40">
                          {activity.action}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    <span>{formatActivityTime(activity.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No system activity recorded yet.
            </div>
          )}
        </Card>
      )}

      {/* Modals triggered from quick action buttons */}
      {addAssetModalOpen && (
        <AssetModal
          isOpen={addAssetModalOpen}
          onClose={() => setAddAssetModalOpen(false)}
          onSuccess={() => {
            setAddAssetModalOpen(false);
            fetchStats();
          }}
        />
      )}

      {assignModalOpen && (
        <AssignmentModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onSuccess={() => {
            setAssignModalOpen(false);
            fetchStats();
          }}
        />
      )}

      {reportModalOpen && (
        <ReportModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          onSuccess={() => {
            setReportModalOpen(false);
            fetchStats();
          }}
        />
      )}
    </div>
  );
};
