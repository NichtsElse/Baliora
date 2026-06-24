/**
 * Purpose: Manages homepage text and media settings for the public site from the admin area.
 * Used by: /admin/content/homepage route.
 * Main dependencies: React Query, localClient adapter, shared admin inputs, and router preview links.
 * Public functions: AdminContentHomepage default export.
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

const HOMEPAGE_FIELDS = [
    { key: 'hero_eyebrow', label: 'Hero Eyebrow Text', type: 'text', category: 'Hero', placeholder: 'Bali\'s Premier Villa Management' },
    { key: 'hero_title', label: 'Hero Title', type: 'textarea', category: 'Hero', placeholder: 'Your Bali Villa, Expertly Managed.' },
    { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea', category: 'Hero', placeholder: 'End-to-end villa management...' },
    { key: 'hero_image', label: 'Hero Background Image URL', type: 'url', category: 'Hero', placeholder: 'https://...' },
    { key: 'trust_statement', label: 'Trust Statement Quote', type: 'textarea', category: 'Trust Section', placeholder: 'We believe exceptional...' },
    { key: 'services_eyebrow', label: 'Services Section Eyebrow', type: 'text', category: 'Services Section', placeholder: 'Our Services' },
    { key: 'services_title', label: 'Services Section Title', type: 'text', category: 'Services Section', placeholder: 'Six Pillars of Management' },
    { key: 'cta_title', label: 'CTA Section Title', type: 'text', category: 'CTA', placeholder: 'Ready to Protect Your Villa Investment?' },
    { key: 'cta_subtitle', label: 'CTA Section Subtitle', type: 'textarea', category: 'CTA', placeholder: 'Schedule a free consultation...' },
    { key: 'cta_whatsapp', label: 'WhatsApp Number (with country code)', type: 'text', category: 'CTA', placeholder: '6281234567890' },
];

export default function AdminContentHomepage() {
    const qc = useQueryClient();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const { data: settings = [], isLoading } = useQuery({
        queryKey: ['content-homepage'],
        queryFn: () => localClient.entities.WebsiteSetting.filter({ category: 'homepage' }, 'key', 50),
    });

    const settingsMap = settings.reduce((acc, s) => { acc[s.key] = s; return acc; }, {});
    const [values, setValues] = useState({});

    const getValue = (key) => values[key] !== undefined ? values[key] : (settingsMap[key]?.value || '');

    const upsertMutation = useMutation({
        mutationFn: async (data) => {
            const existing = settingsMap[data.key];
            if (existing?.id) {
                return localClient.entities.WebsiteSetting.update(existing.id, data);
            }
            return localClient.entities.WebsiteSetting.create(data);
        },
    });

    const handleSave = async () => {
        setSaving(true);
        const changedKeys = Object.keys(values);
        await Promise.all(
            changedKeys.map(key => {
                const field = HOMEPAGE_FIELDS.find(f => f.key === key);
                return upsertMutation.mutateAsync({
                    key,
                    value: values[key],
                    category: 'homepage',
                    label: field?.label || key,
                    type: field?.type === 'url' ? 'url' : field?.type === 'textarea' ? 'textarea' : 'text',
                });
            })
        );
        await qc.invalidateQueries({ queryKey: ['content-homepage'] });
        setValues({});
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const grouped = HOMEPAGE_FIELDS.reduce((acc, f) => {
        if (!acc[f.category]) acc[f.category] = [];
        acc[f.category].push(f);
        return acc;
    }, {});

    const cls = 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600';
    const hasChanges = Object.keys(values).length > 0;

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Homepage Content</h1>
                    <p className="text-slate-500 text-sm mt-1">Edit text and images shown on the public homepage</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/" target="_blank" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-3 py-2 border border-slate-700 rounded-lg">
                        <Eye size={15} /> Preview
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges}
                        className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
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
                                            <Textarea
                                                value={getValue(field.key)}
                                                onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder}
                                                rows={3}
                                                className={cls}
                                            />
                                        ) : (
                                            <Input
                                                value={getValue(field.key)}
                                                onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                                                placeholder={field.placeholder}
                                                className={cls}
                                            />
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
