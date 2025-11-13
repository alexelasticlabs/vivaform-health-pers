import { useState, useEffect, type ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'search' | 'select' | 'date';
  options?: { label: string; value: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
  onReset: () => void;
  debounceMs?: number;
  actions?: ReactNode;
}

export function FilterBar({
  filters,
  values,
  onChange,
  onReset,
  debounceMs = 500,
  actions
}: FilterBarProps) {
  const [localValues, setLocalValues] = useState(values);

  useEffect(() => {
    setLocalValues(values);
  }, [values]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (JSON.stringify(localValues) !== JSON.stringify(values)) {
        onChange(localValues);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localValues, debounceMs, onChange, values]);

  const handleChange = (key: string, value: string) => {
    setLocalValues(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = Object.values(values).some(v => v && v !== '');

  return (
    <div className="flex flex-wrap items-end gap-3">
      {filters.map(filter => {
        if (filter.type === 'search') {
          return (
            <div key={filter.key} className="flex-1 min-w-[200px]">
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {filter.label}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <Input
                  placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                  value={localValues[filter.key] || ''}
                  onChange={(e) => handleChange(filter.key, e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          );
        }

        if (filter.type === 'select') {
          return (
            <div key={filter.key} className="min-w-[150px]">
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {filter.label}
              </label>
              <Select
                value={localValues[filter.key] || ''}
                onValueChange={(value) => handleChange(filter.key, value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={filter.placeholder || filter.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {filter.options?.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        if (filter.type === 'date') {
          return (
            <div key={filter.key} className="min-w-[150px]">
              <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {filter.label}
              </label>
              <Input
                type="date"
                value={localValues[filter.key] || ''}
                onChange={(e) => handleChange(filter.key, e.target.value)}
              />
            </div>
          );
        }

        return null;
      })}

      {hasActiveFilters && (
        <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
          <X className="h-4 w-4" />
          Clear Filters
        </Button>
      )}

      {actions && <div className="ml-auto">{actions}</div>}
    </div>
  );
}

