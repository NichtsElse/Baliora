import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  Plus,
  CheckCircle,
  XCircle,
  CalendarDays,
  Loader2,
  X,
  CreditCard,
  User,
  Building,
  DollarSign,
  AlertCircle,
  Clock,
  LogOut,
  Mail,
  MessageSquare,
} from 'lucide-react';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const STATUS_OPTIONS = ['confirmed', 'checked_in', 'checked_out', 'cancelled'];
const STATUS_STYLES = {
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  checked_in: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  checked_out: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const PAYMENT_OPTIONS = ['paid', 'partially_paid', 'unpaid'];
const PAYMENT_STYLES = {
  paid: 'bg-green-500/10 text-green-400 border-green-500/20',
  partially_paid: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  unpaid: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function AdminReservations() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form State for Add/Edit
  const [newRes, setNewRes] = useState({
    villa_id: '',
    guest_name: '',
    email: '',
    whatsapp: '',
    check_in: '',
    check_out: '',
    guests: 2,
    total_price: 0,
    status: 'confirmed',
    payment_status: 'unpaid',
    notes: '',
  });

  // Queries
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['admin-reservations'],
    queryFn: () => localClient.entities.Reservation.list('-created_date', 100),
  });

  const { data: villas = [] } = useQuery({
    queryKey: ['admin-villas-list'],
    queryFn: () => localClient.entities.VillaListing.list('name', 100),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => localClient.entities.Reservation.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      toast({
        title: 'Success',
        description: 'Reservation created successfully',
      });
      setIsAdding(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => localClient.entities.Reservation.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      toast({
        title: 'Success',
        description: 'Reservation updated successfully',
      });
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => localClient.entities.Reservation.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reservations'] });
      toast({
        title: 'Deleted',
        description: 'Reservation deleted successfully',
      });
      setSelected(null);
    },
  });

  // Add Communication Log Mutation
  const logCommMutation = useMutation({
    mutationFn: (data) => localClient.entities.CommunicationLog.create(data),
  });

  const resetForm = () => {
    setNewRes({
      villa_id: '',
      guest_name: '',
      email: '',
      whatsapp: '',
      check_in: '',
      check_out: '',
      guests: 2,
      total_price: 0,
      status: 'confirmed',
      payment_status: 'unpaid',
      notes: '',
    });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const villa = villas.find((v) => v.id === newRes.villa_id);
    const payload = {
      ...newRes,
      villa_name: villa ? villa.name : 'Unknown Villa',
      guests: Number(newRes.guests),
      total_price: Number(newRes.total_price),
    };
    await createMutation.mutateAsync(payload);

    // Also auto-add guest to Guest Database if not exists
    await localClient.entities.Guest.create({
      name: newRes.guest_name,
      email: newRes.email,
      whatsapp: newRes.whatsapp,
      nationality: 'Unknown',
      total_bookings: 1,
      total_spent: Number(newRes.total_price),
      notes: newRes.notes,
    });

    // Auto-create communication confirmation log
    await logCommMutation.mutateAsync({
      recipient_name: newRes.guest_name,
      recipient_email: newRes.email,
      channel: 'Email',
      subject: `Booking Confirmed - ${villa ? villa.name : 'BALIORA Villa'}`,
      message: `Dear ${newRes.guest_name}, thank you for booking ${villa ? villa.name : 'your stay'}. Check-in: ${newRes.check_in}, Check-out: ${newRes.check_out}.`,
      status: 'sent',
    });
  };

  const handleUpdateStatus = async (res, newStatus) => {
    await updateMutation.mutateAsync({
      id: res.id,
      data: { status: newStatus },
    });
  };

  const handleUpdatePaymentStatus = async (res, newPaymentStatus) => {
    await updateMutation.mutateAsync({
      id: res.id,
      data: { payment_status: newPaymentStatus },
    });
  };

  // Filtered Reservations
  const filtered = reservations.filter((res) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      res.guest_name?.toLowerCase().includes(term) ||
      res.villa_name?.toLowerCase().includes(term) ||
      res.email?.toLowerCase().includes(term);
    const matchesStatus = !statusFilter || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Reservations</h1>
          <p className="text-slate-500 text-sm mt-1">
            {reservations.length} total bookings managed
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
        >
          <Plus size={16} /> Add Reservation
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by guest, villa, or email..."
            className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={!statusFilter ? 'default' : 'outline'}
            onClick={() => setStatusFilter('')}
            className={!statusFilter ? 'bg-amber-600 hover:bg-amber-500 text-white border-transparent' : 'border-slate-700 text-slate-400 hover:text-white'}
          >
            All
          </Button>
          {STATUS_OPTIONS.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              onClick={() => setStatusFilter(status)}
              className={
                statusFilter === status
                  ? 'bg-amber-600 hover:bg-amber-500 text-white border-transparent'
                  : 'border-slate-700 text-slate-400 hover:text-white capitalize'
              }
            >
              {status.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-amber-500" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            No reservations found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Guest</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Villa</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Stay Dates</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Total Price</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Payment</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Status</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((res) => {
                  const checkIn = new Date(res.check_in);
                  const checkOut = new Date(res.check_out);
                  const diffTime = Math.abs(checkOut - checkIn);
                  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 0;

                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                      onClick={() => setSelected(res)}
                    >
                      <td className="px-6 py-4">
                        <p className="text-white text-sm font-medium">{res.guest_name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{res.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-300 text-sm font-medium">{res.villa_name}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{res.guests} Guests</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-300 text-sm">
                          {res.check_in} → {res.check_out}
                        </p>
                        <p className="text-slate-500 text-xs mt-0.5">{nights} nights</p>
                      </td>
                      <td className="px-6 py-4 text-white text-sm font-medium">
                        ${res.total_price?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border rounded-full font-medium capitalize ${PAYMENT_STYLES[res.payment_status] || ''}`}>
                          {res.payment_status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border rounded-full font-medium capitalize ${STATUS_STYLES[res.status] || ''}`}>
                          {res.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          onClick={() => setSelected(res)}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          <Eye size={16} />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer: View & Edit Reservation */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-semibold text-lg">Reservation Details</h2>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Guest Card */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-wider">
                  <User size={14} /> Guest Profile
                </div>
                <h3 className="text-white font-bold text-lg">{selected.guest_name}</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="text-slate-500" /> {selected.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <MessageSquare size={14} className="text-slate-500" /> {selected.whatsapp || 'No WhatsApp'}
                  </p>
                </div>
              </div>

              {/* Villa & Booking details */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs uppercase tracking-wider">
                  <Building size={14} /> Villa & Booking
                </div>
                <h3 className="text-white font-semibold">{selected.villa_name}</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={14} className="text-slate-500" /> {selected.check_in} → {selected.check_out}
                  </p>
                  <p className="flex items-center gap-2">
                    <DollarSign size={14} className="text-slate-500" /> Total Cost: ${selected.total_price?.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status Selectors */}
              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Reservation Status</label>
                  <Select
                    value={selected.status}
                    onValueChange={(val) => handleUpdateStatus(selected, val)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="capitalize">
                          {opt.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Payment Status</label>
                  <Select
                    value={selected.payment_status}
                    onValueChange={(val) => handleUpdatePaymentStatus(selected, val)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {PAYMENT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="capitalize">
                          {opt.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selected.notes && (
                <div className="space-y-1">
                  <h4 className="text-slate-400 text-xs font-medium">Notes & Requests</h4>
                  <p className="text-slate-300 text-sm bg-slate-800/30 p-3 rounded-lg border border-slate-800">{selected.notes}</p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-slate-800 flex gap-3">
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Delete this reservation?')) {
                    deleteMutation.mutate(selected.id);
                  }
                }}
                className="flex-1"
              >
                Delete
              </Button>
              <Button
                onClick={() => setSelected(null)}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Reservation */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAdding(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-bold text-lg">Add New Reservation</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Select Villa</label>
                <Select
                  value={newRes.villa_id}
                  onValueChange={(val) => setNewRes({ ...newRes, villa_id: val })}
                  required
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select a Villa" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {villas.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Guest Name</label>
                  <Input
                    required
                    value={newRes.guest_name}
                    onChange={(e) => setNewRes({ ...newRes, guest_name: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Email</label>
                  <Input
                    type="email"
                    required
                    value={newRes.email}
                    onChange={(e) => setNewRes({ ...newRes, email: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">WhatsApp</label>
                  <Input
                    value={newRes.whatsapp}
                    onChange={(e) => setNewRes({ ...newRes, whatsapp: e.target.value })}
                    placeholder="+62..."
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Total Guests</label>
                  <Input
                    type="number"
                    min={1}
                    required
                    value={newRes.guests}
                    onChange={(e) => setNewRes({ ...newRes, guests: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Check-In</label>
                  <Input
                    type="date"
                    required
                    value={newRes.check_in}
                    onChange={(e) => setNewRes({ ...newRes, check_in: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Check-Out</label>
                  <Input
                    type="date"
                    required
                    value={newRes.check_out}
                    onChange={(e) => setNewRes({ ...newRes, check_out: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Total Price ($)</label>
                  <Input
                    type="number"
                    min={0}
                    required
                    value={newRes.total_price}
                    onChange={(e) => setNewRes({ ...newRes, total_price: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Payment Status</label>
                  <Select
                    value={newRes.payment_status}
                    onValueChange={(val) => setNewRes({ ...newRes, payment_status: val })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {PAYMENT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="capitalize">
                          {opt.replace('_', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Notes / Special Requests</label>
                <Textarea
                  value={newRes.notes}
                  onChange={(e) => setNewRes({ ...newRes, notes: e.target.value })}
                  placeholder="E.g., Airport pick up, extra beds..."
                  className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAdding(false)}
                  className="border-slate-700 text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isLoading}
                  className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
                >
                  {createMutation.isLoading && <Loader2 size={16} className="animate-spin" />}
                  Create Reservation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
