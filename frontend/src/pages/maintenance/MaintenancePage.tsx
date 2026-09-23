import React, { useEffect, useState } from 'react';
import {
  Wrench,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertCircle,
  Laptop,
  Edit2,
  Trash2,
} from 'lucide-react';
import { maintenanceApi } from '../../api/maintenance.api';
import { Maintenance, MaintenanceStatus, MaintenanceType, PaginationMeta } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { TableSkeleton, CardSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { MaintenanceModal } from './MaintenanceModal';

export const MaintenancePage: React.FC = () => {
  const { canManageAssets, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [records, setRecords] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | ''>('');
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Modal & Action states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<Maintenance | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<Maintenance | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRecords = async (page = 1) => {
    setLoading(true);
    try {
      const res = await maintenanceApi.getAll({
        page,
        limit: 10,
        status: statusFilter || undefined,
        maintenanceType: typeFilter || undefined,
      });
      if (res.success && res.data) {
        setRecords(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords(1);
  }, [statusFilter, typeFilter]);

  const handleQuickComplete = async (m: Maintenance) => {
    try {
      await maintenanceApi.update(m.id, {
        status: 'COMPLETED',
        completedDate: new Date().toISOString(),
      });
      success(`Maintenance '${m.title}' marked as COMPLETED! Asset restored to Available.`);
      fetchRecords(pagination.page);
    } catch (err: any) {
      error(err.message || 'Failed to complete maintenance.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!recordToDelete) return;
    setDeleteLoading(true);
    try {
      await maintenanceApi.delete(recordToDelete.id);
      success('Maintenance record deleted successfully');
      setRecordToDelete(null);
      fetchRecords(pagination.page);
    } catch (err: any) {
      error(err.message || 'Failed to delete maintenance record');
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalCost = records.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
  const scheduledCount = records.filter((r) => r.status === 'SCHEDULED').length;
  const inProgressCount = records.filter((r) => r.status === 'IN_PROGRESS').length;
  const completedCount = records.filter((r) => r.status === 'COMPLETED').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Maintenance & Repairs
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {canManageAssets
              ? 'Monitor preventive servicing, schedule repairs, manage vendor SLAs, and track maintenance expenditure.'
              : 'View scheduled servicing, active repairs, and maintenance status of equipment.'}
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setRecordToEdit(null);
              setIsModalOpen(true);
            }}
          >
            Schedule Maintenance
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card hover className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Scheduled</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/40">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{scheduledCount}</p>
          <p className="text-xs text-slate-400 mt-1">Pending technician dispatch</p>
        </Card>

        <Card hover className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{inProgressCount}</p>
          <p className="text-xs text-slate-400 mt-1">Active repair / calibration</p>
        </Card>

        <Card hover className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{completedCount}</p>
          <p className="text-xs text-slate-400 mt-1">Restored to active inventory</p>
        </Card>

        <Card hover className="p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Servicing Cost</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">${totalCost.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Direct repair & parts expenditure</p>
        </Card>
      </div>

      {/* Filter Bar */}
      <Card className="p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/60 p-1 rounded-lg">
          {['', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {st === '' ? 'All Statuses' : st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 outline-none"
        >
          <option value="">All Service Types</option>
          <option value="ROUTINE">Routine</option>
          <option value="PREVENTIVE">Preventive</option>
          <option value="CORRECTIVE">Corrective</option>
          <option value="INSPECTION">Inspection</option>
        </select>
      </Card>

      {/* Maintenance Records Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={6} />
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Asset</th>
                  <th className="py-3 px-5">Task Title & Diagnostics</th>
                  <th className="py-3 px-5">Service Type</th>
                  <th className="py-3 px-5">Scheduled Date</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Cost ($)</th>
                  <th className="py-3 px-5">Technician / Vendor</th>
                  {canManageAssets && <th className="py-3 px-5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Asset */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 shrink-0 border border-amber-100 dark:border-amber-900/40">
                          <Laptop className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {record.asset?.name}
                          </p>
                          <p className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                            {record.asset?.assetTag}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Title & Description */}
                    <td className="py-3.5 px-5 max-w-xs">
                      <p className="font-semibold text-slate-900 dark:text-white">{record.title}</p>
                      {record.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {record.description}
                        </p>
                      )}
                    </td>

                    {/* Type */}
                    <td className="py-3.5 px-5 text-xs font-medium text-slate-600 dark:text-slate-300">
                      {record.maintenanceType}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {record.scheduledDate
                        ? new Date(record.scheduledDate).toLocaleDateString()
                        : '—'}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-5">
                      <Badge status={record.status} size="sm" />
                    </td>

                    {/* Cost */}
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-slate-900 dark:text-white">
                      ${Number(record.cost || 0).toFixed(2)}
                    </td>

                    {/* Technician */}
                    <td className="py-3.5 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {record.performedBy || 'Pending Dispatch'}
                    </td>

                    {/* Actions */}
                    {canManageAssets && (
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {record.status !== 'COMPLETED' && (
                            <button
                              onClick={() => handleQuickComplete(record)}
                              title="Mark Completed"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setRecordToEdit(record);
                              setIsModalOpen(true);
                            }}
                            title="Edit Record"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {isAdmin && (
                            <button
                              onClick={() => setRecordToDelete(record)}
                              title="Delete Record"
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-5">
              <Pagination meta={pagination} onPageChange={fetchRecords} />
            </div>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No maintenance records found"
              description="All equipment is operating in good order with zero scheduled servicing tickets."
              actionText={isAdmin ? '+ Schedule Maintenance' : undefined}
              onAction={() => {
                setRecordToEdit(null);
                setIsModalOpen(true);
              }}
            />
          </div>
        )}
      </Card>

      {/* Modal for create / edit */}
      {isModalOpen && (
        <MaintenanceModal
          isOpen={isModalOpen}
          maintenanceToEdit={recordToEdit}
          onClose={() => {
            setIsModalOpen(false);
            setRecordToEdit(null);
          }}
          onSuccess={() => {
            setIsModalOpen(false);
            setRecordToEdit(null);
            fetchRecords(pagination.page);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {recordToDelete && (
        <ConfirmDialog
          isOpen={!!recordToDelete}
          title="Delete Maintenance Record"
          message={`Are you sure you want to delete maintenance record '${recordToDelete.title}'?`}
          confirmText="Delete Record"
          variant="danger"
          loading={deleteLoading}
          onClose={() => setRecordToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};
