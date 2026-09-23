import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Laptop,
  Calendar,
  IndianRupee,
  ShieldAlert,
  MapPin,
  Clock,
  ArrowRightLeft,
  Wrench,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle2,
  User as UserIcon,
} from 'lucide-react';
import { assetsApi } from '../../api/assets.api';
import { Asset } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card, CardHeader } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { AssetModal } from './AssetModal';
import { AssignmentModal } from '../assignments/AssignmentModal';
import { ReportModal } from '../reports/ReportModal';
import { AssetHealthCard } from './components/AssetHealthCard';


export const AssetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canManageAssets, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'maintenance' | 'reports'>('overview');

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAsset = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await assetsApi.getById(id);
      if (res.success && res.data) {
        setAsset(res.data);
      }
    } catch (err: any) {
      error(err.message || 'Failed to load asset details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAsset();
  }, [id]);

  const handleDelete = async () => {
    if (!asset) return;
    setDeleteLoading(true);
    try {
      await assetsApi.delete(asset.id);
      success('Asset deleted successfully');
      navigate('/assets');
    } catch (err: any) {
      error(err.message || 'Failed to delete asset');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Asset not found</h3>
        <Button variant="outline" onClick={() => navigate('/assets')}>
          Back to Assets
        </Button>
      </div>
    );
  }

  const activeAssignment = asset.assignments?.find((a) => a.status === 'ACTIVE');

  return (
    <div className="space-y-6">
      {/* Back Button & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/assets')}
          className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Inventory
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {canManageAssets && (
            <Button
              variant="outline"
              size="sm"
              icon={<Edit2 className="w-3.5 h-3.5" />}
              onClick={() => setEditModalOpen(true)}
            >
              Edit Asset
            </Button>
          )}

          {canManageAssets && asset.status === 'AVAILABLE' && (
            <Button
              variant="primary"
              size="sm"
              icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
              onClick={() => setAssignModalOpen(true)}
            >
              Assign Asset
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

          {isAdmin && (
            <Button
              variant="danger"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <Card className="relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 flex items-center justify-center shrink-0">
              <Laptop className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {asset.name}
                </h2>
                <Badge status={asset.status} />
              </div>
              <p className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                {asset.assetTag}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {asset.manufacturer || 'Generic'} • {asset.model || 'Standard Model'} • Category:{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{asset.category}</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Valuation</span>
              <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                ₹{Number(asset.purchasePrice || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Condition</span>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {asset.condition || 'Good'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Admin-Only AI Asset Health & Risk Prediction Section */}
      {isAdmin && <AssetHealthCard assetId={asset.id} />}

      {/* Main Grid: Details Left, Current Custody Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-0 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview & Specs' },
              { id: 'assignments', label: `Assignment History (${asset.assignments?.length || 0})` },
              { id: 'maintenance', label: `Maintenance (${asset.maintenances?.length || 0})` },
              { id: 'reports', label: `Damage Reports (${asset.reports?.length || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2.5 text-xs font-semibold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <Card>
              <CardHeader title="Hardware Specifications & Metadata" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <span className="text-xs text-gray-400">Serial Number</span>
                  <p className="font-mono font-medium text-gray-900 dark:text-white mt-0.5">
                    {asset.serialNumber || 'Not Registered'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Current Deployment Location</span>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    {asset.location || 'Central Depot'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Procurement Date</span>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                    {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-gray-400">Warranty Expiration</span>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">
                    {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : '—'}
                  </p>
                </div>
                <div className="sm:col-span-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-xs text-gray-400">Technical Notes & Description</span>
                  <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">
                    {asset.description || 'No additional technical notes provided.'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Tab 2: Assignment History */}
          {activeTab === 'assignments' && (
            <Card>
              <CardHeader
                title="Assignment & Custody History"
                subtitle="Historical track of user loans and returns"
              />
              {asset.assignments && asset.assignments.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {asset.assignments.map((asgn) => (
                    <div key={asgn.id} className="py-3.5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          Assigned to {asgn.user?.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Dept: {asgn.user?.department || 'General'} • Notes: {asgn.notes || 'N/A'}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Assigned: {new Date(asgn.assignedAt).toLocaleDateString()}
                          {asgn.returnedAt ? ` • Returned: ${new Date(asgn.returnedAt).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                      <Badge status={asgn.status} size="sm" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-6 text-center">
                  No historical assignments recorded.
                </p>
              )}
            </Card>
          )}

          {/* Tab 3: Maintenance History */}
          {activeTab === 'maintenance' && (
            <Card>
              <CardHeader
                title="Maintenance & Servicing Records"
                subtitle="Scheduled preventive checks and corrective repairs"
              />
              {asset.maintenances && asset.maintenances.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {asset.maintenances.map((m) => (
                    <div key={m.id} className="py-3.5 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Type: {m.maintenanceType} • Technician: {m.performedBy || 'Unassigned'} • Cost: ₹{Number(m.cost || 0).toFixed(2)}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Date: {m.scheduledDate ? new Date(m.scheduledDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <Badge status={m.status} size="sm" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-6 text-center">
                  No maintenance records for this asset.
                </p>
              )}
            </Card>
          )}

          {/* Tab 4: Damage Reports */}
          {activeTab === 'reports' && (
            <Card>
              <CardHeader
                title="Incident & Damage Reports"
                subtitle="Employee reported hardware issues"
              />
              {asset.reports && asset.reports.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {asset.reports.map((r) => (
                    <div key={r.id} className="py-3.5 flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-rose-500 uppercase">{r.type}</span>
                          <span className="text-xs text-gray-400">• By {r.reporter?.name || 'User'}</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {r.description}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Reported on {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge status={r.status} size="sm" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-6 text-center">
                  No incident reports filed for this asset.
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Right 1 Col: Current Custody & Quick Info */}
        <div className="space-y-6">
          {/* Active Custody Card */}
          <Card>
            <CardHeader title="Current Custody & Holder" />
            {activeAssignment ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0">
                    {activeAssignment.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {activeAssignment.user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {activeAssignment.user?.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Department:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {activeAssignment.user?.department || 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Assigned On:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {new Date(activeAssignment.assignedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-gray-400 space-y-2">
                <p>This asset is currently in inventory and not loaned to any employee.</p>
                {canManageAssets && asset.status === 'AVAILABLE' && (
                  <Button
                    size="sm"
                    variant="gradient"
                    onClick={() => setAssignModalOpen(true)}
                    className="w-full mt-2"
                  >
                    Assign to Employee
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* Quick Lifecycle Summary */}
          <Card>
            <CardHeader title="Asset Lifecycle Health" />
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Asset Age:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {asset.purchaseDate
                    ? `${Math.floor((new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} months`
                    : 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Times Assigned:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {asset.assignments?.length || 0} times
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Service Events:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {asset.maintenances?.length || 0} repairs
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <AssetModal
          isOpen={editModalOpen}
          assetToEdit={asset}
          onClose={() => setEditModalOpen(false)}
          onSuccess={() => {
            setEditModalOpen(false);
            fetchAsset();
          }}
        />
      )}

      {/* Assign Modal */}
      {assignModalOpen && (
        <AssignmentModal
          isOpen={assignModalOpen}
          preselectedAssetId={asset.id}
          onClose={() => setAssignModalOpen(false)}
          onSuccess={() => {
            setAssignModalOpen(false);
            fetchAsset();
          }}
        />
      )}

      {/* Report Modal */}
      {reportModalOpen && (
        <ReportModal
          isOpen={reportModalOpen}
          preselectedAssetId={asset.id}
          onClose={() => setReportModalOpen(false)}
          onSuccess={() => {
            setReportModalOpen(false);
            fetchAsset();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteDialogOpen && (
        <ConfirmDialog
          isOpen={deleteDialogOpen}
          title="Delete Asset"
          message={`Are you sure you want to permanently delete '${asset.name}'? This action cannot be undone.`}
          confirmText="Delete Asset"
          variant="danger"
          loading={deleteLoading}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};
