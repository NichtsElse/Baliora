import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DollarSign,
  Loader2,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { localClient } from '@/api/localClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

import { useLocation } from 'react-router-dom';

export default function AdminPricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const location = useLocation();
  const preselectedId = location.state?.villaId;
  const [selectedVillaId, setSelectedVillaId] = useState(preselectedId || null);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [newRule, setNewRule] = useState({
    rule_name: '',
    start_date: '',
    end_date: '',
    rate_type: 'multiplier',
    value: 1.0,
  });

  // Fetch Villas
  const { data: villas = [], isLoading: isLoadingVillas } = useQuery({
    queryKey: ['admin-villas-pricing'],
    queryFn: () => localClient.entities.VillaListing.list('name', 100),
    onSuccess: (data) => {
      if (data.length > 0 && !selectedVillaId) {
        setSelectedVillaId(preselectedId || data[0].id);
      }
    },
  });

  // Selected Villa Object
  const activeVillaId = selectedVillaId || (villas.length > 0 ? villas[0].id : null);
  const selectedVilla = villas.find((v) => v.id === activeVillaId);

  // Fetch Pricing Rules
  const { data: rules = [], isLoading: isLoadingRules } = useQuery({
    queryKey: ['admin-pricing-rules'],
    queryFn: () => localClient.entities.VillaPricingRule.list('-created_date', 200),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => localClient.entities.VillaPricingRule.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricing-rules'] });
      toast({
        title: 'Rule Created',
        description: 'Seasonal pricing rule has been added successfully.',
      });
      setIsAdding(false);
      setNewRule({
        rule_name: '',
        start_date: '',
        end_date: '',
        rate_type: 'multiplier',
        value: 1.0,
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create rule',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => localClient.entities.VillaPricingRule.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricing-rules'] });
      toast({
        title: 'Rule Deleted',
        description: 'Pricing rule has been removed.',
      });
    },
    onError: (err) => {
      toast({
        title: 'Delete Failed',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoadingVillas) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  const activeRules = rules.filter((r) => r.villa_id === activeVillaId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedVilla) return;

    // Date Validations
    const start = new Date(newRule.start_date);
    const end = new Date(newRule.end_date);
    if (end <= start) {
      toast({
        title: 'Invalid Dates',
        description: 'End date must be strictly after the start date.',
        variant: 'destructive',
      });
      return;
    }

    // Check for overlap
    const hasOverlap = activeRules.some((rule) => {
      const ruleStart = new Date(rule.start_date);
      const ruleEnd = new Date(rule.end_date);
      return start <= ruleEnd && end >= ruleStart;
    });

    if (hasOverlap) {
      if (!confirm('Warning: This stay range overlaps with another active rule. Continue anyway?')) {
        return;
      }
    }

    createMutation.mutate({
      ...newRule,
      villa_id: selectedVilla.id,
      villa_name: selectedVilla.name,
      value: Number(newRule.value),
    });
  };

  const calculatePreview = (base, type, value) => {
    if (type === 'multiplier') {
      return base * value;
    }
    return value;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <DollarSign className="text-amber-500" size={24} /> Seasonal & Special Pricing
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Set up rate adjustments for high seasons, holidays, or promotional weekend periods
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Villa List */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Select Villa
          </h2>
          {villas.map((villa) => {
            const count = rules.filter((r) => r.villa_id === villa.id).length;
            return (
              <button
                key={villa.id}
                onClick={() => setSelectedVillaId(villa.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                  activeVillaId === villa.id
                    ? 'bg-amber-600/10 border border-amber-500/30 text-white font-medium'
                    : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {villa.name}
                <span className="block text-xs text-slate-500 font-normal mt-0.5">
                  Base: ${villa.price_per_night?.toLocaleString()}/night
                  {count > 0 && ` • ${count} custom rules`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: Pricing Rules Dashboard */}
        <div className="lg:col-span-3 space-y-6">
          {selectedVilla ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              {/* Selected Villa Banner */}
              <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-amber-500 text-xs font-semibold uppercase tracking-wider">
                    Managing Overrides For:
                  </span>
                  <h2 className="text-white text-xl font-bold mt-0.5">{selectedVilla.name}</h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Standard Base Price: <strong className="text-slate-300">${selectedVilla.price_per_night?.toLocaleString()} USD</strong> / night
                  </p>
                </div>
                <Button
                  onClick={() => setIsAdding(true)}
                  className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 self-start md:self-auto"
                >
                  <Plus size={16} /> Add Pricing Rule
                </Button>
              </div>

              {/* Rules List */}
              {isLoadingRules ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-amber-500" size={24} />
                </div>
              ) : activeRules.length === 0 ? (
                <div className="text-center py-16 bg-slate-950/20 border border-slate-850 rounded-xl text-slate-500 space-y-1">
                  <Calendar className="mx-auto text-slate-700 mb-2" size={32} />
                  <p className="text-sm font-medium text-slate-400">No active pricing rules</p>
                  <p className="text-xs">Standard base rates apply to all reservations.</p>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-850 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-850 text-xs text-slate-500 font-semibold uppercase">
                        <th className="px-6 py-4">Rule Name</th>
                        <th className="px-6 py-4">Stay Dates</th>
                        <th className="px-6 py-4">Rate Adjustment</th>
                        <th className="px-6 py-4">Adjusted Rate</th>
                        <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 text-sm">
                      {activeRules.map((rule) => {
                        const base = selectedVilla.price_per_night || 0;
                        const adjusted = calculatePreview(base, rule.rate_type, rule.value);
                        return (
                          <tr key={rule.id} className="hover:bg-slate-900/40">
                            <td className="px-6 py-4 text-white font-medium">{rule.rule_name}</td>
                            <td className="px-6 py-4 text-slate-400">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} className="text-slate-650" />
                                {rule.start_date} to {rule.end_date}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {rule.rate_type === 'multiplier' ? (
                                <span className="text-blue-400 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-xs font-medium">
                                  {rule.value}x Multiplier
                                </span>
                              ) : (
                                <span className="text-green-400 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full text-xs font-medium">
                                  Fixed ${rule.value}/night
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-white font-bold">${adjusted?.toLocaleString()}</span>
                              <span className="text-slate-500 text-xs block mt-0.5">
                                Base: ${base}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm('Delete this seasonal rate?')) {
                                    deleteMutation.mutate(rule.id);
                                  }
                                }}
                                className="text-slate-500 hover:text-rose-400 w-8 h-8 p-0"
                              >
                                <Trash2 size={15} />
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
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center text-slate-500">
              <HelpCircle className="mx-auto text-slate-700 mb-3" size={36} />
              No villa selected. Create a villa first to manage seasonal rates.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add Pricing Rule */}
      {isAdding && selectedVilla && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAdding(false)} />
          <div className="relative bg-slate-900 border border-slate-850 rounded-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-bold text-lg font-display">New Pricing Rule</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="bg-amber-600/5 border border-amber-500/20 p-3 rounded-lg flex gap-2">
                <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                <p className="text-[11px] text-amber-400 leading-normal">
                  Adjustments will override the standard base rate of <strong>${selectedVilla.price_per_night} USD</strong> during the specified range.
                </p>
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Rule Name</label>
                <Input
                  required
                  placeholder="e.g. Christmas Peak, Summer High Season"
                  value={newRule.rule_name}
                  onChange={(e) => setNewRule({ ...newRule, rule_name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Start Date</label>
                  <Input
                    required
                    type="date"
                    value={newRule.start_date}
                    onChange={(e) => setNewRule({ ...newRule, start_date: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">End Date</label>
                  <Input
                    required
                    type="date"
                    value={newRule.end_date}
                    onChange={(e) => setNewRule({ ...newRule, end_date: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Adjustment Type</label>
                  <Select
                    value={newRule.rate_type}
                    onValueChange={(val) => setNewRule({ ...newRule, rate_type: val, value: val === 'multiplier' ? 1.0 : selectedVilla.price_per_night })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="multiplier">Multiplier (e.g. 1.25x)</SelectItem>
                      <SelectItem value="fixed">Fixed Rate ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">
                    {newRule.rate_type === 'multiplier' ? 'Multiplier Value' : 'Nightly Price ($)'}
                  </label>
                  <Input
                    required
                    type="number"
                    step={newRule.rate_type === 'multiplier' ? '0.05' : '1'}
                    value={newRule.value}
                    onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Adjustment Preview */}
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Estimated Override Preview</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-slate-400 text-sm">Adjusted nightly price:</span>
                  <span className="text-white text-lg font-bold">
                    ${calculatePreview(selectedVilla.price_per_night || 0, newRule.rate_type, newRule.value)?.toLocaleString()} USD
                  </span>
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
                  className="bg-amber-600 hover:bg-amber-500 text-white"
                >
                  Add Override
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
