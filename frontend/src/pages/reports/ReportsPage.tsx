import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Flame,
  Search,
  CheckCircle2,
  Clock,
  Laptop,
  User as UserIcon,
  ShieldAlert,
  Edit2,
} from 'lucide-react';
import { reportsApi } from '../../api/reports.api';
import { AssetReport, ReportStatus, ReportType, PaginationMeta } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { ReportModal } from './ReportModal';

export const ReportsPage: React.FC = () => {
  const { canManageAssets, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [reports, setReports] = useState<AssetReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ReportStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<ReportType | ''>('');
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reportToResolve, setReportToResolve] = useState<AssetReport | null>(null);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const res = await reportsApi.getAll({
        page,
        limit: 10,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
      });
      if (res.success && res.data) {
        setReports(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to load incident reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, [statusFilter, typeFilter]);

  const pendingCount = reports.filter((r) => r.status === 'PENDING').length;
  const underReviewCount = reports.filter((r) => r.status === 'UNDER_REVIEW').length;
  const resolvedCount = reports.filter((r) => r.status === 'RESOLVED').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Incident & Damage Reports
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAdmin || canManageAssets
              ? 'Review filed hardware malfunctions, process damage/loss reports, and manage resolution workflows.'
              : 'File hardware malfunctions, report damaged or lost equipment, and track ticket status.'}
          </p>
        </div>

        {!isAdmin && (
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setReportToResolve(null);
              setIsModalOpen(true);
            }}
          >
            Report Incident
          </Button>
        )}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card hover className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Review</span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{pendingCount}</p>
          <p className="text-xs text-slate-400 mt-1">Requires immediate evaluation</p>
        </Card>

        <Card hover className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Under Review</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{underReviewCount}</p>
          <p className="text-xs text-slate-400 mt-1">Investigation / repair assessment</p>
        </Card>

        <Card hover className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Resolved</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{resolvedCount}</p>
          <p className="text-xs text-slate-400 mt-1">Closed incident tickets</p>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-lg">
          {['', 'PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === '' ? 'All Reports' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none"
        >
          <option value="">All Incident Types</option>
          <option value="DAMAGE">💥 Damage</option>
          <option value="LOSS">🔍 Loss / Missing</option>
          <option value="ISSUE">⚠️ Technical Issue</option>
        </select>
      </Card>

      {/* Reports Data Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Incident ID</th>
                  <th className="py-3 px-5">Asset</th>
                  <th className="py-3 px-5">Reported By</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Description</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Status</th>
                  {canManageAssets && <th className="py-3 px-5 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Ticket ID */}
                    <td className="py-3.5 px-5 font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                      #{report.id.slice(0, 8)}
                    </td>

                    {/* Asset */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-indigo-500 shrink-0" />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {report.asset?.name}
                          </p>
                          <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                            {report.asset?.assetTag}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Reporter */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-[10px] shrink-0 border border-slate-200 dark:border-slate-700">
                          {report.reporter?.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {report.reporter?.name}
                        </span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-5">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${
                          report.type === 'DAMAGE'
                            ? 'text-rose-600 dark:text-rose-400'
                            : report.type === 'LOSS'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {report.type}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-5 max-w-sm">
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {report.description}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <Badge status={report.status} size="sm" />
                    </td>

                    {/* Action */}
                    {canManageAssets && (
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<Edit2 className="w-3.5 h-3.5 text-indigo-600" />}
                          onClick={() => {
                            setReportToResolve(report);
                            setIsModalOpen(true);
                          }}
                        >
                          Resolve
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-5">
              <Pagination meta={pagination} onPageChange={fetchReports} />
            </div>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No incident reports filed"
              description="No equipment damage, missing items, or technical incidents are currently registered."
              actionText={!isAdmin ? '+ File Incident Report' : undefined}
              onAction={() => {
                setReportToResolve(null);
                setIsModalOpen(true);
              }}
            />
          </div>
        )}
      </Card>

      {/* Report Modal */}
      {isModalOpen && (
        <ReportModal
          isOpen={isModalOpen}
          reportToResolve={reportToResolve}
          onClose={() => {
            setIsModalOpen(false);
            setReportToResolve(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setReportToResolve(null);
            fetchReports(pagination.page);
          }}
        />
      )}
    </div>
  );
};
