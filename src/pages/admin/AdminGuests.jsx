import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  Plus,
  Loader2,
  X,
  User,
  Mail,
  Phone,
  Globe,
  Calendar,
  DollarSign,
  Briefcase,
  SlidersHorizontal,
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

export default function AdminGuests() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form State
  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    whatsapp: '',
    nationality: '',
    notes: '',
    status: 'active',
  });

  // Queries
  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['admin-guests'],
    queryFn: () => localClient.entities.Guest.list('-created_date', 100),
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['admin-reservations-minimal'],
    queryFn: () => localClient.entities.Reservation.list('-created_date', 200),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => localClient.entities.Guest.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-guests'] });
      toast({
        title: 'Success',
        description: 'Guest profile created successfully',
      });
      setIsAdding(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => localClient.entities.Guest.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-guests'] });
      toast({
        title: 'Success',
        description: 'Guest profile updated successfully',
      });
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => localClient.entities.Guest.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-guests'] });
      toast({
        title: 'Deleted',
        description: 'Guest profile deleted successfully',
      });
      setSelected(null);
    },
  });

  const resetForm = () => {
    setNewGuest({
      name: '',
      email: '',
      whatsapp: '',
      nationality: '',
      notes: '',
      status: 'active',
    });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...newGuest,
      total_bookings: 0,
      total_spent: 0,
    });
  };

  // Filtered Guests
  const filtered = guests.map(guest => {
    // Dynamically calculate bookings/spend if they match emails
    const matches = reservations.filter(r => r.email?.toLowerCase() === guest.email?.toLowerCase());
    const totalBookings = matches.length || guest.total_bookings || 0;
    const totalSpent = matches.reduce((sum, r) => sum + (r.total_price || 0), 0) || guest.total_spent || 0;
    return {
      ...guest,
      total_bookings: totalBookings,
      total_spent: totalSpent,
    };
  }).filter((guest) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      guest.name?.toLowerCase().includes(term) ||
      guest.email?.toLowerCase().includes(term) ||
      guest.nationality?.toLowerCase().includes(term);
    const matchesStatus = !statusFilter || guest.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Selected Guest Reservations
  const selectedReservations = selected
    ? reservations.filter(r => r.email?.toLowerCase() === selected.email?.toLowerCase())
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Guest Database</h1>
          <p className="text-slate-500 text-sm mt-1">
            {guests.length} customer profiles
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
        >
          <Plus size={16} /> Add Guest Profile
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
            placeholder="Search by name, email, or country..."
            className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={!statusFilter ? 'default' : 'outline'}
            onClick={() => setStatusFilter('')}
            className={!statusFilter ? 'bg-amber-600 hover:bg-amber-500 text-white border-transparent' : 'border-slate-700 text-slate-400 hover:text-white'}
          >
            All Guests
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('active')}
            className={statusFilter === 'active' ? 'bg-amber-600 hover:bg-amber-500 text-white border-transparent' : 'border-slate-700 text-slate-400 hover:text-white'}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'inactive' ? 'default' : 'outline'}
            onClick={() => setStatusFilter('inactive')}
            className={statusFilter === 'inactive' ? 'bg-amber-600 hover:bg-amber-500 text-white border-transparent' : 'border-slate-700 text-slate-400 hover:text-white'}
          >
            Inactive
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-amber-500" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            No guest profiles found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Guest Details</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">WhatsApp</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Nationality</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Bookings</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Total Spend</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Status</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((guest) => (
                  <tr
                    key={guest.id}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelected(guest)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-600/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm">
                          {guest.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{guest.name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{guest.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{guest.whatsapp || '—'}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Globe size={14} className="text-slate-500" />
                        {guest.nationality || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white text-sm font-semibold">{guest.total_bookings}</td>
                    <td className="px-6 py-4 text-amber-400 text-sm font-semibold">
                      ${guest.total_spent?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full font-medium border ${
                        guest.status === 'active'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {guest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        onClick={() => setSelected(guest)}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        <Eye size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Drawer: Guest Details & History */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setSelected(null)} />
          <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-semibold text-lg font-display">Guest Profile Details</h2>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Profile card summary */}
              <div className="flex items-center gap-4 bg-slate-800/40 p-4 border border-slate-800 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-amber-600/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xl">
                  {selected.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{selected.name}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Member since {new Date(selected.created_date || '').toLocaleDateString()}</p>
                </div>
              </div>

              {/* Edit Details */}
              <div className="space-y-4">
                <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Contact & Metadata</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Email</label>
                    <Input
                      value={selected.email}
                      onChange={(e) => updateMutation.mutate({ id: selected.id, data: { email: e.target.value } })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">WhatsApp</label>
                    <Input
                      value={selected.whatsapp}
                      onChange={(e) => updateMutation.mutate({ id: selected.id, data: { whatsapp: e.target.value } })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Nationality</label>
                    <Input
                      value={selected.nationality}
                      onChange={(e) => updateMutation.mutate({ id: selected.id, data: { nationality: e.target.value } })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 text-xs mb-1 block">Status</label>
                    <Select
                      value={selected.status}
                      onValueChange={(val) => updateMutation.mutate({ id: selected.id, data: { status: val } })}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 text-xs mb-1 block">Internal Staff Notes</label>
                  <Textarea
                    value={selected.notes || ''}
                    placeholder="Preference details, guest habits..."
                    onChange={(e) => updateMutation.mutate({ id: selected.id, data: { notes: e.target.value } })}
                    className="bg-slate-800 border-slate-700 text-white min-h-[70px]"
                  />
                </div>
              </div>

              {/* Reservation History */}
              <div className="space-y-3">
                <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar size={14} /> Reservation History ({selectedReservations.length})
                </h4>

                {selectedReservations.length === 0 ? (
                  <div className="text-slate-500 text-xs p-4 border border-dashed border-slate-800 rounded-lg text-center">
                    No reservations found for this email.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto">
                    {selectedReservations.map(res => (
                      <div key={res.id} className="bg-slate-800/30 border border-slate-800 p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="text-slate-200 text-sm font-medium">{res.villa_name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{res.check_in} → {res.check_out}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-bold">${res.total_price?.toLocaleString()}</p>
                          <span className="text-[10px] text-amber-500 capitalize">{res.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 flex gap-3">
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Delete this guest profile?')) {
                    deleteMutation.mutate(selected.id);
                  }
                }}
                className="flex-1"
              >
                Delete Profile
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

      {/* Modal: Add Guest Profile */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAdding(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-bold text-lg">Add New Guest Profile</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Full Name</label>
                <Input
                  required
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Email</label>
                <Input
                  type="email"
                  required
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({ ...newGuest, email: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">WhatsApp</label>
                <Input
                  value={newGuest.whatsapp}
                  onChange={(e) => setNewGuest({ ...newGuest, whatsapp: e.target.value })}
                  placeholder="+62..."
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Nationality</label>
                <Input
                  value={newGuest.nationality}
                  onChange={(e) => setNewGuest({ ...newGuest, nationality: e.target.value })}
                  placeholder="e.g. Australian"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Initial Notes</label>
                <Textarea
                  value={newGuest.notes}
                  onChange={(e) => setNewGuest({ ...newGuest, notes: e.target.value })}
                  placeholder="Preferences, allergy alerts..."
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
                  Save Profile
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
