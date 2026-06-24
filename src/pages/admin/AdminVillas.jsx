import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Edit, Trash2, Eye, MapPin, Bed, Star,
  CheckCircle, AlertTriangle, EyeOff, Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const STATUS_STYLES = {
  available: 'bg-green-500/10 text-green-400 border-green-500/20',
  hidden: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  maintenance: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const STATUS_ICONS = {
  available: CheckCircle,
  hidden: EyeOff,
  maintenance: AlertTriangle,
};

export default function AdminVillas() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const qc = useQueryClient();

  const { data: villas = [], isLoading } = useQuery({
    queryKey: ['admin-villas'],
     queryFn: () => localClient.entities.VillaListing.list('-created_date', 100),
  });

  const deleteMutation = useMutation({
     mutationFn: (id) => localClient.entities.VillaListing.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-villas'] }),
  });

  const updateStatus = useMutation({
     mutationFn: ({ id, status }) => localClient.entities.VillaListing.update(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-villas'] }),
  });

  const filtered = villas.filter(v => {
    const matchSearch = !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.location?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Villa Management</h1>
          <p className="text-slate-500 text-sm mt-1">{villas.length} properties in portfolio</p>
        </div>
        <Link to="/admin/villas/new"
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} /> Add Villa
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search villas..." className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" />
        </div>
        <div className="flex gap-2">
          {['', 'available', 'hidden', 'maintenance'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-xs rounded-lg border transition-colors ${statusFilter === s ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-700 text-slate-400 hover:border-slate-600'}`}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-amber-500" size={28} /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">No villas found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-5 py-3 text-xs text-slate-500 font-medium">Villa</th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium hidden md:table-cell">Location</th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium hidden lg:table-cell">Beds / Guests</th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium">Price/Night</th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium hidden sm:table-cell">Rating</th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium">Status</th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map(villa => {
                  const StatusIcon = STATUS_ICONS[villa.status] || CheckCircle;
                  return (
                    <tr key={villa.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {villa.image_urls?.[0] ? (
                            <img src={villa.image_urls[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                              <Bed size={16} className="text-slate-600" />
                            </div>
                          )}
                          <div>
                            <p className="text-white text-sm font-medium">{villa.name}</p>
                            <p className="text-slate-600 text-xs">/{villa.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <div className="flex items-center gap-1 text-slate-400 text-sm">
                          <MapPin size={13} />{villa.location}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-sm hidden lg:table-cell">
                        {villa.bedrooms} BR · {villa.max_guests} guests
                      </td>
                      <td className="px-4 py-3.5 text-amber-400 text-sm font-medium">
                        ${villa.price_per_night?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3.5 hidden sm:table-cell">
                        {villa.rating ? (
                          <div className="flex items-center gap-1 text-amber-400 text-sm">
                            <Star size={12} className="fill-amber-400" />{villa.rating}
                          </div>
                        ) : <span className="text-slate-600 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border rounded-full ${STATUS_STYLES[villa.status] || STATUS_STYLES.hidden}`}>
                          <StatusIcon size={11} />{villa.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Link to={`/villas/${villa.slug}`} target="_blank"
                            className="p-1.5 text-slate-500 hover:text-blue-400 transition-colors" title="View on site">
                            <Eye size={15} />
                          </Link>
                          <Link to={`/admin/villas/${villa.id}/edit`}
                            className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors" title="Edit">
                            <Edit size={15} />
                          </Link>
                          <button
                            onClick={() => { if (confirm(`Delete "${villa.name}"?`)) deleteMutation.mutate(villa.id); }}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
