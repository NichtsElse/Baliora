/**
 * Purpose: Shows admin overview metrics and role-aware quick actions for the local-first admin area.
 * Used by: /admin dashboard route.
 * Main dependencies: React Query, localClient adapter, router links, and AuthContext role state.
 * Public functions: AdminDashboard default export and StatCard helper.
 * Side effects: reads local content and record collections through the compatibility data layer.
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Link } from 'react-router-dom';
import {
  Building2, CalendarDays, Users, MessageSquare,
  ArrowRight, Star, CheckCircle, Clock, AlertCircle, BarChart2
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { filterAdminNavItems } from '@/lib/adminAccess';

function StatCard({ label, value, sub, icon: IconComp, color, to }) {
  const Icon = IconComp;
  const card = (
    <div className={`bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        {to && <ArrowRight size={14} className="text-slate-600" />}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-slate-400 text-sm mt-0.5">{label}</p>
      {sub && <p className="text-slate-600 text-xs mt-1">{sub}</p>}
    </div>
  );
  return to ? <Link to={to}>{card}</Link> : card;
}

const STATUS_CONFIG = {
  new: { label: 'New', icon: AlertCircle, color: 'text-amber-400' },
  contacted: { label: 'Contacted', icon: Clock, color: 'text-blue-400' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, color: 'text-green-400' },
  cancelled: { label: 'Cancelled', icon: AlertCircle, color: 'text-red-400' },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: villas = [] } = useQuery({
    queryKey: ['admin-villas'],
    queryFn: () => localClient.entities.VillaListing.list('-created_date', 100),
  });
  const { data: bookings = [] } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => localClient.entities.BookingInquiry.list('-created_date', 50),
  });
  const { data: inquiries = [] } = useQuery({
    queryKey: ['admin-inquiries'],
    queryFn: () => localClient.entities.Inquiry.list('-created_date', 50),
  });
  const { data: owners = [] } = useQuery({
    queryKey: ['admin-owners'],
    queryFn: () => localClient.entities.VillaOwner.list('-created_date', 50),
  });

  const activeVillas = villas.filter(v => v.status === 'available').length;
  const newBookings = bookings.filter(b => b.status === 'new').length;
  const newLeads = inquiries.filter(i => i.status === 'new').length;

  const villaPerf = villas
    .filter(v => v.rating)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  const recentBookings = bookings.slice(0, 6);

  const quickActions = filterAdminNavItems([
    { label: 'Add Villa', to: '/admin/villas/new', icon: Building2 },
    { label: 'View Bookings', to: '/admin/bookings', icon: CalendarDays },
    { label: 'New Blog Post', to: '/admin/blog/new', icon: BarChart2 },
    { label: 'Add Owner', to: '/admin/owners/new', icon: Users },
    { label: 'Manage FAQs', to: '/admin/faqs', icon: MessageSquare },
    { label: 'Settings', to: '/admin/settings', icon: Building2 },
  ], user?.role || 'user');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Welcome back — here's what's happening at BALIORA.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Villas" value={villas.length} icon={Building2}
          color="bg-amber-500/10 text-amber-400" to="/admin/villas"
          sub={`${activeVillas} active`} />
        <StatCard label="New Inquiries" value={newBookings} icon={CalendarDays}
          color="bg-blue-500/10 text-blue-400" to="/admin/bookings"
          sub="Booking requests" />
        <StatCard label="Owner Leads" value={newLeads} icon={MessageSquare}
          color="bg-green-500/10 text-green-400" to="/admin/inquiries"
          sub="New consultations" />
        <StatCard label="Villa Owners" value={owners.length} icon={Users}
          color="bg-purple-500/10 text-purple-400" to="/admin/owners"
          sub="Under management" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold">Recent Booking Inquiries</h2>
            <Link to="/admin/bookings" className="text-amber-500 hover:text-amber-400 text-xs flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-800">
            {recentBookings.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No bookings yet</p>
            ) : recentBookings.map(b => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.new;
              return (
                <div key={b.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-800/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{b.guest_name}</p>
                    <p className="text-slate-500 text-xs truncate">{b.villa_name}</p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-slate-400 text-xs">{b.check_in || '—'}</p>
                    <p className="text-slate-600 text-xs">{b.guests ? `${b.guests} guests` : ''}</p>
                  </div>
                  <div className={`flex items-center gap-1.5 text-xs ${cfg.color}`}>
                    <cfg.icon size={13} />
                    <span>{cfg.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Villa Performance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="text-white font-semibold">Villa Rankings</h2>
            <Star size={15} className="text-amber-500" />
          </div>
          <div className="divide-y divide-slate-800">
            {villaPerf.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No data yet</p>
            ) : villaPerf.map((v, idx) => (
              <div key={v.id} className="px-5 py-3 flex items-center gap-3">
                <span className={`text-xs font-bold w-5 ${idx === 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                  #{idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm truncate">{v.name}</p>
                  <p className="text-slate-600 text-xs">{v.location}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-400 text-sm">
                  <Star size={12} className="fill-amber-400" />
                  {v.rating}
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-slate-800">
            <Link to="/admin/villas" className="text-amber-500 hover:text-amber-400 text-xs flex items-center gap-1">
              Manage villas <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {quickActions.map(a => (
            <Link key={a.to} to={a.to}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm rounded-lg transition-colors border border-slate-700">
              <a.icon size={15} />
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
