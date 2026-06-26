import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  Plus,
  Loader2,
  X,
  Phone,
  Mail,
  User,
  Star,
  Activity,
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

const SERVICE_OPTIONS = ['AC Maintenance', 'Pool Maintenance', 'Plumbing', 'Electrical', 'Landscaping', 'Pest Control', 'General Contractor'];
const STATUS_OPTIONS = ['active', 'inactive'];

export default function AdminVendors() {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form State
  const [newVendor, setNewVendor] = useState({
    company_name: '',
    service_type: 'AC Maintenance',
    contact_person: '',
    phone: '',
    email: '',
    rating: 5,
    status: 'active',
  });

  // Queries
  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['admin-vendors'],
    queryFn: () => localClient.entities.Vendor.list('-created_date', 100),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => localClient.entities.Vendor.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      toast({
        title: 'Vendor Profile Created',
        description: 'New service vendor added successfully.',
      });
      setIsAdding(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => localClient.entities.Vendor.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      toast({
        title: 'Vendor Details Updated',
        description: 'Details updated successfully.',
      });
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => localClient.entities.Vendor.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-vendors'] });
      toast({
        title: 'Vendor Profile Deleted',
        description: 'Vendor has been removed from directory.',
      });
      setSelected(null);
    },
  });

  const resetForm = () => {
    setNewVendor({
      company_name: '',
      service_type: 'AC Maintenance',
      contact_person: '',
      phone: '',
      email: '',
      rating: 5,
      status: 'active',
    });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...newVendor,
      rating: Number(newVendor.rating),
    });
  };

  // Filtered Vendors
  const filtered = vendors.filter((v) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      v.company_name?.toLowerCase().includes(term) ||
      v.contact_person?.toLowerCase().includes(term) ||
      v.email?.toLowerCase().includes(term);
    const matchesService = !serviceFilter || v.service_type === serviceFilter;
    return matchesSearch && matchesService;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Briefcase className="text-amber-500" size={24} /> Vendor Directory
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            External service contractors, suppliers, and technicians
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
        >
          <Plus size={16} /> Register Vendor
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
            placeholder="Search vendors by company, contact..."
            className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <div>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger className="w-[180px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="All Services" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="">All Services</SelectItem>
              {SERVICE_OPTIONS.map((opt) => (
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
            No vendors registered yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Company Name</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Service Type</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Contact Person</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Phone</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Rating</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Status</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelected(v)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-medium">{v.company_name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{v.email || 'No email'}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm font-medium">{v.service_type}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-slate-300 text-sm">
                        <User size={13} className="text-slate-500" />
                        {v.contact_person || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{v.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: v.rating || 5 }).map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center text-xs px-2 py-0.5 border rounded-full font-medium ${
                        v.status === 'active'
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        onClick={() => setSelected(v)}
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

      {/* Drawer: Detail & Edit */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-semibold text-lg font-display">Vendor Profile</h2>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 flex-1">
              <div>
                <label className="text-slate-500 text-xs block">Company</label>
                <span className="text-white text-lg font-bold block">{selected.company_name}</span>
                <span className="text-slate-400 text-xs block mt-0.5">Service: {selected.service_type}</span>
              </div>

              <div className="space-y-4 border-t border-slate-800 pt-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Contact Person</label>
                  <Input
                    value={selected.contact_person || ''}
                    onChange={(e) => updateMutation.mutate({ id: selected.id, data: { contact_person: e.target.value } })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Phone</label>
                  <Input
                    value={selected.phone || ''}
                    onChange={(e) => updateMutation.mutate({ id: selected.id, data: { phone: e.target.value } })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Email</label>
                  <Input
                    type="email"
                    value={selected.email || ''}
                    onChange={(e) => updateMutation.mutate({ id: selected.id, data: { email: e.target.value } })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Rating (1 to 5 Stars)</label>
                  <Select
                    value={String(selected.rating || 5)}
                    onValueChange={(val) => updateMutation.mutate({ id: selected.id, data: { rating: Number(val) } })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {['1', '2', '3', '4', '5'].map((star) => (
                        <SelectItem key={star} value={star}>
                          {star} Stars
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  if (confirm('Delete this vendor?')) {
                    deleteMutation.mutate(selected.id);
                  }
                }}
                className="flex-1"
              >
                Remove Vendor
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

      {/* Modal: Add vendor */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAdding(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-bold text-lg font-display">Register New Vendor</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Company Name</label>
                <Input
                  required
                  value={newVendor.company_name}
                  onChange={(e) => setNewVendor({ ...newVendor, company_name: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Service Category</label>
                <Select
                  value={newVendor.service_type}
                  onValueChange={(val) => setNewVendor({ ...newVendor, service_type: val })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {SERVICE_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Contact Person</label>
                <Input
                  placeholder="e.g. Ketut"
                  value={newVendor.contact_person}
                  onChange={(e) => setNewVendor({ ...newVendor, contact_person: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Phone Number</label>
                  <Input
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Email</label>
                  <Input
                    type="email"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
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
                  Register Vendor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
