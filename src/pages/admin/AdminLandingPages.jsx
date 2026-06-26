/**
 * Purpose: Manages landing page configurations and CTA blocks for the marketing site.
 * Used by: /admin/marketing/landing-pages route.
 * Main dependencies: lucide-react, use-toast.
 * Public functions: AdminLandingPages default export.
 */
import React, { useState } from 'react';
import { Layout, Plus, X, Save, Loader2, Eye, EyeOff, Globe, ExternalLink, Edit, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const SEED_PAGES = [
  {
    id: 'lp_1', title: 'Bali Summer Escape 2026', slug: 'summer-escape-2026',
    headline: 'Escape to Paradise This Summer', subheadline: 'Book your private villa in Bali — exclusive rates for July & August.',
    cta_text: 'Reserve Your Villa', cta_url: '/villas', status: 'published', views: 1240, leads: 34,
    hero_image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
    tags: ['summer', 'seasonal'], created_date: '2026-05-10T10:00:00Z',
  },
  {
    id: 'lp_2', title: 'Long-Stay Remote Work Package', slug: 'remote-work-bali',
    headline: 'Work Remotely from Bali\'s Most Beautiful Villas', subheadline: '30+ days stay with high-speed WiFi, dedicated workspace, and daily housekeeping.',
    cta_text: 'Inquire Now', cta_url: '/contact', status: 'published', views: 870, leads: 18,
    hero_image: 'https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?w=800',
    tags: ['remote-work', 'long-stay'], created_date: '2026-04-01T09:00:00Z',
  },
  {
    id: 'lp_3', title: 'Honeymoon Suite Campaign', slug: 'honeymoon-bali',
    headline: 'Start Your Forever in Bali', subheadline: 'Romantic villa setups, candlelit dinners, spa packages, and sunset views.',
    cta_text: 'Plan Your Honeymoon', cta_url: '/assessment', status: 'draft', views: 0, leads: 0,
    hero_image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800',
    tags: ['honeymoon', 'romance'], created_date: '2026-06-15T11:00:00Z',
  },
];

const EMPTY = { title: '', slug: '', headline: '', subheadline: '', cta_text: 'Book Now', cta_url: '/villas', status: 'draft', hero_image: '', tags: '' };
const cls = 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminLandingPages() {
  const { toast } = useToast();
  const [pages, setPages] = useState(SEED_PAGES);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const openNew = () => { setEditTarget(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (p) => { setEditTarget(p); setForm({ ...EMPTY, ...p, tags: (p.tags || []).join(', ') }); setShowForm(true); };
  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const handleTitleChange = (v) => {
    setForm(prev => ({ ...prev, title: v, slug: prev.slug || slugify(v) }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] };
      if (editTarget) {
        setPages(prev => prev.map(p => p.id === editTarget.id ? { ...p, ...payload } : p));
        toast({ title: 'Landing page updated' });
      } else {
        setPages(prev => [{ ...payload, id: `lp_${Date.now()}`, views: 0, leads: 0, created_date: new Date().toISOString() }, ...prev]);
        toast({ title: 'Landing page created' });
      }
      setSaving(false);
      setShowForm(false);
    }, 300);
  };

  const toggleStatus = (id) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, status: p.status === 'published' ? 'draft' : 'published' } : p));
    toast({ title: 'Status updated' });
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this landing page?')) return;
    setPages(prev => prev.filter(p => p.id !== id));
    toast({ title: 'Page deleted' });
  };

  const totalViews = pages.reduce((s, p) => s + (p.views || 0), 0);
  const totalLeads = pages.reduce((s, p) => s + (p.leads || 0), 0);
  const convRate = totalViews ? ((totalLeads / totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layout className="text-amber-500" size={24} /> Landing Pages
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage campaign-specific marketing pages and CTAs</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> New Page
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pages', value: pages.length, sub: `${pages.filter(p => p.status === 'published').length} published` },
          { label: 'Total Views', value: totalViews.toLocaleString(), sub: 'all pages' },
          { label: 'Total Leads', value: totalLeads, sub: 'inquiries captured' },
          { label: 'Conversion Rate', value: `${convRate}%`, sub: 'views → leads' },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-500 text-xs mb-1">{label}</p>
            <p className="text-white font-bold text-xl">{value}</p>
            <p className="text-slate-600 text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Page Cards */}
      <div className="space-y-4">
        {pages.map(p => (
          <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
            <div className="flex flex-col md:flex-row">
              {p.hero_image && (
                <div className="md:w-48 h-32 md:h-auto flex-shrink-0 overflow-hidden">
                  <img src={p.hero_image} alt={p.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-white font-semibold">{p.title}</h3>
                      <span className={`text-xs px-2.5 py-0.5 border rounded-full ${p.status === 'published' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                        {p.status}
                      </span>
                    </div>
                    <p className="text-amber-400 text-sm font-medium mb-1">{p.headline}</p>
                    <p className="text-slate-500 text-xs mb-2 line-clamp-1">{p.subheadline}</p>
                    <div className="flex items-center gap-1 text-slate-600 text-xs">
                      <Globe size={11} />
                      <span>/lp/{p.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <a href={`/lp/${p.slug}`} target="_blank" rel="noreferrer" className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors">
                      <ExternalLink size={15} />
                    </a>
                    <button onClick={() => toggleStatus(p.id)} className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors">
                      {p.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    <button onClick={() => openEdit(p)} className="p-1.5 text-slate-500 hover:text-white transition-colors">
                      <Edit size={15} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-slate-500 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800">
                  <div className="text-center">
                    <p className="text-white font-semibold text-sm">{(p.views || 0).toLocaleString()}</p>
                    <p className="text-slate-600 text-xs">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-green-400 font-semibold text-sm">{p.leads || 0}</p>
                    <p className="text-slate-600 text-xs">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-amber-400 font-semibold text-sm">
                      {p.views ? ((p.leads / p.views) * 100).toFixed(1) : '0.0'}%
                    </p>
                    <p className="text-slate-600 text-xs">Conv.</p>
                  </div>
                  <div className="flex-1" />
                  <span className="text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 text-amber-300 rounded-lg font-medium">
                    CTA: {p.cta_text}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Form Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-700 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800 flex-shrink-0">
              <h2 className="text-white font-semibold">{editTarget ? 'Edit Landing Page' : 'New Landing Page'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4 flex-1">
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Page Title *</Label>
                <Input required value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="Summer Escape Campaign" className={cls} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">URL Slug</Label>
                <div className="flex items-center gap-0">
                  <span className="px-3 py-2 bg-slate-700 text-slate-500 text-xs rounded-l-lg border border-slate-600 border-r-0">/lp/</span>
                  <Input value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="summer-escape" className={`${cls} rounded-l-none`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Headline *</Label>
                <Input required value={form.headline} onChange={e => set('headline', e.target.value)} placeholder="Your main hero headline" className={cls} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Sub-headline</Label>
                <Textarea value={form.subheadline} onChange={e => set('subheadline', e.target.value)} rows={2} placeholder="Supporting description text" className={cls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">CTA Button Text</Label>
                  <Input value={form.cta_text} onChange={e => set('cta_text', e.target.value)} placeholder="Book Now" className={cls} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">CTA Target URL</Label>
                  <Input value={form.cta_url} onChange={e => set('cta_url', e.target.value)} placeholder="/villas" className={cls} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Hero Image URL</Label>
                <Input value={form.hero_image} onChange={e => set('hero_image', e.target.value)} placeholder="https://..." className={cls} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Tags (comma-separated)</Label>
                <Input value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="summer, seasonal, discount" className={cls} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger className={cls}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button type="submit" disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 transition-colors">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editTarget ? 'Save Changes' : 'Create Page'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
