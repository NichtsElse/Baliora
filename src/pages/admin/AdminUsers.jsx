/**
 * Purpose: Lists admin users, role counts, and local demo access credentials for testing.
 * Used by: /admin/users route.
 * Main dependencies: React Query, localClient adapter, and role styling helpers.
 * Public functions: AdminUsers default export.
 * Side effects: reads local user records from browser storage or optional Supabase sync.
 */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { Shield, User, Crown, Loader2, Mail } from 'lucide-react';

const ROLE_STYLES = {
  admin: { style: 'bg-red-500/10 text-red-400 border-red-500/20', icon: Crown },
  user: { style: 'bg-slate-500/10 text-slate-400 border-slate-500/20', icon: User },
  content_manager: { style: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: Shield },
  villa_manager: { style: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Shield },
  reservation_staff: { style: 'bg-green-500/10 text-green-400 border-green-500/20', icon: User },
};

const DEMO_ACCOUNTS = [
  { role: 'admin', id: 'demo-admin', email: 'admin@baliora.local', password: 'Admin@2026' },
  { role: 'villa_manager', id: 'demo-villa-manager', email: 'villa.manager@baliora.local', password: 'Villa@2026' },
  { role: 'reservation_staff', id: 'demo-reservation-staff', email: 'reservation.staff@baliora.local', password: 'Booking@2026' },
  { role: 'content_manager', id: 'demo-content-manager', email: 'content.manager@baliora.local', password: 'Content@2026' },
  { role: 'user', id: 'demo-user', email: 'user@baliora.local', password: 'User@2026' },
];

export default function AdminUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
     queryFn: () => localClient.entities.User.list(),
  });

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users & Roles</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} team members</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { role: 'admin', label: 'Super Admin', desc: 'Full access to all modules' },
          { role: 'villa_manager', label: 'Villa Manager', desc: 'Manage villa listings' },
          { role: 'reservation_staff', label: 'Reservation Staff', desc: 'Handle booking inquiries' },
          { role: 'content_manager', label: 'Content Manager', desc: 'Blog, FAQs, testimonials' },
          { role: 'user', label: 'User', desc: 'Limited read-only access' },
        ].map(r => {
          const count = users.filter(u => u.role === r.role).length;
          const cfg = ROLE_STYLES[r.role] || ROLE_STYLES.user;
          return (
            <div key={r.role} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border rounded-full mb-3 ${cfg.style}`}>
                <cfg.icon size={11} />{r.label}
              </div>
              <p className="text-3xl font-bold text-white">{count}</p>
              <p className="text-slate-500 text-xs mt-1">{r.desc}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-white font-semibold text-sm mb-3">Demo Credentials</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-500">
              <tr className="border-b border-slate-800">
                <th className="text-left py-2 pr-4">Role</th>
                <th className="text-left py-2 pr-4">ID</th>
                <th className="text-left py-2 pr-4">Email</th>
                <th className="text-left py-2">Password</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {DEMO_ACCOUNTS.map((account) => (
                <tr key={account.id}>
                  <td className="py-2.5 pr-4 text-slate-300">{account.role}</td>
                  <td className="py-2.5 pr-4 text-slate-400 font-mono text-xs">{account.id}</td>
                  <td className="py-2.5 pr-4 text-slate-400">{account.email}</td>
                  <td className="py-2.5 text-amber-400 font-mono text-xs">{account.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-slate-600 text-xs mt-3">
          These are local demo accounts seeded on first run. Existing user passwords are not shown here.
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-white font-semibold text-sm">All Users</h2>
          <p className="text-slate-500 text-xs">Use the platform's Invite Users feature to add new members</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="animate-spin text-amber-500" /></div>
        ) : (
          <div className="divide-y divide-slate-800">
            {users.map(user => {
              const cfg = ROLE_STYLES[user.role] || ROLE_STYLES.user;
              return (
                <div key={user.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-800/30 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 font-bold text-sm">{user.full_name?.[0] || user.email?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{user.full_name || '—'}</p>
                    <div className="flex items-center gap-1 text-slate-500 text-xs">
                      <Mail size={11} />{user.email}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 border rounded-full ${cfg.style}`}>
                    <cfg.icon size={11} />{user.role || 'user'}
                  </span>
                </div>
              );
            })}
            {users.length === 0 && (
              <p className="text-center py-12 text-slate-500">No users found</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-amber-600/10 border border-amber-500/20 rounded-xl p-5">
        <h3 className="text-amber-400 font-medium mb-2">Role Reference</h3>
        <div className="space-y-2 text-sm text-slate-400">
          <p><span className="text-white font-medium">admin</span> — Full access: all modules, settings, user management</p>
          <p><span className="text-white font-medium">villa_manager</span> — Villa listings, availability, gallery</p>
          <p><span className="text-white font-medium">reservation_staff</span> — Booking inquiries, guest communications</p>
          <p><span className="text-white font-medium">content_manager</span> — Blog, FAQs, testimonials, media</p>
          <p><span className="text-white font-medium">user</span> — Limited read-only access</p>
        </div>
        <p className="text-slate-600 text-xs mt-3">To invite new team members, use the platform's built-in Invite Users feature in Workspace Settings.</p>
      </div>
    </div>
  );
}
