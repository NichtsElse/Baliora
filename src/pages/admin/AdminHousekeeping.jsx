import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  Plus,
  Loader2,
  X,
  Brush,
  User,
  Calendar,
  CheckCircle,
  Clock,
  Sparkles,
  Clipboard,
  RefreshCw,
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

const STATUS_OPTIONS = ['pending', 'cleaning', 'clean', 'inspected'];
const STATUS_STYLES = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  cleaning: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  clean: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  inspected: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function AdminHousekeeping() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form State
  const [newTask, setNewTask] = useState({
    villa_id: '',
    room_number: 'All Rooms',
    task_type: 'Standard Clean',
    assigned_to: '',
    scheduled_date: '',
    remarks: '',
  });

  // Queries
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['admin-hk-tasks'],
    queryFn: () => localClient.entities.HousekeepingTask.list('-created_date', 100),
  });

  const { data: villas = [] } = useQuery({
    queryKey: ['admin-villas-list-hk'],
    queryFn: () => localClient.entities.VillaListing.list('name', 100),
  });

  const { data: reservations = [] } = useQuery({
    queryKey: ['admin-reservations-list-hk'],
    queryFn: () => localClient.entities.Reservation.list('-created_date', 100),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data) => localClient.entities.HousekeepingTask.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hk-tasks'] });
      toast({
        title: 'Task Created',
        description: 'Housekeeping task has been scheduled.',
      });
      setIsAdding(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => localClient.entities.HousekeepingTask.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hk-tasks'] });
      toast({
        title: 'Task Updated',
        description: 'Task status/assignment updated successfully.',
      });
      setSelected(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => localClient.entities.HousekeepingTask.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-hk-tasks'] });
      toast({
        title: 'Task Deleted',
        description: 'Task removed from schedule.',
      });
      setSelected(null);
    },
  });

  const resetForm = () => {
    setNewTask({
      villa_id: '',
      room_number: 'All Rooms',
      task_type: 'Standard Clean',
      assigned_to: '',
      scheduled_date: '',
      remarks: '',
    });
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const villa = villas.find((v) => v.id === newTask.villa_id);
    createMutation.mutate({
      ...newTask,
      villa_name: villa ? villa.name : 'Unknown Villa',
      status: 'pending',
    });
  };

  const handleAutoGenerate = async () => {
    // Generate cleaning task for every Checked Out reservation where no cleaning is scheduled yet
    const checkedOutReservations = reservations.filter(r => r.status === 'checked_out');
    let count = 0;

    for (const res of checkedOutReservations) {
      const hasTask = tasks.some(t => t.villa_id === res.villa_id && t.scheduled_date === res.check_out);
      if (!hasTask) {
        await createMutation.mutateAsync({
          villa_id: res.villa_id,
          villa_name: res.villa_name,
          room_number: 'All Rooms',
          task_type: 'Deep Clean',
          assigned_to: 'Unassigned',
          scheduled_date: res.check_out,
          status: 'pending',
          remarks: `Automated post-checkout cleaning for guest ${res.guest_name}.`,
        });
        count++;
      }
    }

    toast({
      title: 'Auto Generation Complete',
      description: `Scheduled ${count} new post-checkout cleaning tasks.`,
    });
  };

  // Filtered Tasks
  const filtered = tasks.filter((task) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      task.villa_name?.toLowerCase().includes(term) ||
      task.assigned_to?.toLowerCase().includes(term) ||
      task.task_type?.toLowerCase().includes(term);
    const matchesStatus = !statusFilter || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Housekeeping Schedule</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage cleaning tasks, schedules, and staff assignments
          </p>
        </div>
        <div className="flex gap-2.5">
          <Button
            onClick={handleAutoGenerate}
            variant="outline"
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2"
          >
            <RefreshCw size={16} /> Auto-Generate (Post-Checkout)
          </Button>
          <Button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
          >
            <Plus size={16} /> Schedule Cleaning
          </Button>
        </div>
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
            placeholder="Search by villa or staff..."
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
              {status}
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
            No housekeeping tasks scheduled.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Villa / Area</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Cleaning Type</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Staff Assigned</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Scheduled Date</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Status</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((task) => (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelected(task)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-medium">{task.villa_name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{task.room_number}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm font-medium">{task.task_type}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-slate-300 text-sm">
                        <User size={14} className="text-slate-500" />
                        {task.assigned_to || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-sm">{task.scheduled_date}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 border rounded-full font-medium capitalize ${STATUS_STYLES[task.status] || ''}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        onClick={() => setSelected(task)}
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

      {/* Drawer: Detail & Edit task */}
      {selected && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/60" onClick={() => setSelected(null)} />
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-semibold text-lg">Task Details</h2>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5 flex-1">
              <div className="space-y-3">
                <div>
                  <label className="text-slate-500 text-xs block">Villa / Location</label>
                  <span className="text-white text-lg font-bold">{selected.villa_name}</span>
                  <span className="text-slate-400 text-xs block mt-0.5">Area/Room: {selected.room_number}</span>
                </div>
                <div>
                  <label className="text-slate-500 text-xs block">Task Type</label>
                  <span className="text-white text-sm font-semibold">{selected.task_type}</span>
                </div>
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
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Assign Staff</label>
                  <Input
                    value={selected.assigned_to || ''}
                    onChange={(e) => updateMutation.mutate({ id: selected.id, data: { assigned_to: e.target.value } })}
                    placeholder="Staff name (e.g. Wayan, Kadek)"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Scheduled Date</label>
                  <Input
                    type="date"
                    value={selected.scheduled_date}
                    onChange={(e) => updateMutation.mutate({ id: selected.id, data: { scheduled_date: e.target.value } })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Remarks / Instructions</label>
                  <Textarea
                    value={selected.remarks || ''}
                    onChange={(e) => updateMutation.mutate({ id: selected.id, data: { remarks: e.target.value } })}
                    placeholder="E.g., Extra attention to pool deck."
                    className="bg-slate-800 border-slate-700 text-white min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 flex gap-3">
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirm('Delete this task?')) {
                    deleteMutation.mutate(selected.id);
                  }
                }}
                className="flex-1"
              >
                Delete Task
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

      {/* Modal: Schedule task */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsAdding(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-bold text-lg">Schedule Cleaning Task</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Select Villa</label>
                <Select
                  value={newTask.villa_id}
                  onValueChange={(val) => setNewTask({ ...newTask, villa_id: val })}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Room / Area</label>
                  <Input
                    required
                    value={newTask.room_number}
                    onChange={(e) => setNewTask({ ...newTask, room_number: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Task Type</label>
                  <Select
                    value={newTask.task_type}
                    onValueChange={(val) => setNewTask({ ...newTask, task_type: val })}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="Standard Clean">Standard Clean</SelectItem>
                      <SelectItem value="Deep Clean">Deep Clean</SelectItem>
                      <SelectItem value="Touch-up Clean">Touch-up Clean</SelectItem>
                      <SelectItem value="Inspected Check">Inspected Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Assign Staff</label>
                <Input
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  placeholder="Staff name (e.g. Wayan, Kadek)"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Scheduled Date</label>
                <Input
                  type="date"
                  required
                  value={newTask.scheduled_date}
                  onChange={(e) => setNewTask({ ...newTask, scheduled_date: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Remarks / Special Instructions</label>
                <Textarea
                  value={newTask.remarks}
                  onChange={(e) => setNewTask({ ...newTask, remarks: e.target.value })}
                  placeholder="Clean the windows, refill towels..."
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
                  Schedule Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
