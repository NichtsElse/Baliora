import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  Plus,
  Loader2,
  X,
  AlertTriangle,
  FolderOpen,
  ArrowUpRight,
  TrendingDown,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const CATEGORY_OPTIONS = ['Linens', 'Toiletries', 'Cleaning Supplies', 'Food & Beverage', 'Guest Amenities', 'Other'];

export default function AdminInventory() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [restockAmount, setRestockAmount] = useState(10);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form State
  const [newItem, setNewItem] = useState({
    item_name: '',
    villa_id: '',
    category: 'Toiletries',
    stock_level: 10,
    minimum_required: 5,
  });

  // Queries
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-inventory-items'],
    queryFn: () => localClient.entities.InventoryItem.list('-created_date', 100),
  });

  const { data: villas = [] } = useQuery({
    queryKey: ['admin-villas-list-inv'],
    queryFn: () => localClient.entities.VillaListing.list('name', 100),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => localClient.entities.InventoryItem.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-items'] });
      toast({
        title: 'Item Created',
        description: 'New inventory item logged successfully.',
      });
      setIsAdding(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => localClient.entities.InventoryItem.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-items'] });
      toast({
        title: 'Item Updated',
        description: 'Stock details updated.',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => localClient.entities.InventoryItem.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-inventory-items'] });
      toast({
        title: 'Item Deleted',
        description: 'Inventory item removed.',
      });
      setSelected(null);
    },
  });

  const resetForm = () => {
    setNewItem({
      item_name: '',
      villa_id: '',
      category: 'Toiletries',
      stock_level: 10,
      minimum_required: 5,
    });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const villa = villas.find((v) => v.id === newItem.villa_id);
    createMutation.mutate({
      ...newItem,
      villa_name: villa ? villa.name : 'Unknown Villa',
      stock_level: Number(newItem.stock_level),
      minimum_required: Number(newItem.minimum_required),
      last_restocked: new Date().toISOString().split('T')[0],
    });
  };

  const handleRestock = async (item) => {
    const updatedStock = (item.stock_level || 0) + Number(restockAmount);
    await updateMutation.mutateAsync({
      id: item.id,
      data: {
        stock_level: updatedStock,
        last_restocked: new Date().toISOString().split('T')[0],
      },
    });
    toast({
      title: 'Restock Success',
      description: `Added ${restockAmount} units to ${item.item_name}.`,
    });
    setSelected(null);
  };

  // Filtered items
  const filtered = items.filter((item) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      item.item_name?.toLowerCase().includes(term) ||
      item.villa_name?.toLowerCase().includes(term);
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculate low stock items
  const lowStockItems = items.filter(item => (item.stock_level || 0) < (item.minimum_required || 5));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FolderOpen className="text-amber-500" size={24} /> Villa Inventory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track toilet supplies, cleaning materials, and room linens per villa
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
        >
          <Plus size={16} /> Log Supplies
        </Button>
      </div>

      {/* Warning alert if low stock items exist */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-amber-400 font-bold text-sm">Low Stock Alert</h4>
            <p className="text-slate-400 text-xs mt-0.5">
              There are {lowStockItems.length} items currently below their safety threshold. Staff action is required to restock them.
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name or villa..."
            className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="">All Categories</SelectItem>
              {CATEGORY_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-amber-500" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            No supplies tracked in this inventory list.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Item Name</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Villa Location</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Category</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Stock Level</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Safety Minimum</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Stock Status</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((item) => {
                  const isLow = (item.stock_level || 0) < (item.minimum_required || 5);
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                      onClick={() => setSelected(item)}
                    >
                      <td className="px-6 py-4">
                        <p className="text-white text-sm font-medium">{item.item_name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">Last restocked: {item.last_restocked || '—'}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{item.villa_name}</td>
                      <td className="px-6 py-4 text-slate-300 text-sm">{item.category}</td>
                      <td className="px-6 py-4 text-white font-semibold text-sm">{item.stock_level}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{item.minimum_required}</td>
                      <td className="px-6 py-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full font-medium">
                            <TrendingDown size={10} /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full font-medium">
                            Normal
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          onClick={() => setSelected(item)}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          <Eye size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer: Detail & Restock */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-semibold text-lg font-display">Inventory Item</h2>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div>
                <label className="text-slate-500 text-xs block">Item Description</label>
                <span className="text-white text-lg font-bold block">{selected.item_name}</span>
                <span className="text-slate-400 text-xs block mt-0.5">Villa: {selected.villa_name}</span>
                <span className="text-slate-400 text-xs block mt-0.5">Category: {selected.category}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-850 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 text-xs block">Current Stock</span>
                  <span className="text-white text-2xl font-bold">{selected.stock_level}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Safety Level</span>
                  <span className="text-white text-2xl font-bold">{selected.minimum_required}</span>
                </div>
              </div>

              {/* Quick Restock Section */}
              <div className="bg-slate-800/40 p-4 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-white font-semibold text-sm flex items-center gap-1.5">
                  <ArrowUpRight className="text-green-400" size={16} /> Restock Supplies
                </h3>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min={1}
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white w-24"
                  />
                  <Button
                    onClick={() => handleRestock(selected)}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    Restock Item
                  </Button>
                </div>
              </div>

              {/* Update minimums */}
              <div className="space-y-4">
                <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Threshold Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Adjust Stock</label>
                    <Input
                      type="number"
                      value={selected.stock_level}
                      onChange={(e) => updateMutation.mutate({ id: selected.id, data: { stock_level: Number(e.target.value) } })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Minimum Required</label>
                    <Input
                      type="number"
                      value={selected.minimum_required}
                      onChange={(e) => updateMutation.mutate({ id: selected.id, data: { minimum_required: Number(e.target.value) } })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 flex gap-3">
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Delete this item from inventory?')) {
                    deleteMutation.mutate(selected.id);
                  }
                }}
                className="flex-1"
              >
                Delete Item
              </Button>
              <Button
                onClick={() => setSelected(null)}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log Supplies */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAdding(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-bold text-lg font-display">Log Villa Supplies</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Select Villa</label>
                <Select
                  value={newItem.villa_id}
                  onValueChange={(val) => setNewItem({ ...newItem, villa_id: val })}
                  required
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select a Villa" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {villas.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Item Name</label>
                <Input
                  required
                  placeholder="e.g. Bed Sheets King, Luxury Towels"
                  value={newItem.item_name}
                  onChange={(e) => setNewItem({ ...newItem, item_name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Category</label>
                <Select
                  value={newItem.category}
                  onValueChange={(val) => setNewItem({ ...newItem, category: val })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {CATEGORY_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Current Stock</label>
                  <Input
                    type="number"
                    required
                    value={newItem.stock_level}
                    onChange={(e) => setNewItem({ ...newItem, stock_level: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Safety Minimum</label>
                  <Input
                    type="number"
                    required
                    value={newItem.minimum_required}
                    onChange={(e) => setNewItem({ ...newItem, minimum_required: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  className="border-slate-700 text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
                >
                  {createMutation.isLoading && <Loader2 size={16} className="animate-spin" />}
                  Save Supplies
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
