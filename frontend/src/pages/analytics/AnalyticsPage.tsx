import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../api/dashboard.api';
import { assetsApi } from '../../api/assets.api';
import { healthApi } from '../../api/health.api';
import { DashboardStats, HealthOverviewStats } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { DonutChart } from '../../components/charts/DonutChart';
import { BarChart } from '../../components/charts/BarChart';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Layers,
  Wrench,
  ShieldCheck,
  FileSpreadsheet,
  MapPin,
  Sparkles,
  AlertTriangle,
  AlertOctagon,
  Activity,
  CheckCircle2,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const { success, error } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [healthOverview, setHealthOverview] = useState<HealthOverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [statsRes, healthRes] = await Promise.allSettled([
          dashboardApi.getStats(),
          isAdmin ? healthApi.getHealthOverview() : Promise.resolve(null),
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value) {
          setStats(statsRes.value.data);
        }

        if (healthRes.status === 'fulfilled' && healthRes.value && (healthRes.value as any).success) {
          setHealthOverview((healthRes.value as any).data);
        }
      } catch (err: any) {
        error('Failed to load analytics statistics');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [error, isAdmin]);


  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const res = await assetsApi.getAll({ limit: 1000 });
      const assets = res.data;

      if (!assets.length) {
        error('No assets to export');
        return;
      }

      // Convert to CSV
      const headers = [
        'ID',
        'Name',
        'Asset Tag',
        'Serial Number',
        'Category',
        'Status',
        'Condition',
        'Location',
        'Purchase Price',
        'Purchase Date',
        'Warranty Expiry'
      ];

      const rows = assets.map((a) => [
        `"${a.id}"`,
        `"${a.name.replace(/"/g, '""')}"`,
        `"${a.assetTag}"`,
        `"${a.serialNumber || ''}"`,
        `"${a.category}"`,
        `"${a.status}"`,
        `"${a.condition || ''}"`,
        `"${a.location || ''}"`,
        `"${a.purchasePrice || 0}"`,
        `"${a.purchaseDate ? new Date(a.purchaseDate).toISOString().split('T')[0] : ''}"`,
        `"${a.warrantyExpiry ? new Date(a.warrantyExpiry).toISOString().split('T')[0] : ''}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `assetflow-inventory-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      success('Asset inventory exported as CSV successfully!');
    } catch (err: any) {
      error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const statusChartData = stats?.charts?.assetsByStatus || [];
  const categoryChartData = stats?.charts?.assetsByCategory || [];
  const locationChartData = (stats?.charts?.assetsByLocation || []).map((l) => ({
    category: l.location || 'Unknown',
    count: l.count,
  }));

  const totalAssets = stats?.summary?.totalAssets || 0;
  const assignedAssets = stats?.summary?.assignedAssets || 0;
  const utilizationRate = totalAssets > 0 ? Math.round((assignedAssets / totalAssets) * 100) : 0;
  const totalCost = Number(stats?.summary?.totalMaintenanceCost || 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Enterprise Analytics & Reports
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time portfolio valuation, lifecycle tracking, allocation breakdown & cost telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
            onClick={handleExportCSV}
            loading={exporting}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* High-level Valuation Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Managed Assets
            </p>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-28 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
              {totalAssets} Units
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Across all categories and zones</span>
          </p>
        </Card>

        <Card className="p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Maintenance Spend
            </p>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-28 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
              ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            {stats?.summary?.totalMaintenances || 0} total work orders
          </p>
        </Card>

        <Card className="p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Utilization Rate
            </p>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
              {utilizationRate}%
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            {assignedAssets} of {totalAssets} assets actively deployed
          </p>
        </Card>

        <Card className="p-4 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Asset Integrity Index
            </p>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-20 mt-2" />
          ) : (
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
              {totalAssets > 0
                ? Math.round(
                    (((totalAssets - ((stats?.summary?.damagedAssets || 0) + (stats?.summary?.lostAssets || 0))) /
                      totalAssets) *
                      100)
                  )
                : 100}%
            </p>
          )}
          <p className="text-xs text-slate-400 mt-1">
            Non-damaged / operational health rating
          </p>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Asset Status Distribution
              </h2>
              <p className="text-xs text-slate-500">Current operational lifecycle state breakdown</p>
            </div>
            <PieChart className="w-5 h-5 text-slate-400" />
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <DonutChart data={statusChartData} />
          )}
        </Card>

        {/* Category Breakdown */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Equipment by Category
              </h2>
              <p className="text-xs text-slate-500">Hardware and asset classification counts</p>
            </div>
            <Layers className="w-5 h-5 text-slate-400" />
          </div>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <BarChart data={categoryChartData} />
          )}
        </Card>
      </div>

      {/* Location / Facility Allocation */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Location & Facility Asset Distribution
            </h2>
            <p className="text-xs text-slate-500">Inventory counts across physical sites, labs, and office wings</p>
          </div>
          <MapPin className="w-5 h-5 text-slate-400" />
        </div>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <BarChart data={locationChartData} />
        )}
      </Card>

      {/* Admin-Only AI Asset Health Analytics Section */}
      {isAdmin && healthOverview && (
        <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                AI Asset Health & Risk Intelligence
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Machine learning lifecycle evaluations, risk distribution & fleet-wide health scores
              </p>
            </div>
          </div>

          {/* Health Overview KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Avg Fleet Health Score
                </span>
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
                {healthOverview.avgHealthScore} <span className="text-sm font-normal text-slate-400">/ 100</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {healthOverview.analyzedAssets} of {healthOverview.totalAssets} assets evaluated
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Healthy Assets
                </span>
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1.5">
                {healthOverview.statusCounts.HEALTHY}
              </p>
              <p className="text-xs text-slate-400 mt-1">Optimal operational state</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Maintenance Required
                </span>
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1.5">
                {healthOverview.statusCounts.MAINTENANCE_REQUIRED}
              </p>
              <p className="text-xs text-slate-400 mt-1">Service intervention recommended</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Replace Soon / Critical
                </span>
                <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                  <AlertOctagon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1.5">
                {healthOverview.statusCounts.REPLACE_SOON}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {healthOverview.riskCounts.CRITICAL + healthOverview.riskCounts.HIGH} high/critical risk units
              </p>
            </Card>
          </div>

          {/* Health Status & Risk Breakdown Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    AI Health Status Classification
                  </h3>
                  <p className="text-xs text-slate-500">Distribution across ML prediction classes</p>
                </div>
                <PieChart className="w-5 h-5 text-slate-400" />
              </div>
              <DonutChart
                data={[
                  { status: 'HEALTHY' as any, count: healthOverview.statusCounts.HEALTHY },
                  { status: 'UNDER_MAINTENANCE' as any, count: healthOverview.statusCounts.MAINTENANCE_REQUIRED },
                  { status: 'DAMAGED' as any, count: healthOverview.statusCounts.REPLACE_SOON },
                ]}
              />
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Risk Level Severity Tiers
                  </h3>
                  <p className="text-xs text-slate-500">Fleet volume across risk classifications</p>
                </div>
                <Layers className="w-5 h-5 text-slate-400" />
              </div>
              <BarChart
                data={[
                  { category: 'Low Risk', count: healthOverview.riskCounts.LOW },
                  { category: 'Medium Risk', count: healthOverview.riskCounts.MEDIUM },
                  { category: 'High Risk', count: healthOverview.riskCounts.HIGH },
                  { category: 'Critical Risk', count: healthOverview.riskCounts.CRITICAL },
                ]}
              />
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;

