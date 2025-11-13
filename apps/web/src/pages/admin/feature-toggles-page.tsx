import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ToggleRight, Plus, Loader2, AlertCircle } from 'lucide-react';
import { adminApi } from '@/api/admin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { FeatureToggleDto } from '@vivaform/shared';

export function FeatureTogglesPage() {
  const queryClient = useQueryClient();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [formData, setFormData] = useState<{ enabled: boolean; rolloutPercent: number; description: string }>({
    enabled: false,
    rolloutPercent: 0,
    description: '',
  });

  const { data: toggles, isLoading, error } = useQuery({
    queryKey: ['admin', 'feature-toggles'],
    queryFn: adminApi.listFeatureToggles,
  });

  const updateMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: any }) => adminApi.updateFeatureToggle(key, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feature-toggles'] });
      toast.success('Feature toggle updated');
      setEditingKey(null);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update toggle');
    },
  });

  const handleEdit = (toggle: FeatureToggleDto) => {
    setEditingKey(toggle.key);
    setFormData({
      enabled: toggle.enabled,
      rolloutPercent: toggle.rolloutPercent,
      description: toggle.description || '',
    });
  };

  const handleSave = (key: string) => {
    updateMutation.mutate({ key, data: formData });
  };

  const handleCancel = () => {
    setEditingKey(null);
  };

  const handleQuickToggle = (key: string, enabled: boolean) => {
    updateMutation.mutate({ key, data: { enabled: !enabled } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-muted-foreground">Failed to load feature toggles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feature Toggles</h1>
          <p className="text-muted-foreground mt-1">Manage feature flags and A/B tests</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Toggle
        </Button>
      </div>

      <div className="grid gap-4">
        {toggles && toggles.length === 0 && (
          <Card className="p-8 text-center">
            <ToggleRight className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No feature toggles yet</h3>
            <p className="text-muted-foreground mb-4">Create your first feature toggle to start managing features</p>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Toggle
            </Button>
          </Card>
        )}

        {toggles?.map((toggle: FeatureToggleDto) => (
          <Card key={toggle.key} className="p-6">
            {editingKey === toggle.key ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Key</label>
                  <Input value={toggle.key} disabled className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe this feature toggle"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.enabled}
                      onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm">Enabled</label>
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium">Rollout %</label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={formData.rolloutPercent}
                      onChange={(e) =>
                        setFormData({ ...formData, rolloutPercent: parseInt(e.target.value) || 0 })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSave(toggle.key)}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{toggle.key}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        toggle.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {toggle.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                    {toggle.rolloutPercent > 0 && toggle.rolloutPercent < 100 && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {toggle.rolloutPercent}% rollout
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{toggle.description || 'No description'}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Updated: {new Date(toggle.updatedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickToggle(toggle.key, toggle.enabled)}
                    disabled={updateMutation.isPending}
                  >
                    {toggle.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(toggle)}>
                    Edit
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

