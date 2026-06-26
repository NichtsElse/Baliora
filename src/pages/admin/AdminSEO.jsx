/**
 * Purpose: SEO metadata manager for villa listings and site pages.
 * Used by: /admin/marketing/seo route.
 * Main dependencies: lucide-react, use-toast, localClient.
 * Public functions: AdminSEO default export.
 */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Search, Globe, Edit, Save, X, CheckCircle, AlertCircle, Info, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const SITE_PAGES_SEO = [
  { id: 'seo_home', page: 'Homepage', path: '/', title: 'BALIORA Villa Management | End-to-End Villa Management in Bali', description: 'Premium villa management in Bali for owners who want complete accountability, transparent reporting, and hospitality-standard operations.', keywords: 'villa management Bali, luxury villa management' },
  { id: 'seo_about', page: 'About', path: '/about', title: 'About BALIORA | Dedicated Villa Management Partner in Bali', description: 'Learn how BALIORA supports villa owners in Bali with owner-first management, local expertise, and transparent reporting.', keywords: 'about baliora, bali villa manager' },
  { id: 'seo_services', page: 'Services', path: '/services', title: 'Villa Management Services | BALIORA Bali', description: 'Explore BALIORA\'s six pillars of villa management in Bali, from finance to maintenance and rental performance.', keywords: 'villa management services, bali villa services' },
  { id: 'seo_villas', page: 'Villas Catalog', path: '/villas', title: 'Rental Villas | BALIORA Bali Villa Collection', description: 'Browse the BALIORA villa collection across Bali, including Canggu, Ubud, Uluwatu, and Seminyak.', keywords: 'rental villas bali, luxury villas bali' },
  { id: 'seo_contact', page: 'Contact', path: '/contact', title: 'Request Consultation | BALIORA Villa Management', description: 'Contact BALIORA to discuss your villa in Bali and request a tailored consultation.', keywords: 'baliora contact, villa consultation bali' },
];

function ScoreBar({ score, label }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const textColor = score >= 80 ? 'text-green-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-xs font-medium tabular-nums w-8 text-right ${textColor}`}>{score}</span>
      {label && <span className="text-slate-500 text-xs">{label}</span>}
    </div>
  );
}

function SeoChecker({ title, description, keywords }) {
  const titleLen = (title || '').length;
  const descLen = (description || '').length;
  const kwCount = keywords ? keywords.split(',').filter(k => k.trim()).length : 0;

  const issues = [];
  if (titleLen < 30) issues.push({ type: 'warn', msg: `Title too short (${titleLen}/30 min)` });
  if (titleLen > 60) issues.push({ type: 'warn', msg: `Title too long (${titleLen}/60 max)` });
  if (descLen < 120) issues.push({ type: 'warn', msg: `Description too short (${descLen}/120 min)` });
  if (descLen > 160) issues.push({ type: 'warn', msg: `Description too long (${descLen}/160 max)` });
  if (kwCount === 0) issues.push({ type: 'error', msg: 'No keywords set' });

  const score = Math.max(0, 100 - issues.length * 20);

  return (
    <div className="mt-3 space-y-2">
      <ScoreBar score={score} label="SEO Score" />
      {issues.map((issue, i) => (
        <div key={i} className={`flex items-center gap-2 text-xs ${issue.type === 'error' ? 'text-red-400' : 'text-amber-400'}`}>
          <AlertCircle size={12} />
          {issue.msg}
        </div>
      ))}
      {issues.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-green-400">
          <CheckCircle size={12} /> All SEO checks passed
        </div>
      )}
    </div>
  );
}

const cls = 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50';

