/**
 * Purpose: Manages villa owner contracts — view, create, and track contract status.
 * Used by: /admin/owners/contracts route.
 * Main dependencies: localClient, React Query, lucide-react.
 * Public functions: AdminContracts default export.
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import {
  FileText, Plus, Search, X, Save, Loader2,
  CalendarDays, CheckCircle, AlertCircle, Clock, Trash2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const STATUS_CONFIG = {
  active:   { label: 'Active',   cls: 'bg-green-500/10 text-green-400 border-green-500/20',   icon: CheckCircle },
  expired:  { label: 'Expired',  cls: 'bg-red-500/10 text-red-400 border-red-500/20',         icon: AlertCircle },
  pending:  { label: 'Pending',  cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   icon: Clock },
  renewed:  { label: 'Renewed',  cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',      icon: CheckCircle },
};

const CONTRACT_TYPES = ['Full Management', 'Rental Only', 'Maintenance Only', 'Custom'];

const EMPTY_FORM = {
  owner_name: '', villa_name: '', contract_type: 'Full Management',
  start_date: '', end_date: '', signed_date: '',
  revenue_share_percent: '', management_fee_type: 'percentage',
  status: 'active', notes: '', document_url: '',
};

const cls = 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50';

export default function AdminContracts() {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['admin-contracts'],
    queryFn: () => localClient.entities.OwnerContract.list('-created_date', 100),
  });

  const { data: owners = [] } = useQuery({
    queryKey: ['admin-owners'],
    queryFn: () => localClient.entities.VillaOwner.list('-created_date', 100),
  });

  const { data: villas = [] } = useQuery({
    queryKey: ['admin-villas'],
    queryFn: () => localClient.entities.VillaListing.list('-created_date', 100),
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editTarget
        ? localClient.entities.OwnerContract.update(editTarget.id, data)
        : localClient.entities.OwnerContract.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-contracts'] });
      setShowForm(false);
      setEditTarget(null);
      setForm(EMPTY_FORM);
      toast({ title: editTarget ? 'Contract updated' : 'Contract created' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => localClient.entities.OwnerContract.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-contracts'] });
      toast({ title: 'Contract deleted' });
    },
  });

  const openNew = () => { setEditTarget(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit = (c) => { setEditTarget(c); setForm({ ...EMPTY_FORM, ...c }); setShowForm(true); };
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const filtered = contracts.filter(c => {
    const matchSearch = !search ||
      c.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.villa_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const daysUntilExpiry = (end) => {
    if (!end) return null;
    return Math.ceil((new Date(end) - new Date()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileText className="text-amber-500" size={24} /> Owner Contracts
          </h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage villa management agreements</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} /> New Contract
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = contracts.filter(c => c.status === key).length;
          const Icon = cfg.icon;
          return (
            <div key={key} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${cfg.cls}`}>
                <Icon size={16} />
              </div>
              <div>
                <p className="text-white font-bold text-lg">{count}</p>
                <p className="text-slate-500 text-xs">{cfg.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search owner or villa..."
            className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'expired', 'pending', 'renewed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              {s === 'all' ? 'All' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Contract List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-amber-500" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">No contracts found</div>
        ) : filtered.map(c => {
          const cfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.pending;
          const Icon = cfg.icon;
          const days = daysUntilExpiry(c.end_date);
          const expiringSoon = c.status === 'active' && days !== null && days <= 60 && days > 0;

          return (
            <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 font-bold text-sm">{c.owner_name?.[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="text-white font-semibold">{c.owner_name}</p>
                    <span className={`text-xs px-2.5 py-0.5 border rounded-full flex items-center gap-1 ${cfg.cls}`}>
                      <Icon size={10} /> {cfg.label}
                    </span>
                    {expiringSoon && (
                      <span className="text-xs px-2.5 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full">
                        ⚠ Expires in {days}d
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5">{c.villa_name} — {c.contract_type}</p>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                      <CalendarDays size={11} /> {c.start_date} → {c.end_date || '—'}
                    </span>
                    <span className="text-amber-400 text-xs font-medium">{c.revenue_share_percent}% owner share</span>
                    {c.notes && <span className="text-slate-600 text-xs truncate max-w-xs">{c.notes}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(c)} className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors">
                    <FileText size={15} />
                  </button>
                  <button onClick={() => confirm('Delete contract?') && deleteMutation.mutate(c.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Slide-in Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-700 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 flex-shrink-0">
              <h2 className="text-white font-semibold">{editTarget ? 'Edit Contract' : 'New Contract'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate({ ...form, revenue_share_percent: Number(form.revenue_share_percent) }); }}
              className="p-5 space-y-4 flex-1">

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Owner Name *</Label>
                  <Select
                    value={form.owner_name}
                    onValueChange={val => {
                      const selectedOwner = owners.find(o => o.name === val);
                      setForm(p => ({
                        ...p,
                        owner_name: val,
                        owner_id: selectedOwner?.id || ''
                      }));
                    }}
                  >
                    <SelectTrigger className={cls}>
                      <SelectValue placeholder="Select Owner" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {owners.map(o => (
                        <SelectItem key={o.id} value={o.name}>{o.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Villa Name *</Label>
                  <Select
                    value={form.villa_name}
                    onValueChange={val => {
                      const selectedVilla = villas.find(v => v.name === val);
                      setForm(p => ({
                        ...p,
                        villa_name: val,
                        villa_id: selectedVilla?.id || selectedVilla?.slug || ''
                      }));
                    }}
                  >
                    <SelectTrigger className={cls}>
                      <SelectValue placeholder="Select Villa" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {villas.map(v => (
                        <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Contract Type</Label>
                  <Select value={form.contract_type} onValueChange={v => set('contract_type', v)}>
                    <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {CONTRACT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Status</Label>
                  <Select value={form.status} onValueChange={v => set('status', v)}>
                    <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {Object.keys(STATUS_CONFIG).map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Start Date</Label>
                  <Input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} className={cls} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">End Date</Label>
                  <Input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} className={cls} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Signed Date</Label>
                  <Input type="date" value={form.signed_date} onChange={e => set('signed_date', e.target.value)} className={cls} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Owner Revenue Share %</Label>
                <Input type="number" min="0" max="100" value={form.revenue_share_percent}
                  onChange={e => set('revenue_share_percent', e.target.value)} placeholder="80" className={cls} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Notes</Label>
                <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
                  placeholder="Contract details, special arrangements..." className={cls} />
              </div>

              <button type="submit" disabled={saveMutation.isPending}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors">
                {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editTarget ? 'Save Changes' : 'Create Contract'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
