import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';

const PAGE_LABELS = {
  '/admin/content/homepage': 'Homepage Content',
  '/admin/content/about': 'About Page',
  '/admin/content/services': 'Services Content',
  '/admin/villas/availability': 'Availability Calendar',
  '/admin/villas/amenities': 'Amenities Manager',
  '/admin/villas/gallery': 'Gallery Manager',
  '/admin/villas/pricing': 'Pricing Manager',
  '/admin/bookings/reservations': 'Reservations',
  '/admin/bookings/guests': 'Guest Database',
  '/admin/bookings/communications': 'Communications',
  '/admin/owners/contracts': 'Contracts',
  '/admin/owners/reports': 'Reports',
  '/admin/owners/revenue': 'Revenue',
  '/admin/operations/housekeeping': 'Housekeeping',
  '/admin/operations/maintenance': 'Maintenance',
  '/admin/operations/vendors': 'Vendors',
  '/admin/operations/inventory': 'Inventory',
  '/admin/operations/staff': 'Staff',
  '/admin/marketing/promotions': 'Promotions',
  '/admin/marketing/landing-pages': 'Landing Pages',
  '/admin/marketing/seo': 'SEO Manager',
  '/admin/marketing/analytics': 'Analytics',
  '/admin/settings/roles': 'Roles & Permissions',
  '/admin/settings/integrations': 'Integrations',
  '/admin/settings/audit': 'Audit Logs',
};

export default function AdminPlaceholder() {
  const { pathname } = useLocation();
  const label = PAGE_LABELS[pathname] || pathname.split('/').pop().replace(/-/g, ' ');

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
        <Construction size={28} className="text-amber-500" />
      </div>
      <h2 className="text-white text-2xl font-bold capitalize">{label}</h2>
      <p className="text-slate-500 text-sm mt-2 max-w-sm">
        This module is on the roadmap and will be available in a future update.
      </p>
      <span className="mt-4 text-xs px-3 py-1.5 bg-amber-600/10 border border-amber-500/20 text-amber-400 rounded-full">
        Coming Soon
      </span>
    </div>
  );
}