/**
 * Purpose: Manages about page text and media settings for the public site from the admin area.
 * Used by: /admin/content/about route.
 * Main dependencies: React Query, localClient adapter, shared admin inputs, and router preview links.
 * Public functions: AdminContentAbout default export.
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

const ABOUT_FIELDS = [
    { key: 'about_hero_title', label: 'Page Title', type: 'text', category: 'Hero', placeholder: 'Your Dedicated Villa Management Partner' },
    { key: 'about_hero_desc', label: 'Page Description', type: 'textarea', category: 'Hero', placeholder: 'Owning a villa in Bali should be rewarding...' },
    { key: 'about_image', label: 'Story Section Image URL', type: 'url', category: 'Our Story', placeholder: 'https://...' },
    { key: 'about_story_title', label: 'Story Section Title', type: 'text', category: 'Our Story', placeholder: 'Built for Villa Owners Who Expect More' },
    { key: 'about_story_p1', label: 'Story Paragraph 1', type: 'textarea', category: 'Our Story', placeholder: 'Baliora was founded on a simple observation...' },
    { key: 'about_story_p2', label: 'Story Paragraph 2', type: 'textarea', category: 'Our Story', placeholder: 'We handle operations, finance...' },
    { key: 'about_story_p3', label: 'Story Paragraph 3', type: 'textarea', category: 'Our Story', placeholder: 'Our team brings together...' },
    { key: 'about_mission_title', label: 'Mission Title', type: 'text', category: 'Mission', placeholder: 'To set the standard for professional villa management in Bali' },
    { key: 'about_mission_desc', label: 'Mission Description', type: 'textarea', category: 'Mission', placeholder: 'We believe every villa owner deserves...' },
];

export default function AdminContentAbout() {
    const qc = useQueryClient();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [values, setValues] = useState({});

    const { data: settings = [], isLoading } = useQuery({
        queryKey: ['content-about'],
        queryFn: () => localClient.entities.WebsiteSetting.filter({ category: 'about' }, 'key', 50),
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
                const field = ABOUT_FIELDS.find(f => f.key === key);
                return upsertMutation.mutateAsync({
                    key, value: values[key], category: 'about',
                    label: field?.label || key,
                    type: field?.type === 'url' ? 'url' : field?.type === 'textarea' ? 'textarea' : 'text',
                });
            })
        );
        await qc.invalidateQueries({ queryKey: ['content-about'] });
        setValues({});
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const grouped = ABOUT_FIELDS.reduce((acc, f) => {
        if (!acc[f.category]) acc[f.category] = [];
        acc[f.category].push(f);
        return acc;
    }, {});

    const cls = 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600';

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">About Page Content</h1>
                    <p className="text-slate-500 text-sm mt-1">Edit text and images on the About page</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link to="/about" target="_blank" className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm px-3 py-2 border border-slate-700 rounded-lg">
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
                                                placeholder={field.placeholder} rows={3} className={cls} />
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
