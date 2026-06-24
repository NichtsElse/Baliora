import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Save, Loader2, GripVertical } from 'lucide-react';

function FAQForm({ faq, onSave, onCancel }) {
  const [form, setForm] = useState(faq || { question: '', answer: '', category: 'General', status: 'active', sort_order: 0 });
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4">
      <h3 className="text-white font-medium">{faq ? 'Edit FAQ' : 'New FAQ'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2 space-y-1.5">
          <Label className="text-slate-400 text-xs">Question *</Label>
          <Input required value={form.question} onChange={e => set('question', e.target.value)}
            placeholder="What services does BALIORA provide?" className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <Label className="text-slate-400 text-xs">Answer *</Label>
          <Textarea required value={form.answer} onChange={e => set('answer', e.target.value)}
            rows={4} placeholder="Detailed answer..." className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Category</Label>
          <Input value={form.category} onChange={e => set('category', e.target.value)}
            placeholder="General" className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-slate-400 text-xs">Status</Label>
          <Select value={form.status} onValueChange={v => set('status', v)}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 text-white">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="hidden">Hidden</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg text-sm">
          <Save size={14} /> Save
        </button>
        <button onClick={onCancel} className="px-4 py-2 text-slate-400 hover:text-white text-sm">Cancel</button>
      </div>
    </div>
  );
}

export default function AdminFAQs() {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const qc = useQueryClient();

  const { data: faqs = [], isLoading } = useQuery({
    queryKey: ['admin-faqs'],
     queryFn: () => localClient.entities.FAQ.list('sort_order', 100),
  });

  const createMutation = useMutation({
     mutationFn: (data) => localClient.entities.FAQ.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
     mutationFn: ({ id, data }) => localClient.entities.FAQ.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-faqs'] }); setEditing(null); },
  });

  const deleteMutation = useMutation({
     mutationFn: (id) => localClient.entities.FAQ.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-faqs'] }),
  });

  const grouped = faqs.reduce((acc, faq) => {
    const cat = faq.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(faq);
    return acc;
  }, {});

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">FAQ Management</h1>
          <p className="text-slate-500 text-sm mt-1">{faqs.length} questions</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditing(null); }}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      {showForm && !editing && (
        <FAQForm onSave={(data) => createMutation.mutate(data)} onCancel={() => setShowForm(false)} />
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-amber-500" /></div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/50">
                <h3 className="text-amber-400 text-sm font-medium">{cat}</h3>
              </div>
              <div className="divide-y divide-slate-800">
                {items.map(faq => (
                  <div key={faq.id}>
                    {editing?.id === faq.id ? (
                      <div className="p-4">
                        <FAQForm faq={editing} onSave={(data) => updateMutation.mutate({ id: faq.id, data })} onCancel={() => setEditing(null)} />
                      </div>
                    ) : (
                      <div className="px-5 py-4 flex gap-4 hover:bg-slate-800/30 group">
                        <GripVertical size={16} className="text-slate-700 mt-0.5 flex-shrink-0 cursor-grab" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-white text-sm font-medium">{faq.question}</p>
                              <p className="text-slate-500 text-sm mt-1 line-clamp-2">{faq.answer}</p>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${faq.status === 'active' ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-slate-500 border-slate-600 bg-slate-800'}`}>
                                {faq.status}
                              </span>
                              <button onClick={() => setEditing(faq)} className="p-1.5 text-slate-500 hover:text-amber-400"><Edit size={14} /></button>
                              <button onClick={() => { if (confirm('Delete this FAQ?')) deleteMutation.mutate(faq.id); }}
                                className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {faqs.length === 0 && (
            <div className="text-center py-16 text-slate-500">No FAQs yet. Add your first one above.</div>
          )}
        </div>
      )}
    </div>
  );
}
