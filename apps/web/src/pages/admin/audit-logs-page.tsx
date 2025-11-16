import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText, Loader2, AlertCircle, Filter } from 'lucide-react';
import { adminApi } from '@/api/admin';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AuditLogDto } from '@vivaform/shared';

export function AuditLogsPage() {
  const [filters, setFilters] = useState({ action: '', entity: '', userId: '', page: 1 });

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'audit-logs', filters],
    queryFn: () => adminApi.getAuditLogs(filters),
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
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
          <p className="text-muted-foreground">Failed to load audit logs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Track admin actions and changes</p>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold">Filters</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Action</label>
            <Input
              placeholder="e.g. user.updated"
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Entity</label>
            <Input
              placeholder="e.g. user, quiz"
              value={filters.entity}
              onChange={(e) => handleFilterChange('entity', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">User ID</label>
            <Input
              placeholder="Filter by user ID"
              value={filters.userId}
              onChange={(e) => handleFilterChange('userId', e.target.value)}
            />
          </div>
        </div>
      </Card>

      {data && data.logs.length === 0 ? (
        <Card className="p-8 text-center">
          <ScrollText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No audit logs found</h3>
          <p className="text-muted-foreground">Try adjusting your filters</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {data?.logs.map((log: AuditLogDto) => (
            <Card key={log.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="px-2 py-0.5 rounded text-xs font-mono bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {log.targetType} {log.targetId && `#${log.targetId.slice(0, 8)}`}
                    </span>
                  </div>
                  <p className="text-sm">
                    Actor: <span className="font-medium">{log.actorEmail || log.actorId || 'System'}</span>
                  </p>
                  {log.meta && Object.keys(log.meta).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                        View metadata
                      </summary>
                      <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === 1}
            onClick={() => handlePageChange(filters.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {filters.page} of {data.pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={filters.page === data.pages}
            onClick={() => handlePageChange(filters.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

