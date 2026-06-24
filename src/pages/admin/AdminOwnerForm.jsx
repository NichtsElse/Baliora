/**
 * Purpose: Creates and edits owner records in the admin area, including contract dates and notes.
 * Used by: /admin/owners/new and /admin/owners/:id/edit routes.
 * Main dependencies: localClient adapter, React Query, and shared admin form inputs.
 * Public functions: AdminOwnerForm default export.
 * Side effects: reads/writes owner records and can open native date pickers in the browser.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, CalendarDays } from 'lucide-react';

const EMPTY = { name: '', email: '', whatsapp: '', nationality: '', contract_start: '', contract_end: '', revenue_share_percent: '', management_fee_type: 'percentage', notes: '', status: 'active' };
const cls = 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50';

export default function AdminOwnerForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id && id !== 'new';
  const [form, setForm] = useState(EMPTY);
  const contractStartRef = useRef(null);
  const contractEndRef = useRef(null);

  const { data: owners } = useQuery({
    queryKey: ['admin-owners'],
     queryFn: () => localClient.entities.VillaOwner.list('-created_date', 100),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && owners) {
      const owner = owners.find(o => o.id === id);
      if (owner) setForm({ ...EMPTY, ...owner });
    }
  }, [isEdit, owners, id]);

  const saveMutation = useMutation({
     mutationFn: (data) => isEdit ? localClient.entities.VillaOwner.update(id, data) : localClient.entities.VillaOwner.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-owners'] }); navigate('/admin/owners'); },
  });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const openDatePicker = (ref) => {
    const input = ref.current;
    if (!input) {
      return;
    }

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.focus();
    input.click();
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/owners" className="text-slate-500 hover:text-slate-300"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Owner' : 'Add Owner'}</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate({ ...form, revenue_share_percent: form.revenue_share_percent ? Number(form.revenue_share_percent) : undefined }); }} className="space-y-5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-medium text-sm border-b border-slate-800 pb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Full Name *</Label>
              <Input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="John Smith" className={cls} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Email *</Label>
              <Input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="john@example.com" className={cls} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">WhatsApp</Label>
              <Input value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+62 xxx" className={cls} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Nationality</Label>
              <Input value={form.nationality} onChange={e => set('nationality', e.target.value)} placeholder="Australian" className={cls} />
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-medium text-sm border-b border-slate-800 pb-3">Contract Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Contract Start</Label>
              <div
                className="relative cursor-pointer"
                onClick={() => openDatePicker(contractStartRef)}
                role="button"
                tabIndex={-1}
              >
                <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  ref={contractStartRef}
                  type="date"
                  value={form.contract_start}
                  onChange={e => set('contract_start', e.target.value)}
                  className={`${cls} appearance-none pl-10 pr-4 tabular-nums [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0`}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Contract End</Label>
              <div
                className="relative cursor-pointer"
                onClick={() => openDatePicker(contractEndRef)}
                role="button"
                tabIndex={-1}
              >
                <CalendarDays size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input
                  ref={contractEndRef}
                  type="date"
                  value={form.contract_end}
                  onChange={e => set('contract_end', e.target.value)}
                  className={`${cls} appearance-none pl-10 pr-4 tabular-nums [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0`}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Revenue Share %</Label>
              <Input type="number" value={form.revenue_share_percent} onChange={e => set('revenue_share_percent', e.target.value)} placeholder="80" className={cls} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-400 text-xs">Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-slate-400 text-xs">Notes</Label>
            <Textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              placeholder="Internal notes about this owner..." className={cls} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saveMutation.isPending}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50">
            {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEdit ? 'Save Changes' : 'Add Owner'}
          </button>
          <Link to="/admin/owners" className="px-5 py-2.5 text-slate-400 hover:text-white text-sm">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
