import { type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  actions: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive';
    disabled?: boolean;
  }[];
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  actions
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950">
      <CardContent className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={allSelected}
            onCheckedChange={allSelected ? onDeselectAll : onSelectAll}
          />
          <span className="text-sm font-medium">
            {selectedCount} {selectedCount === 1 ? 'item' : 'items'} selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className="gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
          <Button variant="ghost" size="sm" onClick={onDeselectAll}>
            Clear Selection
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

