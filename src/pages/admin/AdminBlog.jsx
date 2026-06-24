import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Calendar, Tag, FileText, Loader2 } from 'lucide-react';

const STATUS_STYLES = {
  draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  published: 'bg-green-500/10 text-green-400 border-green-500/20',
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function AdminBlog() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const qc = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['admin-blog'],
     queryFn: () => localClient.entities.BlogPost.list('-created_date', 100),
  });

  const deleteMutation = useMutation({
     mutationFn: (id) => localClient.entities.BlogPost.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blog'] }),
  });

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Management</h1>
          <p className="text-slate-500 text-sm mt-1">{posts.length} posts</p>
        </div>
        <Link to="/admin/blog/new"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium">
          <Plus size={16} /> New Post
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search posts..." className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <div className="flex gap-2">
          {['', 'draft', 'published', 'scheduled'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${statusFilter === s ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-amber-500" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-xl text-slate-500">
              No posts yet.{' '}
              <Link to="/admin/blog/new" className="text-amber-500 hover:text-amber-400">Create your first post.</Link>
            </div>
          ) : filtered.map(post => (
            <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex gap-4 items-start hover:border-slate-700 transition-colors">
              {post.featured_image ? (
                <img src={post.featured_image} alt="" className="w-20 h-16 rounded-lg object-cover flex-shrink-0 hidden sm:block" />
              ) : (
                <div className="w-20 h-16 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 hidden sm:block">
                  <FileText size={20} className="text-slate-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-white font-medium">{post.title}</h3>
                    {post.excerpt && <p className="text-slate-500 text-sm mt-1 line-clamp-1">{post.excerpt}</p>}
                    <div className="flex items-center gap-3 mt-2">
                      {post.category && (
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <Tag size={11} />{post.category}
                        </span>
                      )}
                      {post.published_at && (
                        <span className="flex items-center gap-1 text-xs text-slate-600">
                          <Calendar size={11} />{post.published_at}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-1 border rounded-full ${STATUS_STYLES[post.status] || STATUS_STYLES.draft}`}>
                      {post.status}
                    </span>
                    <Link to={`/admin/blog/${post.id}/edit`} className="p-1.5 text-slate-500 hover:text-amber-400">
                      <Edit size={15} />
                    </Link>
                    <button onClick={() => { if (confirm('Delete this post?')) deleteMutation.mutate(post.id); }}
                      className="p-1.5 text-slate-500 hover:text-red-400"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
