import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Search, Filter, Download, UserPlus, MoreVertical, Shield, ShieldOff, Mail, Ban, CheckCircle, XCircle } from 'lucide-react';
import { getAllUsersFiltered, exportUsersCsv, updateUserRole, extractErrorMessage } from '@/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';

type User = {
  id: string;
  email: string;
  name: string | null;
  role: 'USER' | 'ADMIN';
  tier: 'FREE' | 'PREMIUM';
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

export function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [tierFilter, setTierFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userDetailDialog, setUserDetailDialog] = useState<User | null>(null);
  const [roleChangeDialog, setRoleChangeDialog] = useState<{ user: User; newRole: 'USER' | 'ADMIN' } | null>(null);

  const queryClient = useQueryClient();

  const filters = {
    q: search,
    role: roleFilter,
    tier: tierFilter,
    page,
    limit: 20,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => getAllUsersFiltered(filters),
  });

  const exportMutation = useMutation({
    mutationFn: () => exportUsersCsv(filters),
    onSuccess: (data) => {
      const blob = new Blob([data.body], { type: data.mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Users exported successfully');
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const roleChangeMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'USER' | 'ADMIN' }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      toast.success('User role updated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      setRoleChangeDialog(null);
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const handleSelectUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (data?.items && selectedUsers.size === data.items.length) {
      setSelectedUsers(new Set());
    } else if (data?.items) {
      setSelectedUsers(new Set(data.items.map((u: User) => u.id)));
    }
  };

  const handleRoleChange = (user: User, newRole: 'USER' | 'ADMIN') => {
    setRoleChangeDialog({ user, newRole });
  };

  const confirmRoleChange = () => {
    if (roleChangeDialog) {
      roleChangeMutation.mutate({
        userId: roleChangeDialog.user.id,
        role: roleChangeDialog.newRole,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <Button onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  placeholder="Search by email or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="USER">User</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Tiers</SelectItem>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="PREMIUM">Premium</SelectItem>
              </SelectContent>
            </Select>
            {(search || roleFilter || tierFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('');
                  setTierFilter('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
          <CardContent className="flex items-center justify-between pt-6">
            <span className="text-sm font-medium">
              {selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Send Email
              </Button>
              <Button variant="outline" size="sm">
                Export Selected
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedUsers(new Set())}>
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            All Users ({data?.pagination.total.toLocaleString() || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data && data.items.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200 text-sm dark:border-neutral-800">
                      <th className="pb-3 text-left">
                        <Checkbox
                          checked={data.items.length > 0 && selectedUsers.size === data.items.length}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="pb-3 text-left font-medium">User</th>
                      <th className="pb-3 text-left font-medium">Role</th>
                      <th className="pb-3 text-left font-medium">Tier</th>
                      <th className="pb-3 text-left font-medium">Status</th>
                      <th className="pb-3 text-left font-medium">Joined</th>
                      <th className="pb-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((user: User) => (
                      <tr
                        key={user.id}
                        className="border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-900 dark:hover:bg-neutral-900"
                      >
                        <td className="py-4">
                          <Checkbox
                            checked={selectedUsers.has(user.id)}
                            onCheckedChange={() => handleSelectUser(user.id)}
                          />
                        </td>
                        <td className="py-4">
                          <div>
                            <div className="font-medium">{user.name || 'No name'}</div>
                            <div className="text-sm text-neutral-600 dark:text-neutral-400">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge variant={user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <Badge variant={user.tier === 'PREMIUM' ? 'default' : 'outline'}>
                            {user.tier}
                          </Badge>
                        </td>
                        <td className="py-4">
                          {user.emailVerified ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-yellow-600">
                              <XCircle className="h-4 w-4" />
                              <span className="text-sm">Pending</span>
                            </div>
                          )}
                        </td>
                        <td className="py-4 text-sm text-neutral-600 dark:text-neutral-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => setUserDetailDialog(user)}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.role === 'USER' ? (
                                <DropdownMenuItem onClick={() => handleRoleChange(user, 'ADMIN')}>
                                  <Shield className="mr-2 h-4 w-4" />
                                  Promote to Admin
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleRoleChange(user, 'USER')}>
                                  <ShieldOff className="mr-2 h-4 w-4" />
                                  Demote to User
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Ban className="mr-2 h-4 w-4" />
                                Suspend Account
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {data.pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.pagination.total)} of{' '}
                    {data.pagination.total} users
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page >= data.pagination.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-neutral-500">
              No users found matching your filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={!!userDetailDialog} onOpenChange={() => setUserDetailDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Complete information about {userDetailDialog?.name || userDetailDialog?.email}
            </DialogDescription>
          </DialogHeader>
          {userDetailDialog && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Name</label>
                  <div className="text-sm">{userDetailDialog.name || '—'}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Email</label>
                  <div className="text-sm">{userDetailDialog.email}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Role</label>
                  <div>
                    <Badge variant={userDetailDialog.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                      {userDetailDialog.role}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Tier</label>
                  <div>
                    <Badge variant={userDetailDialog.tier === 'PREMIUM' ? 'default' : 'outline'}>
                      {userDetailDialog.tier}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Email Verified</label>
                  <div className="text-sm">
                    {userDetailDialog.emailVerified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-yellow-600">✗ Pending</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">User ID</label>
                  <div className="text-xs font-mono">{userDetailDialog.id}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Joined</label>
                  <div className="text-sm">{new Date(userDetailDialog.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Last Login</label>
                  <div className="text-sm">
                    {userDetailDialog.lastLoginAt
                      ? new Date(userDetailDialog.lastLoginAt).toLocaleString()
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDetailDialog(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Change Confirmation */}
      <Dialog open={!!roleChangeDialog} onOpenChange={() => setRoleChangeDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Role Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change this user's role?
            </DialogDescription>
          </DialogHeader>
          {roleChangeDialog && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">User:</div>
                <div className="font-medium">{roleChangeDialog.user.email}</div>
              </div>
              <div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">Change role:</div>
                <div className="flex items-center gap-2">
                  <Badge variant={roleChangeDialog.user.role === 'ADMIN' ? 'destructive' : 'secondary'}>
                    {roleChangeDialog.user.role}
                  </Badge>
                  →
                  <Badge variant={roleChangeDialog.newRole === 'ADMIN' ? 'destructive' : 'secondary'}>
                    {roleChangeDialog.newRole}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleChangeDialog(null)}>
              Cancel
            </Button>
            <Button onClick={confirmRoleChange} disabled={roleChangeMutation.isPending}>
              {roleChangeMutation.isPending ? 'Updating...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

