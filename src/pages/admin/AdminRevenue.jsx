/**
 * Purpose: Tracks owner revenue per villa per month — net payout, fees, occupancy.
 * Used by: /admin/owners/revenue route.
 * Main dependencies: localClient, React Query, lucide-react.
 * Public functions: AdminRevenue default export.
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import {
  DollarSign, TrendingUp, Plus, X, Save, Loader2,
  CheckCircle, Clock, Home, BarChart3
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const PAYMENT_STATUS = {
  paid:    { label: 'Paid',    cls: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle },
  pending: { label: 'Pending', cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
};

const fmt = (n) => `$${Number(n || 0).toLocaleString()}`;

const EMPTY_FORM = {
  owner_name: '', villa_name: '', period_month: '',
  gross_revenue: '', management_fee: '', net_payout: '',
  occupancy_rate: '', nights_booked: '',
  payment_status: 'pending', payment_date: '',
};
const cls = 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50';

export default function AdminRevenue() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => localClient.entities.OwnerRevenueEntry.list('-period_month', 200),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => localClient.entities.OwnerRevenueEntry.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-revenue'] });
      setShowForm(false);
      setForm(EMPTY_FORM);
      toast({ title: 'Revenue entry added' });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ id }) => localClient.entities.OwnerRevenueEntry.update(id, {
      payment_status: 'paid', payment_date: new Date().toISOString().split('T')[0],
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-revenue'] });
      toast({ title: 'Marked as paid' });
    },
  });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const owners = [...new Set(entries.map(e => e.owner_name))];

  const filtered = entries.filter(e => {
    const matchOwner = ownerFilter === 'all' || e.owner_name === ownerFilter;
    const matchStatus = statusFilter === 'all' || e.payment_status === statusFilter;
    return matchOwner && matchStatus;
  });

  // Aggregated totals
  const totalGross = filtered.reduce((s, e) => s + Number(e.gross_revenue || 0), 0);
  const totalNet = filtered.reduce((s, e) => s + Number(e.net_payout || 0), 0);
  const totalFees = filtered.reduce((s, e) => s + Number(e.management_fee || 0), 0);
  const pendingPayout = filtered.filter(e => e.payment_status === 'pending').reduce((s, e) => s + Number(e.net_payout || 0), 0);

  // Group by owner for the summary cards
  const byOwner = owners.map(name => {
    const ownerEntries = entries.filter(e => e.owner_name === name);
    return {
      name,
      villa_name: ownerEntries[0]?.villa_name || '—',
      total_gross: ownerEntries.reduce((s, e) => s + Number(e.gross_revenue || 0), 0),
      total_net: ownerEntries.reduce((s, e) => s + Number(e.net_payout || 0), 0),
      pending: ownerEntries.filter(e => e.payment_status === 'pending').reduce((s, e) => s + Number(e.net_payout || 0), 0),
      months: ownerEntries.length,
    };
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <DollarSign className="text-amber-500" size={24} /> Revenue Ledger
          </h1>
          <p className="text-slate-500 text-sm mt-1">Monthly owner payout tracker per villa</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Entry
        </button>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Gross (filtered)', value: fmt(totalGross), icon: BarChart3, color: 'text-blue-400' },
          { label: 'Total Net Payout', value: fmt(totalNet), icon: TrendingUp, color: 'text-green-400' },
          { label: 'Management Fees', value: fmt(totalFees), icon: DollarSign, color: 'text-amber-400' },
          { label: 'Pending Payouts', value: fmt(pendingPayout), icon: Clock, color: 'text-orange-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon size={15} className={color} />
              <p className="text-slate-500 text-xs">{label}</p>
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Owner Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {byOwner.map(o => (
          <div key={o.name}
            onClick={() => setOwnerFilter(ownerFilter === o.name ? 'all' : o.name)}
            className={`bg-slate-900 border rounded-xl p-5 cursor-pointer transition-all ${ownerFilter === o.name ? 'border-amber-500/50 bg-amber-600/5' : 'border-slate-800 hover:border-slate-700'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-amber-600/20 flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400 font-bold text-sm">{o.name[0]}</span>
              </div>
              <div>
                <p className="text-white font-medium text-sm">{o.name}</p>
                <p className="text-slate-500 text-xs flex items-center gap-1"><Home size={10} /> {o.villa_name}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-green-400 font-bold text-sm">{fmt(o.total_net)}</p>
                <p className="text-slate-600 text-xs">Net paid</p>
              </div>
              <div>
                <p className="text-orange-400 font-bold text-sm">{fmt(o.pending)}</p>
                <p className="text-slate-600 text-xs">Pending</p>
              </div>
              <div>
                <p className="text-slate-300 font-bold text-sm">{o.months}mo</p>
                <p className="text-slate-600 text-xs">Records</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setOwnerFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${ownerFilter === 'all' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
          All Owners
        </button>
        {owners.map(o => (
          <button key={o} onClick={() => setOwnerFilter(ownerFilter === o ? 'all' : o)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${ownerFilter === o ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {o}
          </button>
        ))}
        <div className="border-l border-slate-700 mx-1" />
        {['all', 'paid', 'pending'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
            {s === 'all' ? 'All Status' : s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Month', 'Owner', 'Villa', 'Gross', 'Fee', 'Net Payout', 'Occupancy', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-slate-500 text-xs font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-12"><Loader2 className="animate-spin text-amber-500 mx-auto" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-slate-500">No entries found</td></tr>
              ) : filtered.map(e => {
                const psCfg = PAYMENT_STATUS[e.payment_status] || PAYMENT_STATUS.pending;
                const Icon = psCfg.icon;
                return (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-300 text-sm tabular-nums">{e.period_month}</td>
                    <td className="px-4 py-3 text-white text-sm font-medium">{e.owner_name}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{e.villa_name}</td>
                    <td className="px-4 py-3 text-slate-300 text-sm tabular-nums">{fmt(e.gross_revenue)}</td>
                    <td className="px-4 py-3 text-slate-500 text-sm tabular-nums">{fmt(e.management_fee)}</td>
                    <td className="px-4 py-3 text-green-400 font-semibold text-sm tabular-nums">{fmt(e.net_payout)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${e.occupancy_rate || 0}%` }} />
                        </div>
                        <span className="text-slate-400 text-xs">{e.occupancy_rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-0.5 border rounded-full flex items-center gap-1 w-fit ${psCfg.cls}`}>
                        <Icon size={10} /> {psCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {e.payment_status === 'pending' && (
                        <button onClick={() => markPaidMutation.mutate({ id: e.id })}
                          disabled={markPaidMutation.isPending}
                          className="text-xs px-3 py-1 bg-green-600/20 border border-green-600/30 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors disabled:opacity-50">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-700 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 flex-shrink-0">
              <h2 className="text-white font-semibold">Add Revenue Entry</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={e => {
              e.preventDefault();
              saveMutation.mutate({
                ...form,
                gross_revenue: Number(form.gross_revenue),
                management_fee: Number(form.management_fee),
                net_payout: Number(form.net_payout),
                occupancy_rate: Number(form.occupancy_rate),
                nights_booked: Number(form.nights_booked),
              });
            }} className="p-5 space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Owner Name *</Label>
                  <Input required value={form.owner_name} onChange={e => set('owner_name', e.target.value)} placeholder="Name" className={cls} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Villa Name *</Label>
                  <Input required value={form.villa_name} onChange={e => set('villa_name', e.target.value)} placeholder="Villa" className={cls} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Period Month (YYYY-MM) *</Label>
                <Input required value={form.period_month} onChange={e => set('period_month', e.target.value)} placeholder="2026-06" className={cls} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Gross ($)</Label>
                  <Input type="number" value={form.gross_revenue} onChange={e => set('gross_revenue', e.target.value)} placeholder="0" className={cls} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Mgmt Fee ($)</Label>
                  <Input type="number" value={form.management_fee} onChange={e => set('management_fee', e.target.value)} placeholder="0" className={cls} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Net Payout ($)</Label>
                  <Input type="number" value={form.net_payout} onChange={e => set('net_payout', e.target.value)} placeholder="0" className={cls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Occupancy %</Label>
                  <Input type="number" min="0" max="100" value={form.occupancy_rate} onChange={e => set('occupancy_rate', e.target.value)} placeholder="0" className={cls} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Nights Booked</Label>
                  <Input type="number" value={form.nights_booked} onChange={e => set('nights_booked', e.target.value)} placeholder="0" className={cls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Payment Status</Label>
                  <Select value={form.payment_status} onValueChange={v => set('payment_status', v)}>
                    <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Payment Date</Label>
                  <Input type="date" value={form.payment_date} onChange={e => set('payment_date', e.target.value)} className={cls} />
                </div>
              </div>
              <button type="submit" disabled={saveMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors">
                {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Add Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
