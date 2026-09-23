import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { assignmentsApi } from '../../api/assignments.api';
import { assetsApi } from '../../api/assets.api';
import { usersApi } from '../../api/users.api';
import { Asset, User } from '../../types';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedAssetId?: string;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedAssetId,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(true);

  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);

  const [assetId, setAssetId] = useState(preselectedAssetId || '');
  const [userId, setUserId] = useState('');
  const [notes, setNotes] = useState('');
  const [assignedAt, setAssignedAt] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!isOpen) return;

    const loadOptions = async () => {
      setFetchingOptions(true);
      try {
        const [assetRes, userRes] = await Promise.all([
          assetsApi.getAll({ status: 'AVAILABLE', limit: 100 }),
          usersApi.getAll({ status: 'ACTIVE', limit: 100 }),
        ]);

        let assetsList = assetRes.data || [];
        if (preselectedAssetId && !assetsList.some((a) => a.id === preselectedAssetId)) {
          const singleAsset = await assetsApi.getById(preselectedAssetId);
          if (singleAsset.data) {
            assetsList = [singleAsset.data, ...assetsList];
          }
        }

        setAvailableAssets(assetsList);
        setActiveUsers(userRes.data || []);
        if (preselectedAssetId) {
          setAssetId(preselectedAssetId);
        } else if (assetsList.length > 0) {
          setAssetId(assetsList[0].id);
        }

        if (userRes.data && userRes.data.length > 0) {
          setUserId(userRes.data[0].id);
        }
      } catch (err: any) {
        error('Failed to load asset or employee dropdown lists.');
      } finally {
        setFetchingOptions(false);
      }
    };

    loadOptions();
  }, [isOpen, preselectedAssetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !userId) {
      error('Please select both an asset and an employee.');
      return;
    }

    setLoading(true);
    try {
      await assignmentsApi.assign({
        assetId,
        userId,
        notes: notes.trim() || undefined,
        assignedAt: assignedAt ? new Date(assignedAt).toISOString() : undefined,
      });
      success('Asset successfully assigned and checked out!');
      onSuccess();
    } catch (err: any) {
      error(err.message || 'Failed to assign asset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Asset to Employee"
      subtitle="Issue hardware custody to an authorized organizational user"
      maxWidth="lg"
    >
      {fetchingOptions ? (
        <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
          Loading available assets and user directory...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Asset *
            </label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-medium"
            >
              {availableAssets.map((asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.assetTag} — {asset.name} ({asset.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assign To Employee *
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-medium"
            >
              {activeUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.email} ({u.department || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Assignment Date
            </label>
            <input
              type="date"
              value={assignedAt}
              onChange={(e) => setAssignedAt(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Loan Remarks / Business Purpose
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Assigned for Q3 frontend development and mobile testing..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
