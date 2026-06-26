import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  Plus,
  Loader2,
  X,
  User,
  Phone,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  Briefcase,
} from 'lucide-react';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const SHIFT_OPTIONS = ['Morning', 'Afternoon', 'Night'];
const ROLE_OPTIONS = ['Housekeeper', 'Technician', 'Gardener', 'Guard', 'Supervisor'];
const STATUS_OPTIONS = ['active', 'inactive'];

export default function AdminStaff() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form State
  const [newStaff, setNewStaff] = useState({
    name: '',
    role: 'Housekeeper',
    contact_number: '',
    shift: 'Morning',
    assigned_villas: '',
    status: 'active',
  });

  // Queries
  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ['admin-ops-staff'],
    queryFn: () => localClient.entities.OpsStaff.list('-created_date', 100),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => localClient.entities.OpsStaff.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ops-staff'] });
      toast({
        title: 'Staff Profile Created',
        description: 'New staff profile added successfully.',
      });
      setIsAdding(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => localClient.entities.OpsStaff.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ops-staff'] });
      toast({
        title: 'Staff Profile Updated',
        description: 'Profile details updated successfully.',
      });
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => localClient.entities.OpsStaff.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ops-staff'] });
      toast({
        title: 'Profile Deleted',
        description: 'Staff profile removed successfully.',
      });
      setSelected(null);
    },
  });

  const resetForm = () => {
    setNewStaff({
      name: '',
      role: 'Housekeeper',
      contact_number: '',
      shift: 'Morning',
      assigned_villas: '',
      status: 'active',
    });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(newStaff);
  };

  // Filtered Staff
  const filtered = staffList.filter((staff) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      staff.name?.toLowerCase().includes(term) ||
      staff.contact_number?.toLowerCase().includes(term) ||
      staff.assigned_villas?.toLowerCase().includes(term);
    const matchesRole = !roleFilter || staff.role === roleFilter;
    const matchesShift = !shiftFilter || staff.shift === shiftFilter;
    return matchesSearch && matchesRole && matchesShift;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <User className="text-amber-500" size={24} /> Staff Management
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Directory of villa operations, cleaning, and maintenance staff
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
        >
          <Plus size={16} /> Add Staff Profile
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search staff by name or villa..."
            className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[140px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="">All Roles</SelectItem>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={shiftFilter} onValueChange={setShiftFilter}>
            <SelectTrigger className="w-[140px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="All Shifts" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="">All Shifts</SelectItem>
              {SHIFT_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            No staff profiles found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Name</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Role</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Shift</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Contact</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Assigned Villas</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Status</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelected(staff)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-600/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-sm">
                          {staff.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{staff.name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">Joined {new Date(staff.created_date || '').toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm font-medium">{staff.role}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-500" />
                        {staff.shift}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{staff.contact_number || '—'}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">
                      <span className="flex items-center gap-1">
                        <Building size={13} className="text-slate-500" />
                        {staff.assigned_villas || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center text-xs px-2 py-0.5 border rounded-full font-medium ${
                        staff.status === 'active'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        onClick={() => setSelected(staff)}
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

      {/* Drawer: Detail & Edit staff */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-semibold text-lg font-display">Staff Details</h2>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1">
              <div className="flex items-center gap-4 bg-slate-800/40 p-4 border border-slate-800 rounded-xl">
                <div className="w-14 h-14 rounded-full bg-amber-600/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xl">
                  {selected.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{selected.name}</h3>
                  <p className="text-slate-500 text-xs mt-0.5">Role: {selected.role}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Contact Number</label>
                  <Input
                    value={selected.contact_number || ''}
                    onChange={(e) => updateMutation.mutate({ id: selected.id, data: { contact_number: e.target.value } })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Shift Assignment</label>
                  <Select
                    value={selected.shift}
                    onValueChange={(val) => updateMutation.mutate({ id: selected.id, data: { shift: val } })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {SHIFT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Role Selection</label>
                  <Select
                    value={selected.role}
                    onValueChange={(val) => updateMutation.mutate({ id: selected.id, data: { role: val } })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Assigned Villas</label>
                  <Input
                    value={selected.assigned_villas || ''}
                    onChange={(e) => updateMutation.mutate({ id: selected.id, data: { assigned_villas: e.target.value } })}
                    placeholder="e.g. Villa Tirta Canggu, All Villas"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Status</label>
                  <Select
                    value={selected.status}
                    onValueChange={(val) => updateMutation.mutate({ id: selected.id, data: { status: val } })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 flex gap-3">
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Delete this staff profile?')) {
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

      {/* Modal: Add staff profile */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAdding(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-bold text-lg font-display">Add New Staff</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Full Name</label>
                <Input
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Role</label>
                  <Select
                    value={newStaff.role}
                    onValueChange={(val) => setNewStaff({ ...newStaff, role: val })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {ROLE_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Shift</label>
                  <Select
                    value={newStaff.shift}
                    onValueChange={(val) => setNewStaff({ ...newStaff, shift: val })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {SHIFT_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Contact Number</label>
                <Input
                  required
                  placeholder="+62..."
                  value={newStaff.contact_number}
                  onChange={(e) => setNewStaff({ ...newStaff, contact_number: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Assigned Villas</label>
                <Input
                  placeholder="e.g. Villa Tirta Canggu"
                  value={newStaff.assigned_villas}
                  onChange={(e) => setNewStaff({ ...newStaff, assigned_villas: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
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
