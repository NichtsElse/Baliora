/**
 * Purpose: Lists and updates villa booking inquiries stored through the local compatibility data layer.
 * Used by: /admin/bookings route.
 * Main dependencies: React Query, localClient adapter, and shared admin form controls.
 * Public functions: AdminBookings default export and BookingDrawer helper.
 * Side effects: reads and updates booking inquiry records in local storage or optional Supabase sync.
 */
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Users,
  CalendarDays,
  Loader2,
  X,
} from 'lucide-react';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const STATUS_OPTIONS = ['new', 'contacted', 'confirmed', 'cancelled'];
const STATUS_STYLES = {
  new: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  contacted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  confirmed: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};
const STATUS_ICONS = {
  new: AlertCircle,
  contacted: Clock,
  confirmed: CheckCircle,
  cancelled: XCircle,
};

function BookingDrawer({ booking, onClose, onUpdate }) {
  const [status, setStatus] = useState(booking.status);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    await onUpdate(booking.id, { status });
    setSaving(false);
    onClose();
  };

  const nights =
    booking.check_in && booking.check_out
      ? Math.round(
          (new Date(booking.check_out) - new Date(booking.check_in)) / 86400000
        )
      : null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/60" onClick={onClose} />
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-white font-semibold">Booking Inquiry</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          <div className="bg-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-slate-400 text-xs uppercase tracking-wider">
              Guest Information
            </h3>
            <p className="text-white font-semibold text-lg">
              {booking.guest_name}
            </p>
            <div className="space-y-1.5">
              {booking.email && (
                <a
                  href={`mailto:${booking.email}`}
                  className="flex items-center gap-2 text-blue-400 text-sm hover:text-blue-300"
                >
                  <Mail size={14} />
                  {booking.email}
                </a>
              )}
              {booking.whatsapp && (
                <a
                  href={`https://wa.me/${booking.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-400 text-sm hover:text-green-300"
                >
                  <Phone size={14} />
                  {booking.whatsapp}
                </a>
              )}
              {booking.guests && (
                <div className="flex items-center gap-2 text-slate-400 text-sm">
                  <Users size={14} />
                  {booking.guests} guests
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-slate-400 text-xs uppercase tracking-wider">
              Booking Details
            </h3>
            <p className="text-amber-400 font-medium">{booking.villa_name}</p>
            {booking.check_in && (
              <div className="flex items-center gap-2 text-slate-300 text-sm">
                <CalendarDays size={14} className="text-slate-500" />
                {booking.check_in} → {booking.check_out}
                {nights && (
                  <span className="text-slate-500">({nights} nights)</span>
                )}
              </div>
            )}
            {booking.special_requests && (
              <div>
                <p className="text-slate-500 text-xs mb-1">Special Requests</p>
                <p className="text-slate-300 text-sm">
                  {booking.special_requests}
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="text-slate-400 text-xs mb-1.5 block">
              Update Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                {STATUS_OPTIONS.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <a
              href={`mailto:${booking.email}?subject=Re: Your booking inquiry for ${booking.villa_name}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-sm rounded-lg"
            >
              <Mail size={14} />
              Email
            </a>
            {booking.whatsapp && (
              <a
                href={`https://wa.me/${booking.whatsapp.replace(/\D/g, '')}?text=Hello ${booking.guest_name}, regarding your booking inquiry for ${booking.villa_name}...`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-700/30 hover:bg-green-700/50 border border-green-700/50 text-green-400 text-sm rounded-lg"
              >
                <Phone size={14} />
                WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-slate-800">
          <button
            onClick={save}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-500 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminBookings() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-bookings'],
     queryFn: () => localClient.entities.BookingInquiry.list('-created_date', 100),
  });

  const updateMutation = useMutation({
     mutationFn: ({ id, data }) => localClient.entities.BookingInquiry.update(id, data),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] }),
  });

  const filtered = bookings.filter((booking) => {
    const normalizedSearch = search.toLowerCase();
    const matchSearch =
      !search ||
      booking.guest_name?.toLowerCase().includes(normalizedSearch) ||
      booking.villa_name?.toLowerCase().includes(normalizedSearch) ||
      booking.email?.toLowerCase().includes(normalizedSearch);
    const matchStatus = !statusFilter || booking.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = STATUS_OPTIONS.reduce(
    (accumulator, status) => ({
      ...accumulator,
      [status]: bookings.filter((booking) => booking.status === status).length,
    }),
    {}
  );

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-white">Booking Inquiries</h1>
        <p className="text-slate-500 text-sm mt-1">
          {bookings.length} total inquiries
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
          All ({bookings.length})
        </button>
        {STATUS_OPTIONS.map((status) => {
          const Icon = STATUS_ICONS[status];
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
              {status} ({counts[status] || 0})
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
          placeholder="Search by guest, villa, or email..."
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
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-5 py-3 text-xs text-slate-500 font-medium">
                    Guest
                  </th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium hidden md:table-cell">
                    Villa
                  </th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium hidden lg:table-cell">
                    Dates
                  </th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium hidden sm:table-cell">
                    Guests
                  </th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs text-slate-500 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((booking) => {
                  const Icon = STATUS_ICONS[booking.status] || AlertCircle;
                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => setSelected(booking)}
                    >
                      <td className="px-5 py-3.5">
                        <p className="text-white text-sm font-medium">
                          {booking.guest_name}
                        </p>
                        <p className="text-slate-500 text-xs">{booking.email}</p>
                      </td>
                      <td className="px-4 py-3.5 text-amber-400 text-sm hidden md:table-cell">
                        {booking.villa_name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-sm hidden lg:table-cell">
                        {booking.check_in
                          ? `${booking.check_in} → ${booking.check_out}`
                          : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-sm hidden sm:table-cell">
                        {booking.guests || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border rounded-full ${
                            STATUS_STYLES[booking.status] || ''
                          }`}
                        >
                          <Icon size={11} />
                          {booking.status}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3.5"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button
                          onClick={() => setSelected(booking)}
                          className="p-1.5 text-slate-500 hover:text-amber-400 transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <BookingDrawer
          booking={selected}
          onClose={() => setSelected(null)}
          onUpdate={(id, data) => updateMutation.mutateAsync({ id, data })}
        />
      )}
    </div>
  );
}
