import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Eye,
  Send,
  Loader2,
  X,
  Mail,
  Phone,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
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

export default function AdminCommunications() {
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Send message form state
  const [form, setForm] = useState({
    guest_id: '',
    channel: 'Email',
    subject: '',
    message: '',
  });

  // Queries
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-comms'],
    queryFn: () => localClient.entities.CommunicationLog.list('-created_date', 100),
  });

  const { data: guests = [] } = useQuery({
    queryKey: ['admin-guests-list'],
    queryFn: () => localClient.entities.Guest.list('name', 100),
  });

  // Mutations
  const sendMutation = useMutation({
    mutationFn: (data) => localClient.entities.CommunicationLog.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comms'] });
      toast({
        title: 'Message Logged',
        description: 'Communication has been sent and logged successfully.',
      });
      setIsSending(false);
      setForm({ guest_id: '', channel: 'Email', subject: '', message: '' });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const guest = guests.find((g) => g.id === form.guest_id);
    sendMutation.mutate({
      recipient_name: guest ? guest.name : 'Unknown Recipient',
      recipient_email: guest ? guest.email : 'unknown@example.com',
      channel: form.channel,
      subject: form.subject || `${form.channel} message`,
      message: form.message,
      status: 'sent',
    });
  };

  // Filtered logs
  const filtered = logs.filter((log) => {
    const term = search.toLowerCase();
    const matchesSearch =
      !search ||
      log.recipient_name?.toLowerCase().includes(term) ||
      log.recipient_email?.toLowerCase().includes(term) ||
      log.subject?.toLowerCase().includes(term) ||
      log.message?.toLowerCase().includes(term);
    const matchesChannel = !channelFilter || log.channel === channelFilter;
    return matchesSearch && matchesChannel;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Communications Log</h1>
          <p className="text-slate-500 text-sm mt-1">
            History of email and WhatsApp outbox to guests
          </p>
        </div>
        <Button
          onClick={() => setIsSending(true)}
          className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
        >
          <Send size={16} /> Send New Message
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
            placeholder="Search communications..."
            className="pl-9 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={!channelFilter ? 'default' : 'outline'}
            onClick={() => setChannelFilter('')}
            className={!channelFilter ? 'bg-amber-600 hover:bg-amber-500 text-white border-transparent' : 'border-slate-700 text-slate-400 hover:text-white'}
          >
            All Channels
          </Button>
          <Button
            variant={channelFilter === 'Email' ? 'default' : 'outline'}
            onClick={() => setChannelFilter('Email')}
            className={channelFilter === 'Email' ? 'bg-amber-600 hover:bg-amber-500 text-white border-transparent' : 'border-slate-700 text-slate-400 hover:text-white'}
          >
            Email
          </Button>
          <Button
            variant={channelFilter === 'WhatsApp' ? 'default' : 'outline'}
            onClick={() => setChannelFilter('WhatsApp')}
            className={channelFilter === 'WhatsApp' ? 'bg-amber-600 hover:bg-amber-500 text-white border-transparent' : 'border-slate-700 text-slate-400 hover:text-white'}
          >
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-amber-500" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            No communication logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Recipient</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Channel</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Subject / Info</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Message Preview</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium">Sent At</th>
                  <th className="px-6 py-3.5 text-xs text-slate-500 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-800/30 transition-colors cursor-pointer"
                    onClick={() => setSelected(log)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-white text-sm font-medium">{log.recipient_name}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{log.recipient_email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium border ${
                        log.channel === 'Email'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {log.channel === 'Email' ? <Mail size={10} /> : <MessageSquare size={10} />}
                        {log.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm font-medium">{log.subject}</td>
                    <td className="px-6 py-4 text-slate-400 text-xs max-w-xs truncate">{log.message}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(log.created_date || '').toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        onClick={() => setSelected(log)}
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

      {/* Modal: View Communication Details */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSelected(null)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-bold text-lg">Sent Message Details</h2>
              <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-300">
                <div>
                  <span className="text-slate-500 text-xs block">Recipient</span>
                  <span className="text-white font-medium">{selected.recipient_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-xs block">Channel</span>
                  <span className="text-white font-medium">{selected.channel}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-xs block">Recipient Contact</span>
                <span className="text-white font-medium">{selected.recipient_email}</span>
              </div>

              <div>
                <span className="text-slate-500 text-xs block">Subject</span>
                <span className="text-amber-500 font-semibold">{selected.subject}</span>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <span className="text-slate-500 text-xs block mb-1">Message Content</span>
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-850 text-slate-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-y-auto">
                  {selected.message}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-800 flex justify-end">
              <Button
                onClick={() => setSelected(null)}
                className="bg-amber-600 hover:bg-amber-500 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Send New Message */}
      {isSending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsSending(false)} />
          <div className="relative bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-800">
              <h2 className="text-white font-bold text-lg">Send New Message</h2>
              <button onClick={() => setIsSending(false)} className="text-slate-500 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Select Guest</label>
                <Select
                  value={form.guest_id}
                  onValueChange={(val) => setForm({ ...form, guest_id: val })}
                  required
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue placeholder="Select Guest Profile" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    {guests.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name} ({g.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Communication Channel</label>
                <Select
                  value={form.channel}
                  onValueChange={(val) => setForm({ ...form, channel: val })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {form.channel === 'Email' && (
                <div>
                  <label className="text-slate-400 text-xs mb-1.5 block font-medium">Subject</label>
                  <Input
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Pre-arrival check-in info"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              )}

              <div>
                <label className="text-slate-400 text-xs mb-1.5 block font-medium">Message Body</label>
                <Textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Type your message here..."
                  className="bg-slate-800 border-slate-700 text-white min-h-[120px]"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSending(false)}
                  className="border-slate-700 text-slate-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={sendMutation.isLoading}
                  className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-2"
                >
                  {sendMutation.isLoading && <Loader2 size={16} className="animate-spin" />}
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
