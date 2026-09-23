import React, { useEffect, useState } from 'react';
import {
  ArrowRightLeft,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Laptop,
  User as UserIcon,
  RotateCcw,
} from 'lucide-react';
import { assignmentsApi } from '../../api/assignments.api';
import { AssetAssignment, AssignmentStatus, PaginationMeta } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { Modal } from '../../components/common/Modal';
import { AssignmentModal } from './AssignmentModal';

export const AssignmentsPage: React.FC = () => {
  const { canManageAssets } = useAuth();
  const { success, error } = useToast();

  const [assignments, setAssignments] = useState<AssetAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | ''>('');
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [returnTarget, setReturnTarget] = useState<AssetAssignment | null>(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);

  const fetchAssignments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await assignmentsApi.getAll({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      if (res.success && res.data) {
        setAssignments(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments(1);
  }, [statusFilter]);

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnTarget) return;

    setReturnLoading(true);
    try {
      await assignmentsApi.returnAsset(returnTarget.id, {
        notes: returnNotes.trim() || undefined,
      });
      success(`Asset ${returnTarget.asset?.name} successfully checked back into inventory!`);
      setReturnTarget(null);
      setReturnNotes('');
      fetchAssignments(pagination.page);
    } catch (err: any) {
      error(err.message || 'Failed to return asset.');
    } finally {
      setReturnLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Asset Assignments & Custody
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {canManageAssets
              ? 'Track employee checkouts, manage active hardware loans, and process check-ins.'
              : 'View assigned organizational assets, active equipment loans, and return history.'}
          </p>
        </div>

        {canManageAssets && (
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setAssignModalOpen(true)}
          >
            New Assignment
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <Card className="p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-lg">
          {['', 'ACTIVE', 'RETURNED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === '' ? 'All Loans' : st === 'ACTIVE' ? 'Active Custody' : 'Returned History'}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Total Recorded: <strong className="text-slate-900 dark:text-white">{pagination.total}</strong>
        </span>
      </Card>

      {/* Assignments Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : assignments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Asset</th>
                  <th className="py-3 px-5">Assigned Employee</th>
                  <th className="py-3 px-5">Assigned Date</th>
                  <th className="py-3 px-5">Return Date</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Purpose / Remarks</th>
                  {canManageAssets && <th className="py-3 px-5 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {assignments.map((asgn) => (
                  <tr
                    key={asgn.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Asset info */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {asgn.asset?.name || 'Asset'}
                          </p>
                          <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                            {asgn.asset?.assetTag}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Employee */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200 dark:border-slate-700">
                          {asgn.user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {asgn.user?.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {asgn.user?.department || 'General'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Date */}
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                      {new Date(asgn.assignedAt).toLocaleDateString()}
                    </td>

                    {/* Returned Date */}
                    <td className="py-3.5 px-5 text-slate-600 dark:text-slate-300">
                      {asgn.returnedAt ? new Date(asgn.returnedAt).toLocaleDateString() : '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <Badge status={asgn.status} size="sm" />
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-5 text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                      {asgn.notes || '—'}
                    </td>

                    {/* Action */}
                    {canManageAssets && (
                      <td className="py-3.5 px-5 text-right">
                        {asgn.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            variant="secondary"
                            icon={<RotateCcw className="w-3.5 h-3.5 text-indigo-600" />}
                            onClick={() => {
                              setReturnTarget(asgn);
                              setReturnNotes('');
                            }}
                          >
                            Check In
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-5">
              <Pagination meta={pagination} onPageChange={fetchAssignments} />
            </div>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No assignment records found"
              description="There are no active or historical asset loans matching your selection."
              actionText={canManageAssets ? '+ Assign Asset' : undefined}
              onAction={() => setAssignModalOpen(true)}
            />
          </div>
        )}
      </Card>

      {/* New Assignment Modal */}
      {assignModalOpen && (
        <AssignmentModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onSuccess={() => {
            setAssignModalOpen(false);
            fetchAssignments(pagination.page);
          }}
        />
      )}

      {/* Return Asset Dialog Modal */}
      {returnTarget && (
        <Modal
          isOpen={!!returnTarget}
          onClose={() => setReturnTarget(null)}
          title="Process Asset Return"
          subtitle={`Checking in ${returnTarget.asset?.name} (${returnTarget.asset?.assetTag})`}
          maxWidth="md"
        >
          <form onSubmit={handleReturnSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Returning this asset will automatically update its operational inventory status back to{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">AVAILABLE</strong> for other team members.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Return Condition / Inspection Notes
              </label>
              <textarea
                rows={3}
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
                placeholder="e.g. Returned in pristine condition, charger included, diagnostics passed..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setReturnTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={returnLoading}>
                Confirm Asset Return
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
