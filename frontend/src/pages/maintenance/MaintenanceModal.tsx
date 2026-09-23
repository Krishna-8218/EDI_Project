import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { maintenanceApi, CreateMaintenanceInput } from '../../api/maintenance.api';
import { assetsApi } from '../../api/assets.api';
import { Asset, Maintenance, MaintenanceType, MaintenanceStatus } from '../../types';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  maintenanceToEdit?: Maintenance | null;
  preselectedAssetId?: string;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  maintenanceToEdit,
  preselectedAssetId,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  const [assetId, setAssetId] = useState(preselectedAssetId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [maintenanceType, setMaintenanceType] = useState<MaintenanceType>('ROUTINE');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [cost, setCost] = useState<number>(0);
  const [status, setStatus] = useState<MaintenanceStatus>('SCHEDULED');
  const [performedBy, setPerformedBy] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const loadAssets = async () => {
      try {
        const res = await assetsApi.getAll({ limit: 100 });
        if (res.success && res.data) {
          setAssets(res.data);
          if (!maintenanceToEdit && !preselectedAssetId && res.data.length > 0) {
            setAssetId(res.data[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadAssets();

    if (maintenanceToEdit) {
      setAssetId(maintenanceToEdit.assetId);
      setTitle(maintenanceToEdit.title);
      setDescription(maintenanceToEdit.description || '');
      setMaintenanceType(maintenanceToEdit.maintenanceType);
      setScheduledDate(
        maintenanceToEdit.scheduledDate ? maintenanceToEdit.scheduledDate.split('T')[0] : ''
      );
      setCost(maintenanceToEdit.cost ? Number(maintenanceToEdit.cost) : 0);
      setStatus(maintenanceToEdit.status);
      setPerformedBy(maintenanceToEdit.performedBy || '');
    } else {
      setTitle('');
      setDescription('');
      setMaintenanceType('ROUTINE');
      setScheduledDate(new Date().toISOString().split('T')[0]);
      setCost(0);
      setStatus('SCHEDULED');
      setPerformedBy('');
      if (preselectedAssetId) setAssetId(preselectedAssetId);
    }
  }, [isOpen, maintenanceToEdit, preselectedAssetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !title.trim()) {
      error('Asset and Maintenance Title are required.');
      return;
    }

    setLoading(true);
    try {
      if (maintenanceToEdit) {
        await maintenanceApi.update(maintenanceToEdit.id, {
          title,
          description: description.trim() || null,
          maintenanceType,
          scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : null,
          cost: Number(cost) || 0,
          status,
          performedBy: performedBy.trim() || null,
        });
        success('Maintenance record updated successfully!');
      } else {
        await maintenanceApi.create({
          assetId,
          title,
          description: description.trim() || undefined,
          maintenanceType,
          scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined,
          cost: Number(cost) || 0,
          performedBy: performedBy.trim() || undefined,
        });
        success('Maintenance scheduled! Asset moved to UNDER_MAINTENANCE status.');
      }
      onSuccess();
    } catch (err: any) {
      error(err.message || 'Failed to save maintenance record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={maintenanceToEdit ? 'Edit Maintenance Record' : 'Schedule Maintenance & Servicing'}
      subtitle={
        maintenanceToEdit
          ? 'Update servicing notes, expenses, or mark completion'
          : 'Place an asset in servicing queue and allocate technician resources'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!maintenanceToEdit && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Asset *
            </label>
            <select
              value={assetId}
              onChange={(e) => setAssetId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-medium"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.assetTag} — {a.name} ({a.category})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Maintenance Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fuser Roller Replacement, Annual Calibration, Battery Swap"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Maintenance Type
            </label>
            <select
              value={maintenanceType}
              onChange={(e) => setMaintenanceType(e.target.value as MaintenanceType)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            >
              <option value="ROUTINE">ROUTINE</option>
              <option value="PREVENTIVE">PREVENTIVE</option>
              <option value="CORRECTIVE">CORRECTIVE</option>
              <option value="INSPECTION">INSPECTION</option>
            </select>
          </div>

          {maintenanceToEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Servicing Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED (Restores Asset to Available)</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Scheduled Date
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Estimated / Actual Cost (₹)
            </label>
            <input
              type="number"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Technician / Vendor SLA Provider
            </label>
            <input
              type="text"
              value={performedBy}
              onChange={(e) => setPerformedBy(e.target.value)}
              placeholder="e.g. Dell ProSupport Field Tech, Campus IT Team"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Issue Diagnostics / Scope of Work
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of symptoms, parts replaced, firmware versions..."
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {maintenanceToEdit ? 'Save Changes' : 'Schedule Service'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
