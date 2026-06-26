/**
 * Purpose: Creates and edits villa listings in the admin area.
 * Used by: /admin/villas/new and /admin/villas/:id routes.
 * Main dependencies: localClient villa entity, React Query, and file upload integration.
 * Public functions: AdminVillaForm default export and slugify helper.
 * Side effects: reads and writes villa records and uploads villa gallery images.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Plus, X, Upload, Sparkles, Image as ImageIcon, DollarSign } from 'lucide-react';

const LOCATIONS = ['Canggu', 'Seminyak', 'Uluwatu', 'Ubud', 'Sanur', 'Nusa Dua'];
const AMENITY_OPTIONS = [
  'Private Pool', 'Private Chef', 'Breakfast Included', 'Ocean View',
  'Rice Field View', 'Family Friendly', 'Honeymoon Setup', 'Events Allowed',
  'Free WiFi', 'Free Parking', 'Air Conditioning', 'Gym', 'Smart TV',
  'BBQ', 'Outdoor Bathtub', 'Daily Housekeeping',
];

const EMPTY = {
  name: '', slug: '', location: 'Canggu', address_area: '',
  bedrooms: '', bathrooms: '', max_guests: '', price_per_night: '',
  short_description: '', full_description: '',
  amenities: [], image_urls: [], house_rules: [], highlight_tags: [],
  status: 'available', rating: '', review_count: '',
};

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AdminVillaForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id && id !== 'new';

  const [form, setForm] = useState(EMPTY);
  const [newRule, setNewRule] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: villa, isLoading } = useQuery({
    queryKey: ['villa', id],
    queryFn: () => localClient.entities.VillaListing.filter({ id }),
    enabled: isEdit,
    select: data => data[0],
  });

  useEffect(() => {
    if (villa) setForm({ ...EMPTY, ...villa });
  }, [villa]);

  const saveMutation = useMutation({
    mutationFn: (data) => isEdit
      ? localClient.entities.VillaListing.update(id, data)
      : localClient.entities.VillaListing.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-villas'] });
      navigate('/admin/villas');
    },
  });

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const handleName = (v) => setForm(p => ({ ...p, name: v, slug: slugify(v) }));

  const toggleAmenity = (a) => {
    const cur = form.amenities || [];
    set('amenities', cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]);
  };

  const addRule = () => { if (newRule.trim()) { set('house_rules', [...(form.house_rules || []), newRule.trim()]); setNewRule(''); } };
  const addTag = () => { if (newTag.trim()) { set('highlight_tags', [...(form.highlight_tags || []), newTag.trim()]); setNewTag(''); } };
  const addImageUrl = () => { if (newImageUrl.trim()) { set('image_urls', [...(form.image_urls || []), newImageUrl.trim()]); setNewImageUrl(''); } };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await localClient.integrations.Core.UploadFile({ file });
    set('image_urls', [...(form.image_urls || []), file_url]);
    setUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...form,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : undefined,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : undefined,
      max_guests: form.max_guests ? Number(form.max_guests) : undefined,
      price_per_night: form.price_per_night ? Number(form.price_per_night) : undefined,
      rating: form.rating ? Number(form.rating) : undefined,
      review_count: form.review_count ? Number(form.review_count) : undefined,
    };
    saveMutation.mutate(data);
  };

  if (isEdit && isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-amber-500" /></div>;

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/villas" className="text-slate-500 hover:text-slate-300">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Villa' : 'Add New Villa'}</h1>
          <p className="text-slate-500 text-sm">{isEdit ? form.name : 'Create a new villa listing'}</p>
        </div>
      </div>
      
      {isEdit && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-white text-sm font-semibold">Quick Actions</h3>
            <p className="text-slate-500 text-xs">Manage other assets and rules related to this villa</p>
          </div>
          <div className="flex gap-2.5">
            <Link
              to="/admin/villas/amenities"
              state={{ villaId: id }}
              className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs px-3.5 py-2 rounded-lg transition"
            >
              <Sparkles size={14} className="text-amber-500" /> Amenities Manager
            </Link>
            <Link
              to="/admin/villas/gallery"
              state={{ villaId: id }}
              className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs px-3.5 py-2 rounded-lg transition"
            >
              <ImageIcon size={14} className="text-cyan-400" /> Gallery Manager
            </Link>
            <Link
              to="/admin/villas/pricing"
              state={{ villaId: id }}
              className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs px-3.5 py-2 rounded-lg transition"
            >
              <DollarSign size={14} className="text-green-400" /> Pricing Overrides
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Section title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Villa Name *">
              <Input required value={form.name} onChange={e => handleName(e.target.value)}
                placeholder="Villa Tirta Canggu" className={inputCls} />
            </Field>
            <Field label="Slug (URL)">
              <Input value={form.slug} onChange={e => set('slug', e.target.value)}
                placeholder="villa-tirta-canggu" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Location *">
              <Select value={form.location} onValueChange={v => set('location', v)}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Address / Area">
              <Input value={form.address_area} onChange={e => set('address_area', e.target.value)}
                placeholder="Berawa, Canggu" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Bedrooms">
              <Input type="number" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)}
                placeholder="4" className={inputCls} />
            </Field>
            <Field label="Bathrooms">
              <Input type="number" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)}
                placeholder="4" className={inputCls} />
            </Field>
            <Field label="Max Guests">
              <Input type="number" value={form.max_guests} onChange={e => set('max_guests', e.target.value)}
                placeholder="8" className={inputCls} />
            </Field>
            <Field label="Price / Night ($)">
              <Input type="number" value={form.price_per_night} onChange={e => set('price_per_night', e.target.value)}
                placeholder="450" className={inputCls} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Status">
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {['available', 'hidden', 'maintenance'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Rating (0–5)">
              <Input type="number" step="0.1" min="0" max="5" value={form.rating}
                onChange={e => set('rating', e.target.value)} placeholder="4.9" className={inputCls} />
            </Field>
            <Field label="Review Count">
              <Input type="number" value={form.review_count}
                onChange={e => set('review_count', e.target.value)} placeholder="24" className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* Descriptions */}
        <Section title="Descriptions">
          <Field label="Short Description">
            <Textarea value={form.short_description} onChange={e => set('short_description', e.target.value)}
              placeholder="Brief summary for listing cards..." rows={3} className={inputCls} />
          </Field>
          <Field label="Full Description">
            <Textarea value={form.full_description} onChange={e => set('full_description', e.target.value)}
              placeholder="Detailed description for the villa detail page..." rows={6} className={inputCls} />
          </Field>
        </Section>

        {/* Images */}
        <Section title="Gallery Images">
          <div className="flex flex-wrap gap-3 mb-3">
            {(form.image_urls || []).map((url, idx) => (
              <div key={idx} className="relative w-24 h-20 rounded-lg overflow-hidden border border-slate-700">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => set('image_urls', form.image_urls.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-600/90 rounded-full flex items-center justify-center">
                  <X size={10} className="text-white" />
                </button>
                {idx === 0 && <span className="absolute bottom-1 left-1 text-[9px] bg-amber-600 text-white px-1 rounded">Cover</span>}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                placeholder="Paste image URL and press Enter..." className={inputCls} />
            </div>
            <button type="button" onClick={addImageUrl} className="px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm border border-slate-600">Add</button>
          </div>
          <label className="mt-2 flex items-center gap-2 cursor-pointer w-fit px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded-lg border border-slate-700">
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            Upload Image
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </Section>

        {/* Amenities */}
        <Section title="Amenities">
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map(a => {
              const active = (form.amenities || []).includes(a);
              return (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${active ? 'bg-amber-600/20 border-amber-500/50 text-amber-400' : 'border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300'}`}>
                  {a}
                </button>
              );
            })}
          </div>
        </Section>

        {/* House Rules */}
        <Section title="House Rules">
          <div className="space-y-2 mb-3">
            {(form.house_rules || []).map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-800 px-3 py-2 rounded-lg">
                <span className="text-slate-300 text-sm flex-1">{rule}</span>
                <button type="button" onClick={() => set('house_rules', form.house_rules.filter((_, i) => i !== idx))}>
                  <X size={14} className="text-slate-500 hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newRule} onChange={e => setNewRule(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addRule())}
              placeholder="Add house rule..." className={inputCls} />
            <button type="button" onClick={addRule} className="px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600">
              <Plus size={16} />
            </button>
          </div>
        </Section>

        {/* Highlight Tags */}
        <Section title="Highlight Tags">
          <div className="flex flex-wrap gap-2 mb-3">
            {(form.highlight_tags || []).map((tag, idx) => (
              <span key={idx} className="flex items-center gap-1.5 bg-amber-600/10 border border-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full">
                {tag}
                <button type="button" onClick={() => set('highlight_tags', form.highlight_tags.filter((_, i) => i !== idx))}>
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={newTag} onChange={e => setNewTag(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="e.g. Honeymoon, Ocean View..." className={`${inputCls} max-w-xs`} />
            <button type="button" onClick={addTag} className="px-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg border border-slate-600">
              <Plus size={16} />
            </button>
          </div>
        </Section>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={saveMutation.isPending}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50">
            {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEdit ? 'Save Changes' : 'Create Villa'}
          </button>
          <Link to="/admin/villas" className="px-5 py-2.5 text-slate-400 hover:text-white text-sm">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

const inputCls = 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50';

function Section({ title, children }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
      <h3 className="text-white font-semibold text-sm border-b border-slate-800 pb-3">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-400 text-xs">{label}</Label>
      {children}
    </div>
  );
}
