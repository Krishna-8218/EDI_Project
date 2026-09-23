import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Laptop,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  ArrowRightLeft,
  Calendar,
  MapPin,
  X,
} from 'lucide-react';
import { assetsApi, GetAssetsParams } from '../../api/assets.api';
import { Asset, AssetStatus, PaginationMeta } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { TableSkeleton } from '../../components/common/Skeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { AssetModal } from './AssetModal';
import { AssignmentModal } from '../assignments/AssignmentModal';

export const AssetsPage: React.FC = () => {
  const { canManageAssets, isAdmin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssetStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals & Action States
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Assign Quick Modal State
  const [assignAssetTarget, setAssignAssetTarget] = useState<Asset | null>(null);

  const fetchAssets = async (page = 1) => {
    setLoading(true);
    try {
      const params: GetAssetsParams = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        sortBy,
        sortOrder,
      };

      const res = await assetsApi.getAll(params);
      if (res.success && res.data) {
        setAssets(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err: any) {
      error(err.message || 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAssets(1);
    }, 200);
    return () => clearTimeout(timer);
  }, [search, statusFilter, categoryFilter, sortBy, sortOrder]);

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;
    setDeleteLoading(true);
    try {
      await assetsApi.delete(assetToDelete.id);
      success(`Asset ${assetToDelete.name} deleted successfully.`);
      setAssetToDelete(null);
      fetchAssets(pagination.page);
    } catch (err: any) {
      error(err.message || 'Failed to delete asset.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const categories = [
    'Laptop',
    'Desktop',
    'Monitor',
    'Mobile',
    'Tablet',
    'Printer',
    'Networking',
    'Surveillance',
    'Laboratory',
    'Furniture',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Assets Inventory
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {canManageAssets
              ? "Manage, track, and monitor your organization's physical and digital assets."
              : "Explore and view your organization's hardware and equipment inventory."}
          </p>
        </div>

        {isAdmin && (
          <Button
            variant="gradient"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setAssetToEdit(null);
              setIsAssetModalOpen(true);
            }}
          >
            Add New Asset
          </Button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, tag (AST-...), serial number, model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Select Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AssetStatus | '')}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="DAMAGED">Damaged</option>
              <option value="LOST">Lost</option>
              <option value="RETIRED">Retired</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Sort Order */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-');
                setSortBy(by);
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none cursor-pointer"
            >
              <option value="createdAt-desc">Newest Added</option>
              <option value="createdAt-asc">Oldest Added</option>
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="purchasePrice-desc">Highest Value</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Asset Data Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : assets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Asset Tag</th>
                  <th className="py-3.5 px-5">Asset Name</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Current Status</th>
                  <th className="py-3.5 px-5">Assigned To</th>
                  <th className="py-3.5 px-5">Location</th>
                  {canManageAssets && <th className="py-3.5 px-5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {assets.map((asset) => {
                  const activeAssignment = asset.assignments?.[0];

                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={(e) => {
                        // If clicked outside an interactive button
                        if ((e.target as HTMLElement).closest('button')) return;
                        navigate(`/assets/${asset.id}`);
                      }}
                    >
                      {/* Asset Tag */}
                      <td className="py-3.5 px-5 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {asset.assetTag}
                      </td>

                      {/* Name & Manufacturer */}
                      <td className="py-3.5 px-5">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {asset.name}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {asset.manufacturer ? `${asset.manufacturer} ` : ''}
                            {asset.model || ''}
                          </p>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-5">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <Laptop className="w-3.5 h-3.5 text-slate-400" />
                          {asset.category}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        <Badge status={asset.status} size="sm" />
                      </td>

                      {/* Assigned To */}
                      <td className="py-4 px-6">
                        {activeAssignment ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px] shrink-0 border border-blue-200 dark:border-blue-800">
                              {activeAssignment.user?.name?.charAt(0) || 'U'}
                            </div>
                            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                              {activeAssignment.user?.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Location */}
                      <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-400">
                        {asset.location ? (
                          <span className="inline-flex items-center gap-1 truncate max-w-[150px]">
                            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            {asset.location}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>

                      {/* Action Buttons */}
                      {canManageAssets && (
                        <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Detail */}
                            <button
                              onClick={() => navigate(`/assets/${asset.id}`)}
                              title="View Asset Details"
                              className="p-1.5 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* Assign Quick Button */}
                            {asset.status === 'AVAILABLE' && (
                              <button
                                onClick={() => setAssignAssetTarget(asset)}
                                title="Assign Asset"
                                className="p-1.5 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                <ArrowRightLeft className="w-4 h-4" />
                              </button>
                            )}

                            {/* Edit */}
                            <button
                              onClick={() => {
                                setAssetToEdit(asset);
                                setIsAssetModalOpen(true);
                              }}
                              title="Edit Asset"
                              className="p-1.5 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete (Admin only) */}
                            {isAdmin && (
                              <button
                                onClick={() => setAssetToDelete(asset)}
                                title="Delete Asset"
                                className="p-1.5 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Pagination Controls */}
            <div className="px-6">
              <Pagination meta={pagination} onPageChange={fetchAssets} />
            </div>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No assets found"
              description="No assets match your search query or filter criteria. Try resetting filters or adding a new asset."
              actionText={isAdmin ? '+ Add New Asset' : undefined}
              onAction={() => {
                setAssetToEdit(null);
                setIsAssetModalOpen(true);
              }}
            />
          </div>
        )}
      </Card>

      {/* Add / Edit Modal */}
      {isAssetModalOpen && (
        <AssetModal
          isOpen={isAssetModalOpen}
          onClose={() => {
            setIsAssetModalOpen(false);
            setAssetToEdit(null);
          }}
          onSuccess={() => {
            setIsAssetModalOpen(false);
            setAssetToEdit(null);
            fetchAssets(pagination.page);
          }}
          assetToEdit={assetToEdit}
        />
      )}

      {/* Quick Assign Modal */}
      {assignAssetTarget && (
        <AssignmentModal
          isOpen={!!assignAssetTarget}
          preselectedAssetId={assignAssetTarget.id}
          onClose={() => setAssignAssetTarget(null)}
          onSuccess={() => {
            setAssignAssetTarget(null);
            fetchAssets(pagination.page);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {assetToDelete && (
        <ConfirmDialog
          isOpen={!!assetToDelete}
          title="Delete Asset"
          message={`Are you sure you want to permanently delete '${assetToDelete.name}' (${assetToDelete.assetTag})? This action cannot be undone.`}
          confirmText="Delete Asset"
          variant="danger"
          loading={deleteLoading}
          onClose={() => setAssetToDelete(null)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};
