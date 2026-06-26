/**
 * Purpose: Manages promotional campaigns and discount codes for villa bookings.
 * Used by: /admin/marketing/promotions route.
 * Main dependencies: localClient, React Query, lucide-react.
 * Public functions: AdminPromotions default export.
 */
import React, { useState } from 'react';
import { Tag, Plus, X, Save, Loader2, Search, Copy, CheckCircle, Clock, AlertCircle, Trash2, Percent, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const PROMO_SEED = [
  { id: 'promo_1', code: 'BALI2026', title: 'Bali High Season Offer', type: 'percentage', value: 15, min_nights: 3, start_date: '2026-07-01', end_date: '2026-08-31', usage_limit: 50, usage_count: 17, status: 'active', description: 'Summer high-season discount for early bookers.' },
  { id: 'promo_2', code: 'WELCOME10', title: 'New Guest Welcome', type: 'percentage', value: 10, min_nights: 2, start_date: '2026-01-01', end_date: '2026-12-31', usage_limit: 100, usage_count: 43, status: 'active', description: 'First-time guest discount.' },
  { id: 'promo_3', code: 'XMAS50', title: 'Christmas Fixed Discount', type: 'fixed', value: 50, min_nights: 5, start_date: '2026-12-20', end_date: '2027-01-05', usage_limit: 20, usage_count: 0, status: 'scheduled', description: 'Holiday special discount.' },
  { id: 'promo_4', code: 'LASTMIN20', title: 'Last Minute Deal', type: 'percentage', value: 20, min_nights: 1, start_date: '2026-01-01', end_date: '2026-06-01', usage_limit: 30, usage_count: 30, status: 'expired', description: 'Last minute booking discount.' },
];

const STATUS_CFG = {
  active:    { label: 'Active',    cls: 'bg-green-500/10 text-green-400 border-green-500/20',   icon: CheckCircle },
  scheduled: { label: 'Scheduled', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20',     icon: Clock },
  expired:   { label: 'Expired',   cls: 'bg-slate-500/10 text-slate-400 border-slate-500/20',  icon: AlertCircle },
  paused:    { label: 'Paused',    cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',  icon: Clock },
};

const EMPTY = { code: '', title: '', type: 'percentage', value: '', min_nights: 1, start_date: '', end_date: '', usage_limit: '', description: '', status: 'active' };
const cls = 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50';

function generateCode() {
  return 'BALIORA' + Math.random().toString(36).slice(2, 6).toUpperCase();
}

export default function AdminPromotions() {
  const { toast } = useToast();
  const [promos, setPromos] = useState(PROMO_SEED);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(null);

  const filtered = promos.filter(p => {
    const matchSearch = !search || p.code?.toLowerCase().includes(search.toLowerCase()) || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openNew = () => { setEditTarget(null); setForm({ ...EMPTY, code: generateCode() }); setShowForm(true); };
  const openEdit = (p) => { setEditTarget(p); setForm({ ...EMPTY, ...p }); setShowForm(true); };
  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      if (editTarget) {
        setPromos(prev => prev.map(p => p.id === editTarget.id ? { ...p, ...form } : p));
        toast({ title: 'Promo updated' });
      } else {
        setPromos(prev => [{ ...form, id: `promo_${Date.now()}`, usage_count: 0, value: Number(form.value) }, ...prev]);
        toast({ title: 'Promo created' });
      }
      setSaving(false);
      setShowForm(false);
    }, 300);
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this promotion?')) return;
    setPromos(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Promotion deleted' });
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tag className="text-amber-500" size={24} /> Promotions & Discount Codes
          </h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage booking discount campaigns</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> New Promo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(STATUS_CFG).map(([key, cfg]) => {
          const Icon = cfg.icon;
          const count = promos.filter(p => p.status === key).length;
          return (
            <div key={key} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${cfg.cls}`}><Icon size={15} /></div>
              <div><p className="text-white font-bold text-lg">{count}</p><p className="text-slate-500 text-xs">{cfg.label}</p></div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search code or title..."
            className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'active', 'scheduled', 'paused', 'expired'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${statusFilter === s ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{s === 'all' ? 'All' : s}</button>
          ))}
        </div>
      </div>

      {/* Promo Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 text-center py-16 text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">No promotions found</div>
        ) : filtered.map(p => {
          const cfg = STATUS_CFG[p.status] || STATUS_CFG.paused;
          const Icon = cfg.icon;
          const usagePct = p.usage_limit ? (p.usage_count / p.usage_limit) * 100 : 0;
          return (
            <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => copyCode(p.code)}
                    className="font-mono font-bold text-amber-400 text-lg tracking-wider hover:text-amber-300 flex items-center gap-1.5 transition-colors">
                    {p.code}
                    {copied === p.code ? <CheckCircle size={14} className="text-green-400" /> : <Copy size={13} />}
                  </button>
                </div>
                <span className={`text-xs px-2.5 py-0.5 border rounded-full flex items-center gap-1 ${cfg.cls}`}>
                  <Icon size={10} /> {cfg.label}
                </span>
              </div>
              <p className="text-white font-medium text-sm mb-1">{p.title}</p>
              {p.description && <p className="text-slate-500 text-xs mb-3">{p.description}</p>}
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <span className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                  {p.type === 'percentage' ? <Percent size={13} /> : null}
                  {p.type === 'percentage' ? `${p.value}% off` : `$${p.value} off`}
                </span>
                <span className="text-slate-500 text-xs">min {p.min_nights} night{p.min_nights > 1 ? 's' : ''}</span>
                <span className="text-slate-500 text-xs flex items-center gap-1">
                  <Calendar size={11} /> {p.start_date} → {p.end_date}
                </span>
              </div>
              {p.usage_limit > 0 && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Usage</span>
                    <span className="text-slate-400">{p.usage_count} / {p.usage_limit}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${usagePct >= 90 ? 'bg-red-500' : usagePct >= 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                      style={{ width: `${Math.min(usagePct, 100)}%` }} />
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
                <button onClick={() => openEdit(p)} className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-400 rounded-lg transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Form Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-700 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 flex-shrink-0">
              <h2 className="text-white font-semibold">{editTarget ? 'Edit Promotion' : 'New Promotion'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4 flex-1">
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Promo Code *</Label>
                <div className="flex gap-2">
                  <Input required value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="SUMMER20" className={`${cls} font-mono`} />
                  <button type="button" onClick={() => set('code', generateCode())} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs">Generate</button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Title *</Label>
                <Input required value={form.title} onChange={e => set('title', e.target.value)} placeholder="Campaign name" className={cls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Discount Type</Label>
                  <Select value={form.type} onValueChange={v => set('type', v)}>
                    <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Value</Label>
                  <Input type="number" min="0" value={form.value} onChange={e => set('value', e.target.value)} placeholder={form.type === 'percentage' ? '15' : '50'} className={cls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Min Nights</Label>
                  <Input type="number" min="1" value={form.min_nights} onChange={e => set('min_nights', e.target.value)} className={cls} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Usage Limit</Label>
                  <Input type="number" min="0" value={form.usage_limit} onChange={e => set('usage_limit', e.target.value)} placeholder="50" className={cls} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Start Date</Label>
                  <Input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} className={cls} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">End Date</Label>
                  <Input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} className={cls} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {Object.entries(STATUS_CFG).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Description</Label>
                <Textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Internal notes about this promotion..." className={cls} />
              </div>
              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editTarget ? 'Save Changes' : 'Create Promotion'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
