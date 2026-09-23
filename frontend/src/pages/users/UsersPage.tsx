import React, { useState, useEffect, useCallback } from 'react';
import { usersApi } from '../../api/users.api';
import { User, Role, UserStatus, PaginationMeta } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { UserModal } from './UserModal';
import {
  Users,
  UserPlus,
  Search,
  Building2,
  Mail,
  Edit2,
  Trash2,
  Laptop
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { success, error } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [paginationMeta, setPaginationMeta] = useState<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [deleteConfirmUser, setDeleteConfirmUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await usersApi.getAll({
        search: searchTerm || undefined,
        role: (roleFilter as Role) || undefined,
        department: departmentFilter || undefined,
        status: (statusFilter as UserStatus) || undefined,
        page,
        limit: 10
      });
      setUsers(res.data);
      if (res.pagination) {
        setPaginationMeta(res.pagination);
      }
    } catch (err: any) {
      error(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, departmentFilter, statusFilter, page, error]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setSelectedUser(u);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmUser) return;
    try {
      setDeleting(true);
      await usersApi.delete(deleteConfirmUser.id);
      success(`User ${deleteConfirmUser.name} deactivated/deleted`);
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (err: any) {
      error(err.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                User Management
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Manage organization accounts, access roles, and assigned resources ({paginationMeta.total} total)
              </p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              icon={<UserPlus className="w-4 h-4" />}
              onClick={handleOpenCreate}
            >
              Add User
            </Button>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, RFID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="EMPLOYEE">Employee</option>
            </select>
          </div>

          <div>
            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Departments</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="IT Operations">IT Operations</option>
              <option value="Finance & Accounting">Finance & Accounting</option>
              <option value="Facilities & Security">Facilities & Security</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Marketing & Sales">Marketing & Sales</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-slate-700 dark:text-slate-200"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table / Grid */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-slate-800/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="No Users Found"
            description="No users matched your search filters. Try adjusting your query."
            actionText={isAdmin ? "Add First User" : undefined}
            onAction={isAdmin ? handleOpenCreate : undefined}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Department & RFID</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Active Assets</th>
                  <th className="py-3.5 px-4">Joined</th>
                  {isAdmin && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const activeAssignmentsCount = u.assignments?.filter((a: any) => a.status === 'ACTIVE')?.length ?? u._count?.assignments ?? 0;

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                            {u.name?.slice(0, 2).toUpperCase() || 'US'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {u.name}
                              {isCurrent && (
                                <span className="text-[10px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge role={u.role}>
                          {u.role}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          {u.department || 'General'}
                        </div>
                        <div className="text-xs font-mono text-slate-400">
                          {u.rfidCardId ? `RFID: ${u.rfidCardId}` : 'No RFID'}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge status={u.status} size="sm">
                          {u.status}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
                          <Laptop className="w-4 h-4 text-slate-400" />
                          <span>{activeAssignmentsCount}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {isAdmin && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              title="Edit user"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {!isCurrent && (
                              <button
                                onClick={() => setDeleteConfirmUser(u)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                                title="Deactivate user"
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
          </div>
        )}

        <Pagination
          meta={paginationMeta}
          onPageChange={(p) => setPage(p)}
        />
      </Card>

      {/* Add / Edit Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={selectedUser}
        onSuccess={fetchUsers}
      />

      {/* Delete / Deactivate Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmUser}
        onClose={() => setDeleteConfirmUser(null)}
        onConfirm={handleDelete}
        title="Deactivate / Delete User"
        message={`Are you sure you want to delete user "${deleteConfirmUser?.name}" (${deleteConfirmUser?.email})? If they have active asset assignments, they will be set to INACTIVE.`}
        confirmText="Yes, Delete User"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};

export default UsersPage;