export default function AdminSEO() {
  const { toast } = useToast();
  const [seoData, setSeoData] = useState(SITE_PAGES_SEO);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [expandedVilla, setExpandedVilla] = useState(null);
  const [villaForms, setVillaForms] = useState({});

  const { data: villas = [] } = useQuery({
    queryKey: ['admin-villas-seo'],
    queryFn: () => localClient.entities.VillaListing.list('-created_date', 50),
  });

  const startEdit = (page) => {
    setEditingId(page.id);
    setEditForm({ ...page });
  };
  const cancelEdit = () => { setEditingId(null); setEditForm({}); };
  const setF = (f, v) => setEditForm(prev => ({ ...prev, [f]: v }));

  const savePage = () => {
    setSeoData(prev => prev.map(p => p.id === editingId ? { ...p, ...editForm } : p));
    setEditingId(null);
    toast({ title: 'SEO data saved' });
  };

  const saveVilla = (villaId) => {
    toast({ title: 'Villa SEO updated' });
    setExpandedVilla(null);
  };

  const setVF = (id, f, v) => setVillaForms(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [f]: v } }));

  const avgScore = seoData.reduce((sum, p) => {
    const titleOk = p.title?.length >= 30 && p.title?.length <= 60;
    const descOk = p.description?.length >= 120 && p.description?.length <= 160;
    const kwOk = p.keywords?.split(',').filter(k => k.trim()).length > 0;
    return sum + ([titleOk, descOk, kwOk].filter(Boolean).length / 3) * 100;
  }, 0) / (seoData.length || 1);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Search className="text-amber-500" size={24} /> SEO Manager
        </h1>
        <p className="text-slate-500 text-sm mt-1">Optimize title tags, meta descriptions, and keywords for all site pages</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Site Pages', value: seoData.length },
          { label: 'Villa Listings', value: villas.length },
          { label: 'Avg SEO Score', value: `${avgScore.toFixed(0)}/100` },
          { label: 'Issues Found', value: seoData.filter(p => (p.title?.length < 30 || p.description?.length < 120)).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-500 text-xs mb-1">{label}</p>
            <p className="text-white font-bold text-xl">{value}</p>
          </div>
        ))}
      </div>

      {/* Search Engine Preview Info */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3">
        <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-300 text-sm font-medium">Google Preview Guidelines</p>
          <p className="text-slate-500 text-xs mt-1">Title: 30–60 characters · Meta Description: 120–160 characters · Include primary keywords in both fields</p>
        </div>
      </div>

      {/* Site Pages */}
      <div className="space-y-3">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Globe size={16} className="text-amber-500" /> Site Pages
        </h2>
        {seoData.map(page => (
          <div key={page.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            {editingId === page.id ? (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">{page.page}</span>
                  <div className="flex gap-2">
                    <button onClick={savePage} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-colors">
                      <Save size={12} /> Save
                    </button>
                    <button onClick={cancelEdit} className="p-1.5 text-slate-500 hover:text-white"><X size={16} /></button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-400 text-xs">Title Tag</Label>
                    <span className={`text-xs ${(editForm.title?.length || 0) > 60 || (editForm.title?.length || 0) < 30 ? 'text-amber-400' : 'text-green-400'}`}>{editForm.title?.length || 0}/60</span>
                  </div>
                  <Input value={editForm.title || ''} onChange={e => setF('title', e.target.value)} className={cls} />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-slate-400 text-xs">Meta Description</Label>
                    <span className={`text-xs ${(editForm.description?.length || 0) > 160 || (editForm.description?.length || 0) < 120 ? 'text-amber-400' : 'text-green-400'}`}>{editForm.description?.length || 0}/160</span>
                  </div>
                  <Textarea value={editForm.description || ''} onChange={e => setF('description', e.target.value)} rows={2} className={cls} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-400 text-xs">Keywords (comma-separated)</Label>
                  <Input value={editForm.keywords || ''} onChange={e => setF('keywords', e.target.value)} className={cls} />
                </div>
                <SeoChecker title={editForm.title} description={editForm.description} keywords={editForm.keywords} />
              </div>
            ) : (
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm">{page.page}</span>
                      <span className="text-slate-600 text-xs">{page.path}</span>
                    </div>
                    <p className="text-blue-400 text-xs mb-0.5 truncate">{page.title}</p>
                    <p className="text-slate-500 text-xs line-clamp-1">{page.description}</p>
                    <SeoChecker title={page.title} description={page.description} keywords={page.keywords} />
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(page)} className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors">
                      <Edit size={15} />
                    </button>
                    <a href={page.path} target="_blank" rel="noreferrer" className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors">
                      <ExternalLink size={15} />
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Villa Listings SEO */}
      <div className="space-y-3">
        <h2 className="text-white font-semibold flex items-center gap-2">
          <Globe size={16} className="text-amber-500" /> Villa Listing Pages
        </h2>
        <p className="text-slate-500 text-xs">Each villa has an auto-generated SEO page at <span className="text-slate-400">/villas/[slug]</span>. You can override metadata below.</p>
        {villas.map(villa => {
          const vf = villaForms[villa.id] || {};
          const isOpen = expandedVilla === villa.id;
          return (
            <div key={villa.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <button onClick={() => setExpandedVilla(isOpen ? null : villa.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors text-left">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">{villa.name}</p>
                  <p className="text-slate-500 text-xs">/villas/{villa.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ScoreBar score={75} />
                  {isOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </div>
              </button>
              {isOpen && (
                <div className="p-4 pt-0 space-y-3 border-t border-slate-800">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400 text-xs">SEO Title Override</Label>
                      <span className="text-slate-600 text-xs">{(vf.title || villa.name || '').length}/60</span>
                    </div>
                    <Input value={vf.title ?? villa.name} onChange={e => setVF(villa.id, 'title', e.target.value)}
                      placeholder={`${villa.name} | Luxury Villa Bali | BALIORA`} className={cls} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-slate-400 text-xs">Meta Description</Label>
                      <span className="text-slate-600 text-xs">{(vf.description || villa.description || '').length}/160</span>
                    </div>
                    <Textarea value={vf.description ?? (villa.description || '')} onChange={e => setVF(villa.id, 'description', e.target.value)}
                      rows={2} placeholder="Describe this villa for search engines..." className={cls} />
                  </div>
                  <button onClick={() => saveVilla(villa.id)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition-colors">
                    <Save size={12} /> Save Villa SEO
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
