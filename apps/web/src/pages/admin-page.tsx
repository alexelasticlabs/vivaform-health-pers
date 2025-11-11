import { useState, type ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Shield, Users, Database, TrendingUp, CheckCircle, XCircle, Trash2 } from "lucide-react";

import {
  getAllUsers,
  getUserStats,
  getSystemStats,
  updateUserRole,
  getAdminFoodItems,
  verifyFoodItem,
  deleteFoodItem,
  extractErrorMessage,
  type AdminUser,
  type UserStats,
  type SystemStats
} from "../api";

type TabType = "overview" | "users" | "foods";

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [usersPage, setUsersPage] = useState(1);
  const [foodsPage, setFoodsPage] = useState(1);
  const [foodsFilter, setFoodsFilter] = useState<boolean | undefined>(undefined);

  const queryClient = useQueryClient();

  // Stats queries
  const { data: userStats } = useQuery<UserStats>({
    queryKey: ["admin", "stats", "users"],
    queryFn: getUserStats
  });

  const { data: systemStats } = useQuery<SystemStats>({
    queryKey: ["admin", "stats", "system"],
    queryFn: getSystemStats
  });

  // Users query
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin", "users", usersPage],
    queryFn: () => getAllUsers(usersPage, 20),
    enabled: activeTab === "users"
  });

  // Foods query
  const { data: foodsData, isLoading: foodsLoading } = useQuery({
    queryKey: ["admin", "foods", foodsFilter, foodsPage],
    queryFn: () => getAdminFoodItems(foodsFilter, foodsPage, 20),
    enabled: activeTab === "foods"
  });

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-gray-200 dark:border-gray-700">
          {(["overview", "users", "foods"] as TabType[]).map((tab) => (
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
            {/* User Stats */}
            <div>
              <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Statistics
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard
                  label="Total Users"
                  value={userStats?.totalUsers ?? 0}
                  icon={<Users className="h-5 w-5 text-blue-600" />}
                />
                <StatCard
                  label="Free Users"
                  value={userStats?.freeUsers ?? 0}
                  icon={<Users className="h-5 w-5 text-gray-600" />}
                />
                <StatCard
                  label="Premium Users"
                  value={userStats?.premiumUsers ?? 0}
                  icon={<Users className="h-5 w-5 text-yellow-600" />}
                />
                <StatCard
                  label="Active Today"
                  value={userStats?.activeToday ?? 0}
                  icon={<TrendingUp className="h-5 w-5 text-green-600" />}
                />
                <StatCard
                  label="New This Week"
                  value={userStats?.newThisWeek ?? 0}
                  icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
                />
              </div>
            </div>

            {/* System Stats */}
            <div>
              <h2 className="mb-4 text-xl font-semibold flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Statistics
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard label="Nutrition Entries" value={systemStats?.nutritionEntries ?? 0} />
                <StatCard label="Water Entries" value={systemStats?.waterEntries ?? 0} />
                <StatCard label="Weight Entries" value={systemStats?.weightEntries ?? 0} />
                <StatCard label="Recommendations" value={systemStats?.recommendations ?? 0} />
                <StatCard label="Food Items" value={systemStats?.foodItems ?? 0} />
                <StatCard label="Meal Templates" value={systemStats?.mealTemplates ?? 0} />
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div>
            <h2 className="mb-4 text-xl font-semibold">All Users</h2>
            {usersLoading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : (
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
                      {usersData?.users.map((user: AdminUser) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-3">{user.email}</td>
                          <td className="px-4 py-3">{user.name || "—"}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                user.role === "ADMIN"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                user.tier === "PREMIUM"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                              }`}
                            >
                              {user.tier}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {user._count.nutrition + user._count.water + user._count.weight}
                          </td>
                          <td className="px-4 py-3">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleRoleChange(user.id, user.role)}
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              Toggle Role
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {usersData && usersData.pagination.totalPages > 1 && (
                  <div className="mt-4 flex justify-center gap-2">
                    <button
                      onClick={() => setUsersPage((p) => Math.max(1, p - 1))}
                      disabled={usersPage === 1}
                      className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {usersPage} of {usersData.pagination.totalPages}
                    </span>
                    <button
                      onClick={() => setUsersPage((p) => p + 1)}
                      disabled={usersPage >= usersData.pagination.totalPages}
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