/**
 * Purpose: Manages services page hero, CTA, and six pillar content for the public site from the admin area.
 * Used by: /admin/content/services route.
 * Main dependencies: React Query, localClient adapter, shared admin inputs, and router preview links.
 * Public functions: AdminContentServices default export.
 * Side effects: reads and updates website setting records in local storage or optional Supabase sync.
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Save, Loader2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const SERVICES_FIELDS = [
    { key: 'services_page_title', label: 'Page Title', type: 'text', category: 'Hero', placeholder: 'Six Pillars of Complete Villa Management' },
    { key: 'services_page_desc', label: 'Page Description', type: 'textarea', category: 'Hero', placeholder: 'Every aspect of your villa...' },
    { key: 'services_cta_title', label: 'CTA Title', type: 'text', category: 'CTA', placeholder: 'Ready for Professional Management?' },
    { key: 'services_cta_subtitle', label: 'CTA Subtitle', type: 'textarea', category: 'CTA', placeholder: 'Tell us about your villa...' },
    ...Array.from({ length: 6 }, (_, i) => [
        { key: `pillar_${i + 1}_title`, label: `Pillar ${i + 1} Title`, type: 'text', category: `Pillar ${i + 1}`, placeholder: '' },
        { key: `pillar_${i + 1}_desc`, label: `Pillar ${i + 1} Description`, type: 'textarea', category: `Pillar ${i + 1}`, placeholder: '' },
        { key: `pillar_${i + 1}_services`, label: `Pillar ${i + 1} Services (one per line)`, type: 'textarea', category: `Pillar ${i + 1}`, placeholder: 'Service A\nService B\nService C' },
    ]).flat(),
];

export default function AdminContentServices() {
    const qc = useQueryClient();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [values, setValues] = useState({});

    const { data: settings = [], isLoading } = useQuery({
        queryKey: ['content-services'],
        queryFn: () => localClient.entities.WebsiteSetting.filter({ category: 'services' }, 'key', 100),
    });

    const settingsMap = settings.reduce((acc, s) => { acc[s.key] = s; return acc; }, {});
    const getValue = (key) => values[key] !== undefined ? values[key] : (settingsMap[key]?.value || '');

    const upsertMutation = useMutation({
        mutationFn: async (data) => {
            const existing = settingsMap[data.key];
            if (existing?.id) return localClient.entities.WebsiteSetting.update(existing.id, data);
            return localClient.entities.WebsiteSetting.create(data);
        },
    });

    const handleSave = async () => {
        setSaving(true);
        await Promise.all(
            Object.keys(values).map(key => {
                const field = SERVICES_FIELDS.find(f => f.key === key);
                return upsertMutation.mutateAsync({
                    key, value: values[key], category: 'services',
                    label: field?.label || key,
                    type: field?.type === 'textarea' ? 'textarea' : 'text',
                });
            })
        );
        await qc.invalidateQueries({ queryKey: ['content-services'] });
        setValues({});
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const grouped = SERVICES_FIELDS.reduce((acc, f) => {
        if (!acc[f.category]) acc[f.category] = [];
        acc[f.category].push(f);
        return acc;
    }, {});

    const cls = 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600';

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Services Page Content</h1>
                    <p className="text-slate-500 text-sm mt-1">Edit the 6 service pillars and page text</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/services" target="_blank" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-3 py-2 border border-slate-700 rounded-lg">
                        <Eye size={15} /> Preview
                    </Link>
                    <button onClick={handleSave} disabled={saving || !Object.keys(values).length}
                        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        {saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="animate-spin text-amber-500" /></div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([category, fields]) => (
                        <div key={category} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                            <div className="px-5 py-3 border-b border-slate-800 bg-slate-800/50">
                                <h3 className="text-amber-400 text-sm font-medium">{category}</h3>
                            </div>
                            <div className="p-5 space-y-4">
                                {fields.map(field => (
                                    <div key={field.key} className="space-y-1.5">
                                        <Label className="text-slate-400 text-xs">{field.label}</Label>
                                        {field.type === 'textarea' ? (
                                            <Textarea value={getValue(field.key)} onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder} rows={field.key.includes('services') ? 6 : 3} className={cls} />
                                        ) : (
                                            <Input value={getValue(field.key)} onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder} className={cls} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
