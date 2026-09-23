import React, { useState, useEffect, useCallback } from 'react';
import { auditApi } from '../../api/audit.api';
import { AuditLog, PaginationMeta } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  History,
  RefreshCw,
  Layers,
  Eye,
  Clock
} from 'lucide-react';

export const AuditPage: React.FC = () => {
  const { error } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1
  });

  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await auditApi.getAll({
        entity: entityFilter || undefined,
        action: actionFilter || undefined,
        page,
        limit: 15
      });
      setLogs(res.data);
      if (res.pagination) {
        setPaginationMeta(res.pagination);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load audit trail records');
    } finally {
      setLoading(false);
    }
  }, [entityFilter, actionFilter, page, error]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                System Audit Trail
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Immutable chronological log of administrative, asset lifecycle, and authentication events ({paginationMeta.total} entries)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            icon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
            onClick={() => fetchLogs()}
            disabled={loading}
          >
            Refresh Logs
          </Button>
        </div>
      </div>

      {/* Filter Controls */}
      <Card className="p-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Target Entity
            </label>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Entities</option>
              <option value="ASSET">Assets</option>
              <option value="ASSIGNMENT">Assignments</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="REPORT">Issue Reports</option>
              <option value="USER">Users</option>
              <option value="AUTH">Authentication</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Action Category
            </label>
            <input
              type="text"
              placeholder="e.g. CREATE, UPDATE, RETURN..."
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-200 placeholder-slate-400"
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              className="w-full"
              size="sm"
              onClick={() => {
                setEntityFilter('');
                setActionFilter('');
                setPage(1);
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            title="No Audit Logs Found"
            description="No system activity matches the selected filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Timestamp</th>
                  <th className="py-3 px-5">Actor</th>
                  <th className="py-3 px-5">Action</th>
                  <th className="py-3 px-5">Entity</th>
                  <th className="py-3 px-5">Description</th>
                  <th className="py-3 px-5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-5 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(log.createdAt).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </td>

                    <td className="py-3 px-5">
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-[10px] border border-slate-200 dark:border-slate-700">
                            {log.user.name?.slice(0, 1) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-xs text-slate-900 dark:text-white">
                              {log.user.name}
                            </p>
                            <p className="text-[11px] text-slate-400">{log.user.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">System Event</span>
                      )}
                    </td>

                    <td className="py-3 px-5">
                      <span className="inline-block px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-5">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <Layers className="w-3.5 h-3.5 text-slate-400" />
                        {log.entity}
                      </span>
                    </td>

                    <td className="py-3 px-5 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {log.description}
                    </td>

                    <td className="py-3 px-5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedLog(log)}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          meta={paginationMeta}
          onPageChange={(p) => setPage(p)}
        />
      </Card>

      {/* Raw Payload Inspection Modal */}
      {selectedLog && (
        <Modal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          title={`Audit Log Event #${selectedLog.id.slice(0, 8)}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block font-medium">Actor:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedLog.user?.name || 'System'} ({selectedLog.user?.email || 'System'})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Recorded At:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Action & Entity:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {selectedLog.action} on {selectedLog.entity}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Target Entity ID:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedLog.entityId || 'None'}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Event Description & Audit Trail
              </p>
              <div className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs border border-slate-800 leading-relaxed">
                {selectedLog.description}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setSelectedLog(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AuditPage;
