import React, { useEffect, useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import { usersApi, CreateUserInput } from '../../api/users.api';
import { Role, User, UserStatus } from '../../types';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userToEdit?: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userToEdit,
}) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateUserInput>({
    name: '',
    email: '',
    password: '',
    role: 'EMPLOYEE' as Role,
    department: 'Software Engineering',
    phone: '',
    status: 'ACTIVE' as UserStatus,
    rfidCardId: '',
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role,
        department: userToEdit.department || '',
        phone: userToEdit.phone || '',
        status: userToEdit.status,
        rfidCardId: userToEdit.rfidCardId || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: 'Password@123',
        role: 'EMPLOYEE',
        department: 'Software Engineering',
        phone: '',
        status: 'ACTIVE',
        rfidCardId: `CARD-EMP-${Math.floor(100 + Math.random() * 900)}`,
      });
    }
  }, [userToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      error('Name and Email are required.');
      return;
    }

    if (!userToEdit && (!formData.password || formData.password.length < 6)) {
      error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      if (userToEdit) {
        await usersApi.update(userToEdit.id, {
          ...formData,
          password: formData.password ? formData.password : undefined,
        });
        success(`User ${formData.name} updated successfully!`);
      } else {
        await usersApi.create(formData);
        success(`User ${formData.name} created successfully!`);
      }
      onSuccess();
    } catch (err: any) {
      error(err.message || 'Failed to save user account.');
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    'Software Engineering',
    'IT Operations',
    'Finance & Accounting',
    'Facilities & Security',
    'Human Resources',
    'Marketing & Sales',
    'Research & Development',
    'Executive Administration',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={userToEdit ? 'Edit User Profile' : 'Add New Organization User'}
      subtitle={
        userToEdit
          ? `Modify roles and account permissions for ${userToEdit.name}`
          : 'Provision a new team member with role-based dashboard access'
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Alex Henderson"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Work Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@organization.com"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {userToEdit ? 'New Password (Leave blank to keep)' : 'Initial Password *'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={userToEdit ? '••••••••' : 'Min 6 characters'}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              System Role *
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-medium"
            >
              <option value="EMPLOYEE">EMPLOYEE (Standard User)</option>
              <option value="MANAGER">MANAGER (Asset & Servicing Lead)</option>
              <option value="ADMIN">ADMIN (Full System Privileges)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Department
            </label>
            <select
              value={formData.department || ''}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1-555-0199"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              RFID Access Card ID
            </label>
            <input
              type="text"
              value={formData.rfidCardId || ''}
              onChange={(e) => setFormData({ ...formData, rfidCardId: e.target.value })}
              placeholder="CARD-EMP-012"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-mono"
            />
          </div>

          {userToEdit && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Account Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE (Deactivated)</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading}>
            {userToEdit ? 'Save Changes' : 'Create User'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
