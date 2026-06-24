/**
 * Purpose: Lists villa owners managed locally and provides quick links for contact, editing, and deletion.
 * Used by: /admin/owners route.
 * Main dependencies: React Query, localClient adapter, router links, and shared admin inputs.
 * Public functions: AdminOwners default export.
 * Side effects: reads and deletes owner records in local storage or optional Supabase sync.
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Mail, Phone, Loader2 } from 'lucide-react';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';

const STATUS_STYLES = {
  active: 'bg-green-500/10 text-green-400 border-green-500/20',
  inactive: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  prospect: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};

export default function AdminOwners() {
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: owners = [], isLoading } = useQuery({
    queryKey: ['admin-owners'],
     queryFn: () => localClient.entities.VillaOwner.list('-created_date', 100),
  });

  const deleteMutation = useMutation({
     mutationFn: (id) => localClient.entities.VillaOwner.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-owners'] }),
  });

  const filtered = owners.filter(
    (owner) =>
      !search ||
      owner.name?.toLowerCase().includes(search.toLowerCase()) ||
      owner.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Villa Owners</h1>
          <p className="text-slate-500 text-sm mt-1">{owners.length} owners</p>
        </div>
        <Link
          to="/admin/owners/new"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          <Plus size={16} /> Add Owner
        </Link>
      </div>

      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search owners..."
          className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-amber-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            No owners found
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map((owner) => (
              <div
                key={owner.id}
                className="px-5 py-4 flex items-center gap-4 hover:bg-slate-800/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 font-bold text-sm">
                    {owner.name?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium">{owner.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    {owner.email && (
                      <span className="text-slate-500 text-xs">
                        {owner.email}
                      </span>
                    )}
                    {owner.nationality && (
                      <span className="text-slate-600 text-xs">
                        {owner.nationality}
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden md:block text-center">
                  <p className="text-amber-400 text-sm font-medium">
                    {owner.revenue_share_percent
                      ? `${owner.revenue_share_percent}%`
                      : '—'}
                  </p>
                  <p className="text-slate-600 text-xs">Revenue share</p>
                </div>
                <div className="hidden sm:block">
                  <span
                    className={`text-xs px-2.5 py-1 border rounded-full ${
                      STATUS_STYLES[owner.status] || ''
                    }`}
                  >
                    {owner.status}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {owner.email && (
                    <a
                      href={`mailto:${owner.email}`}
                      className="p-1.5 text-slate-500 hover:text-blue-400"
                    >
                      <Mail size={15} />
                    </a>
                  )}
                  {owner.whatsapp && (
                    <a
                      href={`https://wa.me/${owner.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-slate-500 hover:text-green-400"
                    >
                      <Phone size={15} />
                    </a>
                  )}
                  <Link
                    to={`/admin/owners/${owner.id}/edit`}
                    className="p-1.5 text-slate-500 hover:text-amber-400"
                  >
                    <Edit size={15} />
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm('Delete this owner?')) {
                        deleteMutation.mutate(owner.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
