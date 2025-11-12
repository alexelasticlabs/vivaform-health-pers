import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shield, CheckCircle, XCircle, Trash2 } from "lucide-react";

import {
  getAllUsers,
  getUserStats,
  getSystemStats,
  updateUserRole,
  getAdminFoodItems,
  verifyFoodItem,
  deleteFoodItem,
  extractErrorMessage,
  type UserStats,
  type SystemStats
} from "../api";
import { getOverviewKpis, getRevenueTrend, getNewUsers, getSubsDistribution, getActivityHeatmap, getSystemHealth } from '@/api/admin';
import { getAllUsersFiltered, exportUsersCsv, listSubscriptions, listTickets, getSettings, patchSettings } from '../api/admin';

// Типы для overview
type OverviewKpis = { totalUsers: number; activeSubs: number; mrr: number; dau: number };

type TabType = "overview" | "users" | "foods" | "subs" | "analytics" | "support" | "settings";

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [usersPage, setUsersPage] = useState(1);
  const [foodsPage, setFoodsPage] = useState(1);
  const [foodsFilter, setFoodsFilter] = useState<boolean | undefined>(undefined);
  const [userFilters, setUserFilters] = useState({ q: '', role: '', tier: '' });
  const [settingsDraft, setSettingsDraft] = useState<Record<string, any>>({});

  const queryClient = useQueryClient();

  // Stats queries
  const { data: _userStats } = useQuery<UserStats>({
    queryKey: ["admin", "stats", "users"],
    queryFn: getUserStats
  });

  const { data: _systemStats } = useQuery<SystemStats>({
    queryKey: ["admin", "stats", "system"],
    queryFn: getSystemStats
  });

  // Users query
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users", usersPage],
    queryFn: () => getAllUsers(usersPage, 20),
    enabled: activeTab === "users"
  });

  const userFilteredQuery = useQuery({
    queryKey: ['admin','users','filtered', userFilters, usersPage],
    queryFn: () => getAllUsersFiltered({ ...userFilters, page: usersPage, limit: 20 }),
    enabled: activeTab==='users' && !!(userFilters.q || userFilters.role || userFilters.tier)
  });

  // Foods query
  const { data: foodsData, isLoading: foodsLoading } = useQuery({
    queryKey: ["admin", "foods", foodsFilter, foodsPage],
    queryFn: () => getAdminFoodItems(foodsFilter, foodsPage, 20),
    enabled: activeTab === "foods"
  });

  // Overview extra queries
  // const { data: overviewKpis } = useQuery<OverviewKpis>({ queryKey: ['admin','overview','kpis'], queryFn: getOverviewKpis as any, enabled: activeTab === 'overview' });
  // const { data: revenueTrend } = useQuery<Array<{date:string;revenue:number;ma7:number}>>({ queryKey: ['admin','overview','revenue'], queryFn: getRevenueTrend as any, enabled: activeTab === 'overview' });
  const overviewKpisQuery = useQuery<OverviewKpis>({ queryKey: ['admin','overview','kpis'], queryFn: getOverviewKpis as any, enabled: activeTab === 'overview' });
  const revenueTrendQuery = useQuery<Array<{date:string;revenue:number;ma7:number}>>({ queryKey: ['admin','overview','revenue'], queryFn: getRevenueTrend as any, enabled: activeTab === 'overview' });
  const overviewKpis = overviewKpisQuery.data;
  const revenueTrend = revenueTrendQuery.data;

  const { data: settingsData, refetch: refetchSettings } = useQuery({ queryKey: ['admin','settings'], queryFn: getSettings, enabled: activeTab==='settings' });

  const { data: subsData, isLoading: subsLoading } = useQuery({ queryKey: ['admin','subs'], queryFn: () => listSubscriptions({ page:1, limit:50 }), enabled: activeTab==='subs' });
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({ queryKey: ['admin','tickets'], queryFn: () => listTickets({ page:1, limit:50 }), enabled: activeTab==='support' });

  // Mutations
  const roleUpdateMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: "USER" | "ADMIN" }) =>
      updateUserRole(userId, role),
    onSuccess: async () => {
      toast.success("User role updated");
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
    onError: (error) => toast.error(extractErrorMessage(error))
  });

  const verifyFoodMutation = useMutation({
    mutationFn: ({ foodId, verified }: { foodId: string; verified: boolean }) =>
      verifyFoodItem(foodId, verified),
    onSuccess: async () => {
      toast.success("Food item updated");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "foods"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "stats"] })
      ]);
    },
    onError: (error) => toast.error(extractErrorMessage(error))
  });

  const deleteFoodMutation = useMutation({
    mutationFn: (foodId: string) => deleteFoodItem(foodId),
    onSuccess: async () => {
      toast.success("Food item deleted");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "foods"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "stats"] })
      ]);
    },
    onError: (error) => toast.error(extractErrorMessage(error))
  });

  const exportMutation = useMutation({
    mutationFn: () => exportUsersCsv(userFilters),
    onSuccess: (data) => {
      // Создаём Blob для скачивания
      const blob = new Blob([data.body], { type: data.mime });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = data.filename;
      a.click();
      toast.success('CSV экспортирован');
    },
    onError: (e) => toast.error(extractErrorMessage(e))
  });

  const patchSettingsMutation = useMutation({
    mutationFn: () => patchSettings(settingsDraft),
    onSuccess: () => { toast.success('Настройки сохранены'); refetchSettings(); },
    onError: (e) => toast.error(extractErrorMessage(e))
  });

  const handleRoleChange = (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (confirm(`Change user role to ${newRole}?`)) {
      roleUpdateMutation.mutate({ userId, role: newRole });
    }
  };

  const handleVerifyFood = (foodId: string, currentVerified: boolean) => {
    verifyFoodMutation.mutate({ foodId, verified: !currentVerified });
  };

  const handleDeleteFood = (foodId: string, foodName: string) => {
    if (confirm(`Delete "${foodName}"? This action cannot be undone.`)) {
      deleteFoodMutation.mutate(foodId);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
        <div className="mx-auto max-w-7xl px-4">
          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold">Admin Panel</h1>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
            {(["overview", "users", "foods", "subs", "analytics", "support", "settings"] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {overviewKpis ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Total Users" value={overviewKpis.totalUsers} />
                  <StatCard label="Active Subs" value={overviewKpis.activeSubs} />
                  <StatCard label="MRR" value={overviewKpis.mrr} />
                  <StatCard label="DAU" value={overviewKpis.dau} />
                </div>
              ) : null}
              {revenueTrend ? (
                <div>
                  <h2 className="mb-2 text-sm font-semibold">Revenue Trend (last 30d)</h2>
                  <div className="flex gap-1 overflow-x-auto text-xs">
                    {revenueTrend.map((p:any) => (
                      <div key={p.date} className="min-w-[70px] p-1 border rounded bg-white dark:bg-gray-800">
                        <div>{p.date.slice(5)}</div>
                        <div className="font-semibold">${p.revenue}</div>
                        <div className="text-[10px] text-gray-500">MA7 {p.ma7}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {activeTab === 'subs' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Subscriptions</h2>
              {subsLoading ? <div>Loading subscriptions...</div> : (
                <div className="overflow-x-auto border rounded">
                  <table className="text-sm w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-3 py-2 text-left">User</th><th className="px-3 py-2 text-left">Plan</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Period End</th><th className="px-3 py-2 text-left">Updated</th></tr></thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {subsData?.items.map((s:any)=>(
                        <tr key={s.id}>
                          <td className="px-3 py-2">{s.user?.email}</td>
                          <td className="px-3 py-2">{s.plan}</td>
                          <td className="px-3 py-2"><span className={`px-2 py-1 rounded text-xs ${s.status==='ACTIVE'?'bg-green-100 text-green-800':'bg-gray-200'}`}>{s.status}</span></td>
                          <td className="px-3 py-2">{new Date(s.currentPeriodEnd).toLocaleDateString()}</td>
                          <td className="px-3 py-2">{new Date(s.updatedAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Analytics</h2>
              <AnalyticsPanel />
            </div>
          )}
          {activeTab === 'support' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Support Tickets</h2>
              {ticketsLoading ? <div>Loading tickets...</div> : (
                <div className="overflow-x-auto border rounded">
                  <table className="text-sm w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-3 py-2 text-left">ID</th><th className="px-3 py-2 text-left">User</th><th className="px-3 py-2 text-left">Subject</th><th className="px-3 py-2 text-left">Status</th><th className="px-3 py-2 text-left">Priority</th><th className="px-3 py-2 text-left">Assigned</th><th className="px-3 py-2 text-left">Created</th></tr></thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {ticketsData?.items.map((t:any)=>(
                        <tr key={t.id}>
                          <td className="px-3 py-2">{t.id.slice(0,8)}</td>
                          <td className="px-3 py-2">{t.user?.email || '—'}</td>
                          <td className="px-3 py-2">{t.subject}</td>
                          <td className="px-3 py-2"><span className={`px-2 py-1 rounded text-xs ${t.status==='OPEN'?'bg-red-100 text-red-800':'bg-gray-200'}`}>{t.status}</span></td>
                          <td className="px-3 py-2">{t.priority}</td>
                          <td className="px-3 py-2">{t.assignedTo || '—'}</td>
                          <td className="px-3 py-2">{new Date(t.createdAt).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Settings</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <SettingInput label="App Name" field="app.name" settingsData={settingsData} settingsDraft={settingsDraft} setSettingsDraft={setSettingsDraft} />
                <SettingInput label="Support Email" field="support.email" settingsData={settingsData} settingsDraft={settingsDraft} setSettingsDraft={setSettingsDraft} />
                <SettingToggle label="Email Notifications" field="notifications.email.enabled" settingsData={settingsData} settingsDraft={settingsDraft} setSettingsDraft={setSettingsDraft} />
                <SettingToggle label="Push Notifications" field="notifications.push.enabled" settingsData={settingsData} settingsDraft={settingsDraft} setSettingsDraft={setSettingsDraft} />
                <SettingInput label="Meta Pixel ID" field="analytics.metaPixelId" settingsData={settingsData} settingsDraft={settingsDraft} setSettingsDraft={setSettingsDraft} />
                <SettingInput label="Google Ads ID" field="analytics.googleAdsId" settingsData={settingsData} settingsDraft={settingsDraft} setSettingsDraft={setSettingsDraft} />
              </div>
              <button onClick={()=>patchSettingsMutation.mutate()} disabled={patchSettingsMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">Save</button>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">All Users</h2>
              <div className="mb-4 flex flex-wrap gap-2 items-end">
                <input placeholder="Search" value={userFilters.q} onChange={e=>setUserFilters(f=>({...f,q:e.target.value}))} className="px-2 py-1 border rounded" />
                <select value={userFilters.role} onChange={e=>setUserFilters(f=>({...f,role:e.target.value}))} className="px-2 py-1 border rounded">
                  <option value="">Role</option>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <select value={userFilters.tier} onChange={e=>setUserFilters(f=>({...f,tier:e.target.value}))} className="px-2 py-1 border rounded">
                  <option value="">Tier</option>
                  <option value="FREE">FREE</option>
                  <option value="PREMIUM">PREMIUM</option>
                </select>
                <button onClick={()=>exportMutation.mutate()} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Export CSV</button>
                <button onClick={()=>setUserFilters({ q:'', role:'', tier:'' })} className="px-3 py-1 bg-gray-200 rounded text-sm">Reset</button>
              </div>
              {/* таблица */}
              { (userFilters.q || userFilters.role || userFilters.tier) ? (
                userFilteredQuery.isLoading ? <div>Loading filtered...</div> : <UserTable usersData={userFilteredQuery.data} usersPage={usersPage} setUsersPage={setUsersPage} onRoleChange={handleRoleChange} />
              ) : (
                usersLoading ? <div className="text-center py-8">Loading users...</div> : <UserTable usersData={usersData} usersPage={usersPage} setUsersPage={setUsersPage} onRoleChange={handleRoleChange} />
              )}
            </div>
          )}

          {/* Foods Tab */}
          {activeTab === "foods" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Food Items Moderation</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFoodsFilter(undefined)}
                    className={`px-3 py-1 rounded text-sm ${
                      foodsFilter === undefined ? "bg-blue-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFoodsFilter(true)}
                    className={`px-3 py-1 rounded text-sm ${
                      foodsFilter === true ? "bg-green-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    Verified
                  </button>
                  <button
                    onClick={() => setFoodsFilter(false)}
                    className={`px-3 py-1 rounded text-sm ${
                      foodsFilter === false ? "bg-yellow-600 text-white" : "bg-gray-200"
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>

              {foodsLoading ? (
                <div className="text-center py-8">Loading food items...</div>
              ) : (
                <>
                  <div className="space-y-2">
                    {foodsData?.foods.map((food: any) => (
                      <div
                        key={food.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {food.name}
                            {food.brand && (
                              <span className="ml-2 text-sm text-gray-600">({food.brand})</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {food.category} • {food.caloriesPer100g} kcal/100g
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {food.verified ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-yellow-600" />
                          )}
                          <button
                            onClick={() => handleVerifyFood(food.id, food.verified)}
                            className="px-3 py-1 rounded text-sm bg-blue-600 text-white hover:bg-blue-700"
                          >
                            {food.verified ? "Unverify" : "Verify"}
                          </button>
                          <button
                            onClick={() => handleDeleteFood(food.id, food.name)}
                            className="p-2 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {foodsData && foodsData.pagination.totalPages > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                      <button
                        onClick={() => setFoodsPage((p) => Math.max(1, p - 1))}
                        disabled={foodsPage === 1}
                        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <span className="px-4 py-2">
                        Page {foodsPage} of {foodsData.pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setFoodsPage((p) => p + 1)}
                        disabled={foodsPage >= foodsData.pagination.totalPages}
                        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

interface StatCardProps {
  label: string;
  value: number;
  icon?: ReactNode;
}

const StatCard = ({ label, value, icon }: StatCardProps) => (
  <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      {icon}
    </div>
    <div className="text-2xl font-bold">{value.toLocaleString()}</div>
  </div>
);

// Доп. компоненты
const UserTable = ({ usersData, usersPage, setUsersPage, onRoleChange }: any) => (
  <>
    <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-left font-medium">Name</th>
            <th className="px-4 py-3 text-left font-medium">Role</th>
            <th className="px-4 py-3 text-left font-medium">Tier</th>
            <th className="px-4 py-3 text-left font-medium">Entries</th>
            <th className="px-4 py-3 text-left font-medium">Joined</th>
            <th className="px-4 py-3 text-left font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {usersData?.users?.map((user: any) => (
            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td className="px-4 py-3">{user.email}</td>
              <td className="px-4 py-3">{user.name || '—'}</td>
              <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${user.role==='ADMIN'? 'bg-red-100 text-red-800':'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>{user.role}</span></td>
              <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-medium ${user.tier==='PREMIUM'? 'bg-yellow-100 text-yellow-800':'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>{user.tier}</span></td>
              <td className="px-4 py-3">{user._count.nutrition + user._count.water + user._count.weight}</td>
              <td className="px-4 py-3">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-3"><button onClick={()=>onRoleChange(user.id, user.role)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Toggle Role</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {usersData && usersData.pagination?.totalPages > 1 && (
      <div className="mt-4 flex justify-center gap-2">
        <button onClick={()=>setUsersPage((p:number)=>Math.max(1,p-1))} disabled={usersPage===1} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">Prev</button>
        <span className="px-4 py-2">Page {usersPage} of {usersData.pagination.totalPages}</span>
        <button onClick={()=>setUsersPage((p:number)=>p+1)} disabled={usersPage>=usersData.pagination.totalPages} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50">Next</button>
      </div>
    )}
  </>
);

const SettingInput = ({ label, field, settingsData, settingsDraft, setSettingsDraft }: any) => {
  const value = settingsDraft[field] ?? settingsData?.[field] ?? '';
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input className="px-2 py-1 border rounded" value={value} onChange={e=>setSettingsDraft((d:any)=>({...d,[field]:e.target.value}))} />
    </label>
  );
};

const SettingToggle = ({ label, field, settingsData, settingsDraft, setSettingsDraft }: any) => {
  const value = settingsDraft[field] ?? settingsData?.[field] ?? false;
  return (
    <label className="flex items-center gap-2 text-sm">
      <input type="checkbox" checked={!!value} onChange={e=>setSettingsDraft((d:any)=>({...d,[field]:e.target.checked}))} />
      <span>{label}</span>
    </label>
  );
};

const AnalyticsPanel = () => {
  const kpis = useQuery({ queryKey: ['admin','analytics','kpis'], queryFn: getOverviewKpis });
  const revenue = useQuery({ queryKey: ['admin','analytics','revenue'], queryFn: getRevenueTrend });
  const newUsers = useQuery({ queryKey: ['admin','analytics','newUsers'], queryFn: () => getNewUsers(true) });
  const subsDist = useQuery({ queryKey: ['admin','analytics','subsDist'], queryFn: getSubsDistribution });
  const heatmap = useQuery({ queryKey: ['admin','analytics','heatmap'], queryFn: () => getActivityHeatmap() });
  const system = useQuery({ queryKey: ['admin','analytics','system'], queryFn: getSystemHealth });

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={kpis.data?.totalUsers ?? 0} />
        <StatCard label="Active Subs" value={kpis.data?.activeSubs ?? 0} />
        <StatCard label="MRR" value={Math.round(kpis.data?.mrr ?? 0)} />
        <StatCard label="DAU" value={kpis.data?.dau ?? 0} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded border p-4">
          <div className="mb-2 text-sm font-semibold">Revenue (last 30d)</div>
          <div className="flex gap-1 overflow-x-auto text-xs">
            {(revenue.data ?? []).map((p:any) => (
              <div key={p.date} className="min-w-[64px] p-1 border rounded bg-white dark:bg-gray-800">
                <div>{p.date.slice(5)}</div>
                <div className="font-semibold">${p.revenue}</div>
                <div className="text-[10px] text-gray-500">MA7 {p.ma7}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded border p-4">
          <div className="mb-2 text-sm font-semibold">New users (current vs prev)</div>
          <div className="flex gap-2 text-xs">
            <div className="flex-1">
              <div className="mb-1 font-semibold">Current</div>
              <div className="flex gap-1 overflow-x-auto">
                {(newUsers.data?.current ?? []).map((d:any)=> (
                  <div key={d.date} className="min-w-[50px] border rounded p-1">
                    <div>{d.date.slice(5)}</div>
                    <div className="font-semibold">{d.count}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-1 font-semibold">Prev</div>
              <div className="flex gap-1 overflow-x-auto">
                {(newUsers.data?.prev ?? []).map((d:any)=> (
                  <div key={d.date} className="min-w-[50px] border rounded p-1">
                    <div>{d.date.slice(5)}</div>
                    <div className="font-semibold">{d.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded border p-4">
          <div className="mb-2 text-sm font-semibold">Subscriptions distribution</div>
          <ul className="text-sm">
            <li>FREE: <b>{subsDist.data?.free ?? 0}</b></li>
            <li>MONTHLY: <b>{subsDist.data?.monthly ?? 0}</b></li>
            <li>QUARTERLY: <b>{subsDist.data?.quarterly ?? 0}</b></li>
            <li>ANNUAL: <b>{subsDist.data?.annual ?? 0}</b></li>
          </ul>
        </div>
        <div className="rounded border p-4">
          <div className="mb-2 text-sm font-semibold">System health</div>
          <div className="text-sm space-y-1">
            <div>DB: <b>{system.data?.db.status ?? 'unknown'}</b> ({system.data?.db.latency ?? 0} ms)</div>
            <div>Stripe: <b>{system.data?.stripe.status ?? 'unknown'}</b></div>
            <div>Redis: <b>{system.data?.redis.status ?? 'unknown'}</b></div>
          </div>
        </div>
      </div>
      <div className="rounded border p-4">
        <div className="mb-2 text-sm font-semibold">Activity heatmap (last 7d)</div>
        <div className="grid grid-cols-24 gap-1 text-[10px]">
          {Array.from({ length: 7 }).map((_,w)=> (
            <div key={w} className="col-span-24 flex gap-1">
              {Array.from({ length: 24 }).map((_,h)=>{
                const cell = (heatmap.data ?? []).find((c:any)=> c.weekday===w && c.hour===h);
                const count = cell?.count ?? 0;
                const bg = count===0? 'bg-gray-100 dark:bg-gray-800' : count<3? 'bg-emerald-200' : count<6? 'bg-emerald-400' : 'bg-emerald-600';
                return <div key={h} className={`w-3 h-3 rounded ${bg}`} title={`${w}:${h} = ${count}`} />
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
