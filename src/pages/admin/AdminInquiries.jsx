/**
 * Purpose: Lists and updates owner consultation inquiries stored through the local compatibility data layer.
 * Used by: /admin/inquiries route.
 * Main dependencies: React Query, localClient adapter, and shared admin form controls.
 * Public functions: AdminInquiries default export and InfoRow helper.
 * Side effects: reads and updates inquiry records in local storage or optional Supabase sync.
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Eye, Phone, Mail, MapPin, Loader2, X, AlertCircle, Clock, CheckCircle, PlayCircle } from 'lucide-react';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_OPTIONS = ['new', 'contacted', 'in_progress', 'closed'];

const STATUS_STYLES = {
  new: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  contacted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  in_progress: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  closed: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const STATUS_ICONS = {
  new: AlertCircle,
  contacted: Clock,
  in_progress: PlayCircle,
  closed: CheckCircle,
};

export default function AdminInquiries() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const { data: inquiries = [], isLoading } = useQuery({
    queryKey: ['admin-inquiries'],
     queryFn: () => localClient.entities.Inquiry.list('-created_date', 100),
  });

  const updateMutation = useMutation({
     mutationFn: ({ id, status }) => localClient.entities.Inquiry.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-inquiries'] }),
  });

  const filtered = inquiries.filter((inquiry) => {
    const normalizedSearch = search.toLowerCase();
    const matchSearch =
      !search ||
      inquiry.name?.toLowerCase().includes(normalizedSearch) ||
      inquiry.email?.toLowerCase().includes(normalizedSearch);
    const matchStatus =
      !statusFilter || inquiry.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = STATUS_OPTIONS.reduce(
    (accumulator, status) => ({
      ...accumulator,
      [status]: inquiries.filter((inquiry) => inquiry.status === status).length,
    }),
    {}
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Owner Inquiries</h1>
        <p className="text-slate-500 text-sm mt-1">
          {inquiries.length} total inquiries
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
            !statusFilter
              ? 'bg-amber-600 border-amber-600 text-white'
              : 'border-slate-700 text-slate-400 hover:border-slate-600'
          }`}
        >
          All ({inquiries.length})
        </button>
        {STATUS_OPTIONS.map((status) => {
          const Icon = STATUS_ICONS[status] || AlertCircle;
          return (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border transition-colors ${
                statusFilter === status
                  ? `${STATUS_STYLES[status]} border-opacity-100`
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Icon size={13} />
              {status.replace('_', ' ')} ({counts[status] || 0})
            </button>
          );
        })}
      </div>

      <div className="relative">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search inquiries by owner or email..."
          className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-amber-500" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            No inquiries found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-3 text-xs text-slate-500 font-medium text-left">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium text-left hidden md:table-cell">
                    Location
                  </th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium text-left hidden lg:table-cell">
                    Current Status
                  </th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium text-left">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setSelected(inquiry)}
                  >
                    <td className="px-5 py-3.5">
                      <p className="text-white text-sm font-medium">
                        {inquiry.name}
                      </p>
                      <p className="text-slate-500 text-xs">{inquiry.email}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1 text-slate-400 text-sm">
                        <MapPin size={12} />
                        {inquiry.villa_location || '—'}
                        {inquiry.bedroom_count && (
                          <span className="text-slate-600 ml-1">
                            · {inquiry.bedroom_count} BR
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-400 text-sm hidden lg:table-cell">
                      {inquiry.current_status ? inquiry.current_status.replace('_', ' ') : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center text-xs px-2.5 py-1 border rounded-full ${
                          STATUS_STYLES[inquiry.status] || ''
                        }`}
                      >
                        {inquiry.status ? inquiry.status.replace('_', ' ') : ''}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3.5"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        onClick={() => setSelected(inquiry)}
                        className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/60"
            onClick={() => setSelected(null)}
          />
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold">Inquiry Detail</h2>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-500 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <InfoRow label="Name" value={selected.name} />
              <InfoRow label="Email" value={selected.email} />
              <InfoRow label="WhatsApp" value={selected.whatsapp} />
              <InfoRow label="Villa Location" value={selected.villa_location} />
              <InfoRow label="Bedrooms" value={selected.bedroom_count} />
              <InfoRow label="Current Status" value={selected.current_status?.replace('_', ' ')} />
              {selected.message && (
                <InfoRow label="Message" value={selected.message} />
              )}
              <div>
                <label className="text-slate-500 text-xs block mb-1.5">
                  Update Status
                </label>
                <Select
                  value={selected.status}
                  onValueChange={(status) => {
                    updateMutation.mutate({ id: selected.id, status });
                    setSelected((previous) => ({ ...previous, status }));
                  }}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {STATUS_OPTIONS.map(
                      (status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace('_', ' ')}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-800 mt-2">
                {selected.email && (
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selected.email}&su=${encodeURIComponent('Follow Up: Villa Consultation - BALIORA')}&body=${encodeURIComponent(`Halo ${selected.name},\n\nTerima kasih telah menghubungi BALIORA. Kami telah menerima permintaan konsultasi untuk villa Anda.\n\nKami ingin berdiskusi lebih lanjut mengenai bagaimana layanan kami dapat membantu memaksimalkan potensi properti Anda.\n\nKapan waktu yang paling tepat bagi Anda untuk melakukan panggilan singkat atau meeting?\n\nSalam hangat,\nTim BALIORA`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-lg transition-colors"
                  >
                    <Mail size={14} />
                    Email
                  </a>
                )}
                {selected.whatsapp && (
                  <a
                    href={`https://wa.me/${selected.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo ${selected.name}, kami dari BALIORA. Kami telah menerima permintaan konsultasi Anda untuk villa Anda.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-700/30 hover:bg-green-700/50 border border-green-700/50 text-green-400 text-sm rounded-lg transition-colors"
                  >
                    <Phone size={14} />
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  if (!value) {
    return null;
  }

  return (
    <div>
      <p className="text-slate-500 text-xs mb-0.5">{label}</p>
      <p className="text-white text-sm">{value}</p>
    </div>
  );
}
