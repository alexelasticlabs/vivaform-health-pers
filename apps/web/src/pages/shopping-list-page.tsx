/**
 * Shopping List Page
 * Smart shopping list generated from meal plans and recipes
 */

import React, { useState } from 'react';
import { Plus, X, Check, ShoppingCart, Printer, Share2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/dashboard-utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ShoppingItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
  checked: boolean;
  addedBy?: string; // recipe name or manual
}

export const ShoppingListPage: React.FC = () => {
  const [items, setItems] = useState<ShoppingItem[]>([
    { id: '1', name: 'Oats', amount: 500, unit: 'g', category: 'Grains', checked: false, addedBy: 'High-Protein Oatmeal' },
    { id: '2', name: 'Chicken breast', amount: 800, unit: 'g', category: 'Meat', checked: false, addedBy: 'Grilled Chicken Salad' },
    { id: '3', name: 'Eggs', amount: 12, unit: 'pcs', category: 'Dairy', checked: false, addedBy: 'Keto Avocado Toast' },
    { id: '4', name: 'Avocado', amount: 3, unit: 'pcs', category: 'Produce', checked: false, addedBy: 'Keto Avocado Toast' },
    { id: '5', name: 'Almond milk', amount: 1, unit: 'L', category: 'Dairy', checked: false, addedBy: 'High-Protein Oatmeal' },
    { id: '6', name: 'Mixed greens', amount: 200, unit: 'g', category: 'Produce', checked: true },
    { id: '7', name: 'Protein powder', amount: 1, unit: 'kg', category: 'Supplements', checked: false },
  ]);

  const [newItemName, setNewItemName] = useState('');

  const categories = ['Produce', 'Meat', 'Dairy', 'Grains', 'Supplements', 'Other'];

  const toggleItem = (id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const addItem = () => {
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      amount: 1,
      unit: 'pcs',
      category: 'Other',
      checked: false,
    };

    setItems((prev) => [...prev, newItem]);
    setNewItemName('');
  };

  const clearChecked = () => {
    setItems((prev) => prev.filter((item) => !item.checked));
  };

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = items.filter((item) => item.category === category);
    return acc;
  }, {} as Record<string, ShoppingItem[]>);

  const totalItems = items.length;
  const checkedItems = items.filter((i) => i.checked).length;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-emerald-950/10">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-white">Shopping List 🛒</h1>
          <p className="text-slate-600 dark:text-slate-400">Your personalized grocery list from meal plans</p>
        </div>

        {/* Progress bar */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Shopping Progress</span>
            <span className="text-sm font-semibold text-emerald-600">
              {checkedItems} / {totalItems} items
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-wrap gap-3">
          <Button variant="outline" className="gap-2">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" className="gap-2" onClick={clearChecked} disabled={checkedItems === 0}>
            <Trash2 className="h-4 w-4" />
            Clear Checked
          </Button>
        </div>

        {/* Add new item */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex gap-2">
            <Input
              placeholder="Add new item..."
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addItem()}
            />
            <Button onClick={addItem} disabled={!newItemName.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Shopping list by category */}
        <div className="space-y-4">
          {categories.map((category) => {
            const categoryItems = groupedItems[category];
            if (!categoryItems || categoryItems.length === 0) return null;

            return (
              <div
                key={category}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                {/* Category header */}
                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white">{category}</h3>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {categoryItems.filter((i) => i.checked).length} / {categoryItems.length}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="divide-y divide-slate-200 dark:divide-slate-800">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50',
                        item.checked && 'opacity-50'
                      )}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleItem(item.id)}
                        className={cn(
                          'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all',
                          item.checked
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-slate-300 hover:border-emerald-500 dark:border-slate-700'
                        )}
                      >
                        {item.checked && <Check className="h-4 w-4 text-white" />}
                      </button>

                      {/* Item details */}
                      <div className="flex-1">
                        <div className={cn('font-medium', item.checked && 'line-through')}>
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <span>
                            {item.amount} {item.unit}
                          </span>
                          {item.addedBy && (
                            <>
                              <span>•</span>
                              <span className="text-xs">from {item.addedBy}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="flex-shrink-0 rounded p-1 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/30"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {totalItems === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-slate-300 dark:text-slate-700" />
            <p className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">Your shopping list is empty</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Add items manually or from your meal plans</p>
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 rounded-xl bg-blue-50 p-4 dark:bg-blue-950/20">
          <h4 className="mb-2 font-bold text-blue-900 dark:text-blue-200">💡 Pro Tips</h4>
          <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-300">
            <li>• Items from recipes are automatically added to your shopping list</li>
            <li>• Quantities are combined when the same item appears multiple times</li>
            <li>• Share your list with family members or roommates</li>
            <li>• Check off items as you shop to track your progress</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
