/**
 * Purpose: Manages website settings defaults and editing for the admin settings page.
 * Used by: Admin settings route.
 * Main dependencies: localClient website setting entity, React state, and form controls.
 * Public functions: AdminSettings default export.
 * Side effects: Reads and writes website setting data through the admin data layer.
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Loader2, CheckCircle } from 'lucide-react';

const DEFAULT_SETTINGS = [
  { key: 'company_name', value: 'BALIORA', label: 'Company Name', category: 'Company', type: 'text' },
  { key: 'company_tagline', value: 'End-to-End Villa Management in Bali', label: 'Company Tagline', category: 'Company', type: 'text' },
  { key: 'contact_email', value: 'info@v-teki.com', label: 'Contact Email', category: 'Contact', type: 'email' },
  { key: 'whatsapp_number', value: '+62-822 2788 8025', label: 'WhatsApp Number', category: 'Contact', type: 'phone' },
  { key: 'address', value: 'Bali, Indonesia', label: 'Office Address', category: 'Contact', type: 'text' },
  { key: 'website_url', value: 'www.balioravilla.com', label: 'Website URL', category: 'Contact', type: 'url' },
  { key: 'hero_eyebrow', value: 'Villa Management in Bali', label: 'Hero Eyebrow', category: 'Homepage', type: 'text' },
  { key: 'instagram_url', value: 'https://instagram.com/baliora', label: 'Instagram URL', category: 'Social', type: 'url' },
  { key: 'facebook_url', value: '', label: 'Facebook URL', category: 'Social', type: 'url' },
  { key: 'linkedin_url', value: '', label: 'LinkedIn URL', category: 'Social', type: 'url' },
  { key: 'hero_title', value: 'End-to-End Villa Management in Bali', label: 'Hero Title', category: 'Homepage', type: 'textarea' },
  { key: 'hero_subtitle', value: 'Protecting your asset, elevating your returns.', label: 'Hero Subtitle', category: 'Homepage', type: 'text' },
  { key: 'testimonial_image', value: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80', label: 'Homepage Testimonial Image', category: 'Homepage', type: 'url' },
  { key: 'seo_title', value: 'BALIORA Villa Management | Bali', label: 'Default SEO Title', category: 'SEO', type: 'text' },
  { key: 'seo_description', value: 'Professional villa management in Bali.', label: 'Default Meta Description', category: 'SEO', type: 'textarea' },
];

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const qc = useQueryClient();

  const { data: storedSettings = [] } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => localClient.entities.WebsiteSetting.list('category', 200),
  });

  const [localSettings, setLocalSettings] = useState({});

  const getVal = (key) => {
    if (localSettings[key] !== undefined) return localSettings[key];
    const stored = storedSettings.find(s => s.key === key);
    return stored?.value ?? DEFAULT_SETTINGS.find(s => s.key === key)?.value ?? '';
  };

  const saveMutation = useMutation({
    mutationFn: async (changes) => {
      for (const [key, value] of Object.entries(changes)) {
        const existing = storedSettings.find(s => s.key === key);
        const def = DEFAULT_SETTINGS.find(s => s.key === key);
        if (existing) {
          await localClient.entities.WebsiteSetting.update(existing.id, { value });
        } else {
          await localClient.entities.WebsiteSetting.create({ key, value, category: def?.category || 'General', label: def?.label || key, type: def?.type || 'text' });
        }
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-settings'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      setLocalSettings({});
    },
  });

  const handleSave = () => saveMutation.mutate(localSettings);

  const grouped = DEFAULT_SETTINGS.reduce((acc, s) => {
    if (!acc[s.category]) acc[s.category] = [];
    acc[s.category].push(s);
    return acc;
  }, {});

  const cls = 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50';

  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Website Settings</h1>
          <p className="text-slate-500 text-sm mt-1">Manage global site configuration</p>
        </div>
        <button onClick={handleSave} disabled={saveMutation.isPending || Object.keys(localSettings).length === 0}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-40">
          {saveMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : <Save size={15} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {Object.entries(grouped).map(([category, settings]) => (
        <div key={category} className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm border-b border-slate-800 pb-3">{category}</h3>
          {settings.map(s => (
            <div key={s.key} className="space-y-1.5">
              <Label className="text-slate-400 text-xs">{s.label}</Label>
              {s.type === 'textarea' ? (
                <Textarea value={getVal(s.key)} onChange={e => setLocalSettings(p => ({ ...p, [s.key]: e.target.value }))}
                  rows={3} className={cls} />
              ) : (
                <Input type={s.type === 'email' ? 'email' : s.type === 'url' ? 'url' : 'text'}
                  value={getVal(s.key)} onChange={e => setLocalSettings(p => ({ ...p, [s.key]: e.target.value }))}
                  className={cls} />
              )}
            </div>
          ))}
        </div>
      ))}

      {Object.keys(localSettings).length > 0 && (
        <div className="sticky bottom-4 bg-amber-600 text-white px-5 py-3 rounded-xl flex items-center justify-between shadow-lg">
          <span className="text-sm font-medium">{Object.keys(localSettings).length} unsaved change{Object.keys(localSettings).length !== 1 ? 's' : ''}</span>
          <button onClick={handleSave} disabled={saveMutation.isPending}
            className="flex items-center gap-2 bg-white text-amber-700 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-amber-50">
            {saveMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Now
          </button>
        </div>
      )}
    </div>
  );
}
