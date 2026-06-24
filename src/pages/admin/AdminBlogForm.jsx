/**
 * Purpose: Creates and edits blog posts in the admin area.
 * Used by: /admin/blog/new and /admin/blog/:id routes.
 * Main dependencies: localClient blog entity, React Query, and file upload integration.
 * Public functions: AdminBlogForm default export and slugify helper.
 * Side effects: reads and writes blog post records and uploads featured images.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, Loader2, Plus, X, Upload } from 'lucide-react';

const EMPTY = { title: '', slug: '', excerpt: '', content: '', featured_image: '', category: '', tags: [], status: 'draft', seo_title: '', seo_description: '', author: '', published_at: '' };

function slugify(str) { return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''); }

export default function AdminBlogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = !!id && id !== 'new';

  const [form, setForm] = useState(EMPTY);
  const [newTag, setNewTag] = useState('');
  const [uploading, setUploading] = useState(false);

  const { data: posts } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: () => localClient.entities.BlogPost.list('-created_date', 100),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && posts) {
      const post = posts.find(p => p.id === id);
      if (post) setForm({ ...EMPTY, ...post });
    }
  }, [isEdit, posts, id]);

  const saveMutation = useMutation({
    mutationFn: (data) => isEdit ? localClient.entities.BlogPost.update(id, data) : localClient.entities.BlogPost.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-blog'] }); navigate('/admin/blog'); },
  });

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const handleTitle = (v) => setForm(p => ({ ...p, title: v, slug: isEdit ? p.slug : slugify(v) }));
  const addTag = () => { if (newTag.trim()) { set('tags', [...(form.tags || []), newTag.trim()]); setNewTag(''); } };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await localClient.integrations.Core.UploadFile({ file });
    set('featured_image', file_url);
    setUploading(false);
  };

  const inputCls = 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-amber-500/50';

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/blog" className="text-slate-500 hover:text-slate-300"><ArrowLeft size={20} /></Link>
        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Post' : 'New Blog Post'}</h1>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Title *</Label>
                <Input required value={form.title} onChange={e => handleTitle(e.target.value)}
                  placeholder="5 Reasons to Invest in Bali Villas" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Slug</Label>
                <Input value={form.slug} onChange={e => set('slug', e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Excerpt</Label>
                <Textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)}
                  rows={2} placeholder="Brief summary shown in listings..." className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Content</Label>
                <Textarea value={form.content} onChange={e => set('content', e.target.value)}
                  rows={14} placeholder="Write your article here..." className={inputCls} />
              </div>
            </div>

            {/* SEO */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-white font-medium text-sm border-b border-slate-800 pb-3">SEO Settings</h3>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">SEO Title</Label>
                <Input value={form.seo_title} onChange={e => set('seo_title', e.target.value)}
                  placeholder="Leave blank to use post title" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Meta Description</Label>
                <Textarea value={form.seo_description} onChange={e => set('seo_description', e.target.value)}
                  rows={2} placeholder="150–160 characters..." className={inputCls} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-white font-medium text-sm border-b border-slate-800 pb-3">Publish</h3>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Status</Label>
                <Select value={form.status} onValueChange={v => set('status', v)}>
                  <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Publish Date</Label>
                <Input type="date" value={form.published_at} onChange={e => set('published_at', e.target.value)} className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Author</Label>
                <Input value={form.author} onChange={e => set('author', e.target.value)} placeholder="BALIORA Team" className={inputCls} />
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-white font-medium text-sm border-b border-slate-800 pb-3">Category & Tags</h3>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Category</Label>
                <Input value={form.category} onChange={e => set('category', e.target.value)}
                  placeholder="Villa Investment" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-400 text-xs">Tags</Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(form.tags || []).map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 bg-slate-800 border border-slate-700 text-slate-400 text-xs px-2 py-0.5 rounded-full">
                      {tag}<button type="button" onClick={() => set('tags', form.tags.filter((_, j) => j !== i))}><X size={10} /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <Input value={newTag} onChange={e => setNewTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add tag..." className={`${inputCls} text-xs`} />
                  <button type="button" onClick={addTag} className="p-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700">
                    <Plus size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-white font-medium text-sm border-b border-slate-800 pb-3">Featured Image</h3>
              {form.featured_image && (
                <div className="relative">
                  <img src={form.featured_image} alt="" className="w-full h-36 object-cover rounded-lg" />
                  <button type="button" onClick={() => set('featured_image', '')}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-600/90 rounded-full flex items-center justify-center">
                    <X size={10} className="text-white" />
                  </button>
                </div>
              )}
              <Input value={form.featured_image} onChange={e => set('featured_image', e.target.value)}
                placeholder="Paste image URL..." className={`${inputCls} text-xs`} />
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs rounded-lg border border-slate-700 w-fit">
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                Upload Image
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saveMutation.isPending}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50">
            {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isEdit ? 'Save Changes' : 'Publish Post'}
          </button>
          <Link to="/admin/blog" className="px-5 py-2.5 text-slate-400 hover:text-white text-sm">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
