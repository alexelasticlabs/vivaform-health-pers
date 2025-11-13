import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Settings as SettingsIcon, Save, RotateCcw } from 'lucide-react';
import { getSettings, patchSettings, extractErrorMessage } from '@/api/admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function AdminSettingsPage() {
  const [draft, setDraft] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: getSettings,
  });

  useEffect(() => {
    if (settings) {
      setDraft(settings);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => patchSettings(draft),
    onSuccess: () => {
      toast.success('Settings saved successfully');
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (error) => toast.error(extractErrorMessage(error)),
  });

  const handleChange = (path: string, value: any) => {
    setDraft((prev) => {
      const newDraft = { ...prev };
      const keys = path.split('.');
      let current: any = newDraft;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newDraft;
    });
  };

  const getValue = (path: string) => {
    const keys = path.split('.');
    let current: any = draft;
    for (const key of keys) {
      if (current === undefined || current === null) return '';
      current = current[key];
    }
    return current ?? '';
  };

  const handleReset = () => {
    if (settings) {
      setDraft(settings);
      toast.info('Settings reset to saved values');
    }
  };

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(settings);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Configure application settings
          </p>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-neutral-600 dark:text-neutral-400">
            Configure application settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={!hasChanges || saveMutation.isPending}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Application
          </CardTitle>
          <CardDescription>
            Basic application configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                App Name
              </label>
              <Input
                value={getValue('app.name')}
                onChange={(e) => handleChange('app.name', e.target.value)}
                placeholder="VivaForm"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Support Email
              </label>
              <Input
                type="email"
                value={getValue('support.email')}
                onChange={(e) => handleChange('support.email', e.target.value)}
                placeholder="support@vivaform.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Configure email notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">
                Enable Email Notifications
              </label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Send email notifications to users
              </p>
            </div>
            <input
              type="checkbox"
              checked={!!getValue('notifications.email.enabled')}
              onChange={(e) => handleChange('notifications.email.enabled', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">
                Weekly Digest
              </label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Send weekly progress digests
              </p>
            </div>
            <input
              type="checkbox"
              checked={!!getValue('notifications.email.weeklyDigest')}
              onChange={(e) => handleChange('notifications.email.weeklyDigest', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Configure push notification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">
                Enable Push Notifications
              </label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Allow push notifications to mobile devices
              </p>
            </div>
            <input
              type="checkbox"
              checked={!!getValue('notifications.push.enabled')}
              onChange={(e) => handleChange('notifications.push.enabled', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
          </div>
        </CardContent>
      </Card>

      {/* Analytics Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics & Tracking</CardTitle>
          <CardDescription>
            Configure analytics and tracking integrations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Meta Pixel ID
              </label>
              <Input
                value={getValue('analytics.metaPixelId')}
                onChange={(e) => handleChange('analytics.metaPixelId', e.target.value)}
                placeholder="123456789012345"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">
                Google Ads ID
              </label>
              <Input
                value={getValue('analytics.googleAdsId')}
                onChange={(e) => handleChange('analytics.googleAdsId', e.target.value)}
                placeholder="AW-123456789"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">
              Google Analytics ID
            </label>
            <Input
              value={getValue('analytics.googleAnalyticsId')}
              onChange={(e) => handleChange('analytics.googleAnalyticsId', e.target.value)}
              placeholder="G-XXXXXXXXXX"
            />
          </div>
        </CardContent>
      </Card>

      {/* Feature Flags */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
          <CardDescription>
            Enable or disable specific features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">
                Meal Planner
              </label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Enable meal planning feature
              </p>
            </div>
            <input
              type="checkbox"
              checked={!!getValue('features.mealPlanner')}
              onChange={(e) => handleChange('features.mealPlanner', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">
                AI Recommendations
              </label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Enable AI-powered recommendations
              </p>
            </div>
            <input
              type="checkbox"
              checked={!!getValue('features.aiRecommendations')}
              onChange={(e) => handleChange('features.aiRecommendations', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">
                Social Sharing
              </label>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Allow users to share their progress
              </p>
            </div>
            <input
              type="checkbox"
              checked={!!getValue('features.socialSharing')}
              onChange={(e) => handleChange('features.socialSharing', e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

