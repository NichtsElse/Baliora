import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  Plus,
  Loader2,
  X,
  Wrench,
  AlertTriangle,
  User,
  DollarSign,
  Briefcase,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
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

const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'emergency'];
const PRIORITY_STYLES = {
  low: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  emergency: 'bg-rose-500/10 text-rose-400 border-rose-500/20 border-rose-500/50 animate-pulse',
};

const STATUS_OPTIONS = ['pending', 'in_progress', 'resolved'];
const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  in_progress: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/20',
};

export default function AdminMaintenance() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form State
  const [newTicket, setNewTicket] = useState({
    villa_id: '',
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    estimated_cost: 0,
    reported_by: 'Staff',
  });

  // Queries
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-maint-tickets'],
    queryFn: () => localClient.entities.MaintenanceTicket.list('-created_date', 100),
  });

  const { data: villas = [] } = useQuery({
    queryKey: ['admin-villas-list-maint'],
    queryFn: () => localClient.entities.VillaListing.list('name', 100),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => localClient.entities.MaintenanceTicket.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-maint-tickets'] });
      toast({
        title: 'Ticket Created',
        description: 'New maintenance ticket has been filed.',
      });
      setIsAdding(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => localClient.entities.MaintenanceTicket.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-maint-tickets'] });
      toast({
        title: 'Ticket Updated',
        description: 'Maintenance ticket updated successfully.',
      });
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => localClient.entities.MaintenanceTicket.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-maint-tickets'] });
      toast({
        title: 'Ticket Deleted',
        description: 'Maintenance ticket has been removed.',
      });
      setSelected(null);
    },
  });

  const resetForm = () => {
    setNewTicket({
      villa_id: '',
      title: '',
      description: '',
      priority: 'medium',
      assigned_to: '',
      estimated_cost: 0,
      reported_by: 'Staff',
    });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const villa = villas.find((v) => v.id === newTicket.villa_id);
    createMutation.mutate({
      ...newTicket,
      villa_name: villa ? villa.name : 'Unknown Villa',
      estimated_cost: Number(newTicket.estimated_cost),
      status: 'pending',
    });
  };

  // Filtered Tickets
  const filtered = tickets.filter((ticket) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      ticket.title?.toLowerCase().includes(term) ||
      ticket.villa_name?.toLowerCase().includes(term) ||
      ticket.assigned_to?.toLowerCase().includes(term);
    const matchesStatus = !statusFilter || ticket.status === statusFilter;
    const matchesPriority = !priorityFilter || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Wrench className="text-amber-500" size={24} /> Maintenance Tickets
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            File, assign, and track repairs and work orders for all villas
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
          className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
        >
          <Plus size={16} /> File Repair Ticket
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
            placeholder="Search by issue or villa..."
            className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Status Select */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Select */}
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[140px] bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="All Priorities" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
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
            No maintenance tickets found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Issue / Villa</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Priority</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Technician</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Est. Cost</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Reported By</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Status</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((ticket) => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelected(ticket)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-medium">{ticket.title}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{ticket.villa_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border rounded-full font-medium capitalize ${PRIORITY_STYLES[ticket.priority] || ''}`}>
                        {ticket.priority === 'emergency' && <AlertTriangle size={11} />}
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-slate-300 text-sm">
                        <Briefcase size={14} className="text-slate-500" />
                        {ticket.assigned_to || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-white text-sm font-semibold">
                      ${ticket.estimated_cost?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{ticket.reported_by}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 border rounded-full font-medium capitalize ${STATUS_STYLES[ticket.status] || ''}`}>
                        {ticket.status === 'resolved' ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                        {ticket.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        onClick={() => setSelected(ticket)}
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

      {/* Drawer: View & Edit Ticket */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-semibold text-lg">Ticket Details</h2>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div>
                <label className="text-slate-500 text-xs block">Villa / Location</label>
                <span className="text-white text-lg font-bold block">{selected.villa_name}</span>
                <span className="text-slate-400 text-xs block mt-0.5">Reported By: {selected.reported_by}</span>
              </div>

              <div>
                <label className="text-slate-500 text-xs block">Issue Title</label>
                <span className="text-white text-sm font-semibold block">{selected.title}</span>
              </div>

              <div>
                <label className="text-slate-500 text-xs block mb-1">Description / Details</label>
                <p className="bg-slate-950 p-4 border border-slate-850 rounded-lg text-slate-300 text-sm whitespace-pre-wrap">
                  {selected.description || 'No description provided.'}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-4 space-y-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Update Status</label>
                  <Select
                    value={selected.status}
                    onValueChange={(val) => updateMutation.mutate({ id: selected.id, data: { status: val } })}
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
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Ticket Priority</label>
                  <Select
                    value={selected.priority}
                    onValueChange={(val) => updateMutation.mutate({ id: selected.id, data: { priority: val } })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {PRIORITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="capitalize">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Assign Technician / Vendor</label>
                  <Input
                    value={selected.assigned_to || ''}
                    onChange={(e) => updateMutation.mutate({ id: selected.id, data: { assigned_to: e.target.value } })}
                    placeholder="Technician/Contractor Name"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Estimated Cost ($)</label>
                  <Input
                    type="number"
                    value={selected.estimated_cost || 0}
                    onChange={(e) => updateMutation.mutate({ id: selected.id, data: { estimated_cost: Number(e.target.value) } })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 flex gap-3">
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Delete this ticket?')) {
                    deleteMutation.mutate(selected.id);
                  }
                }}
                className="flex-1"
              >
                Delete Ticket
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

      {/* Modal: Add Ticket */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAdding(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-bold text-lg font-display">File Repair Ticket</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Select Villa</label>
                <Select
                  value={newTicket.villa_id}
                  onValueChange={(val) => setNewTicket({ ...newTicket, villa_id: val })}
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

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Issue Title</label>
                <Input
                  required
                  placeholder="e.g. AC leaking, Wifi router broken"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1 block">Description</label>
                <Textarea
                  value={newTicket.description}
                  placeholder="Describe the issue in detail..."
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white min-h-[70px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Priority</label>
                  <Select
                    value={newTicket.priority}
                    onValueChange={(val) => setNewTicket({ ...newTicket, priority: val })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {PRIORITY_OPTIONS.map((opt) => (
                        <SelectItem key={opt} value={opt} className="capitalize">
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Reported By</label>
                  <Input
                    required
                    value={newTicket.reported_by}
                    onChange={(e) => setNewTicket({ ...newTicket, reported_by: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Assign Technician</label>
                  <Input
                    value={newTicket.assigned_to}
                    onChange={(e) => setNewTicket({ ...newTicket, assigned_to: e.target.value })}
                    placeholder="e.g. Made"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1 block">Estimated Cost ($)</label>
                  <Input
                    type="number"
                    value={newTicket.estimated_cost}
                    onChange={(e) => setNewTicket({ ...newTicket, estimated_cost: e.target.value })}
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
                  File Ticket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
