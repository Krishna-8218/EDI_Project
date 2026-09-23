import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { reportsApi } from '../../api/reports.api';
import { assetsApi } from '../../api/assets.api';
import { Asset, AssetReport, ReportStatus, ReportType } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  reportToResolve?: AssetReport | null;
  preselectedAssetId?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  reportToResolve,
  preselectedAssetId,
}) => {
  const { canManageAssets } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  // Create Mode states
  const [assetId, setAssetId] = useState(preselectedAssetId || '');
  const [type, setType] = useState<ReportType>('DAMAGE');
  const [description, setDescription] = useState('');

  // Resolve Mode states
  const [status, setStatus] = useState<ReportStatus>('RESOLVED');

  useEffect(() => {
    if (!isOpen) return;

    if (!reportToResolve) {
      const loadAssets = async () => {
        try {
          const res = await assetsApi.getAll({ limit: 100 });
          if (res.success && res.data) {
            setAssets(res.data);
            if (!preselectedAssetId && res.data.length > 0) {
              setAssetId(res.data[0].id);
            }
          }
        } catch (err) {
          console.error(err);
        }
      };
      loadAssets();
      setDescription('');
      setType('DAMAGE');
      if (preselectedAssetId) setAssetId(preselectedAssetId);
    } else {
      setStatus(reportToResolve.status);
    }
  }, [isOpen, reportToResolve, preselectedAssetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      if (reportToResolve) {
        await reportsApi.update(reportToResolve.id, {
          status,
        });
        success(`Report marked as ${status}!`);
      } else {
        if (!assetId || description.trim().length < 5) {
          error('Please select an asset and write a description of at least 5 characters.');
          setLoading(false);
          return;
        }

        await reportsApi.create({
          assetId,
          type,
          description: description.trim(),
        });
        success('Incident report submitted for administrative review!');
      }
      onSuccess();
    } catch (err: any) {
      error(err.message || 'Failed to process report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reportToResolve ? 'Resolve Incident Report' : 'File Asset Incident Report'}
      subtitle={
        reportToResolve
          ? `Review and update ticket #${reportToResolve.id.slice(0, 8)}`
          : 'Report damaged equipment, lost property, or technical hardware malfunctions'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {reportToResolve ? (
          /* Resolve Mode */
          <div className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1.5 text-xs">
              <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                <span>Asset: {reportToResolve.asset?.name} ({reportToResolve.asset?.assetTag})</span>
                <span className="text-rose-600 font-bold uppercase">{reportToResolve.type}</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">{reportToResolve.description}</p>
              <p className="text-slate-400">Filed by: {reportToResolve.reporter?.name || 'User'}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Resolution Decision *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReportStatus)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-medium"
              >
                <option value="UNDER_REVIEW">UNDER REVIEW (In Investigation)</option>
                <option value="RESOLVED">RESOLVED (Action Taken & Closed)</option>
                <option value="REJECTED">REJECTED (Invalid / Duplicate)</option>
              </select>
            </div>
          </div>
        ) : (
          /* Create Mode */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Impacted Asset *
              </label>
              <select
                value={assetId}
                onChange={(e) => setAssetId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                {assets.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.assetTag} — {a.name} ({a.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Incident Classification *
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { val: 'DAMAGE', label: '💥 Damage', desc: 'Physical breakage / shattered' },
                  { val: 'LOSS', label: '🔍 Loss / Theft', desc: 'Missing or stolen device' },
                  { val: 'ISSUE', label: '⚠️ Technical Issue', desc: 'Performance / malfunction' },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.val}
                    onClick={() => setType(item.val as ReportType)}
                    className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                      type === item.val
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Incident Description & Context *
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what occurred, physical location, date/time, observed symptoms..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {reportToResolve ? 'Update Decision' : 'Submit Incident Report'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
