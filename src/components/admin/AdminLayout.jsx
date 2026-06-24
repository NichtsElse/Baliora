/**
 * Purpose: Provides the admin shell, nested navigation, and session-aware top-level admin chrome.
 * Used by: all /admin routes in App routing.
 * Main dependencies: router outlet, AuthContext, Lucide icons, and local auth-compatible Base44 adapter.
 * Public functions: AdminLayout default export.
 * Side effects: can close the local session, navigate the user out of the admin area, and open the public site.
 */
import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, CalendarDays,
  FileText, Settings, ChevronDown, ChevronRight,
  Menu, LogOut, Bell, User, Home, Briefcase,
  Globe, Wrench, Megaphone
} from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { filterAdminNavItems, canAccessAdminPath } from '@/lib/adminAccess';

const NAV = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/admin',
    exact: true,
  },
  {
    label: 'Content Management',
    icon: FileText,
    children: [
      { label: 'Navbar', path: '/admin/content/navbar' },
      { label: 'Homepage', path: '/admin/content/homepage' },
      { label: 'About', path: '/admin/content/about' },
      { label: 'Services', path: '/admin/content/services' },
      { label: 'Blog', path: '/admin/blog' },
      { label: 'FAQ', path: '/admin/faqs' },
      { label: 'Testimonials', path: '/admin/testimonials' },
    ],
  },
  {
    label: 'Villa Management',
    icon: Building2,
    children: [
      { label: 'Villas', path: '/admin/villas' },
      { label: 'Availability Calendar', path: '/admin/villas/availability' },
      { label: 'Amenities', path: '/admin/villas/amenities' },
      { label: 'Gallery', path: '/admin/villas/gallery' },
      { label: 'Pricing', path: '/admin/villas/pricing' },
    ],
  },
  {
    label: 'Booking Management',
    icon: CalendarDays,
    children: [
      { label: 'Inquiries', path: '/admin/bookings' },
      { label: 'Reservations', path: '/admin/bookings/reservations' },
      { label: 'Guest Database', path: '/admin/bookings/guests' },
      { label: 'Communications', path: '/admin/bookings/communications' },
    ],
  },
  {
    label: 'Owner Management',
    icon: Briefcase,
    children: [
      { label: 'Inquiries', path: '/admin/inquiries' },
      { label: 'Owners', path: '/admin/owners' },
      { label: 'Contracts', path: '/admin/owners/contracts' },
      { label: 'Reports', path: '/admin/owners/reports' },
      { label: 'Revenue', path: '/admin/owners/revenue' },
    ],
  },
  {
    label: 'Operations',
    icon: Wrench,
    children: [
      { label: 'Housekeeping', path: '/admin/operations/housekeeping' },
      { label: 'Maintenance', path: '/admin/operations/maintenance' },
      { label: 'Vendors', path: '/admin/operations/vendors' },
      { label: 'Inventory', path: '/admin/operations/inventory' },
      { label: 'Staff', path: '/admin/operations/staff' },
    ],
  },
  {
    label: 'Marketing',
    icon: Megaphone,
    children: [
      { label: 'Promotions', path: '/admin/marketing/promotions' },
      { label: 'Landing Pages', path: '/admin/marketing/landing-pages' },
      { label: 'SEO', path: '/admin/marketing/seo' },
      { label: 'Analytics', path: '/admin/marketing/analytics' },
    ],
  },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'Users', path: '/admin/users' },
      { label: 'Roles', path: '/admin/settings/roles' },
      { label: 'Integrations', path: '/admin/settings/integrations' },
      { label: 'Audit Logs', path: '/admin/activity' },
    ],
  },
];

function NavItem({ item, collapsed }) {
  const location = useLocation();
  const [open, setOpen] = useState(() =>
    item.children?.some(c => location.pathname.startsWith(c.path))
  );

  const isActive = item.path
    ? item.exact
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path)
    : item.children?.some(c => location.pathname === c.path);

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
        >
          <item.icon size={18} className="flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">{item.label}</span>
              <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </>
          )}
        </button>
        {!collapsed && open && (
          <div className="ml-7 mt-1 space-y-0.5">
            {item.children.map(child => (
              <Link
                key={child.path}
                to={child.path}
                className={`block px-3 py-2 text-sm rounded-md transition-colors ${location.pathname === child.path
                    ? 'text-white bg-white/10'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}
              >
                {child.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
        }`}
    >
      <item.icon size={18} className="flex-shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const allowedNav = filterAdminNavItems(NAV, user?.role || 'user');

  const handleLogout = () => logout();

  const Sidebar = ({ mobile = false }) => (
    <div className={`flex flex-col h-full bg-slate-900 ${mobile ? 'w-72' : collapsed ? 'w-16' : 'w-64'} transition-all duration-300`}>
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 border-b border-slate-800 ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <Link to="/home" className={`flex items-center gap-3 ${collapsed && !mobile ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-amber-600/20 border border-amber-600/30 flex items-center justify-center flex-shrink-0">
            <Home size={16} className="text-amber-500" />
          </div>
          {(!collapsed || mobile) && (
            <div>
              <span className="font-display text-white text-lg tracking-wider">BALIORA</span>
              <span className="block text-slate-500 text-xs -mt-0.5">Admin Portal</span>
            </div>
          )}
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {allowedNav.map(item => (
          <NavItem key={item.label} item={item} collapsed={collapsed && !mobile} />
        ))}
      </nav>

      {/* User footer */}
      <div className={`border-t border-slate-800 p-3 ${collapsed && !mobile ? 'flex justify-center' : 'flex items-center gap-3'}`}>
        <div className="w-8 h-8 rounded-full bg-amber-600/30 flex items-center justify-center flex-shrink-0">
          <User size={14} className="text-amber-400" />
        </div>
        {(!collapsed || mobile) && (
            <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.full_name || user?.name || 'Admin'}</p>
            <p className="text-slate-500 text-xs truncate">{user?.email}</p>
          </div>
        )}
        {(!collapsed || mobile) && (
          <button onClick={handleLogout} className="text-slate-500 hover:text-white p-1">
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col relative">
        <Sidebar />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white border border-slate-600 z-10"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} className="-rotate-90" />}
        </button>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <Sidebar mobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-4 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 flex-1 min-w-0">
            <span className="text-amber-500 font-medium hidden sm:block">Admin</span>
            <span className="hidden sm:block">/</span>
            <span className="text-slate-300 truncate capitalize">
              {location.pathname.replace('/admin/', '').replace('/admin', 'dashboard').split('/')[0]}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/home" className="text-slate-500 hover:text-slate-300 p-2 text-xs flex items-center gap-1.5">
              <Globe size={15} />
              <span className="hidden sm:inline">View Site</span>
            </Link>
            <button className="relative text-slate-500 hover:text-slate-300 p-2">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          {canAccessAdminPath(user?.role || 'user', location.pathname) ? (
            <Outlet />
          ) : (
            <div className="min-h-[60vh] flex items-center justify-center px-6">
              <div className="max-w-lg text-center">
                <h1 className="text-2xl font-bold text-white">Access Restricted</h1>
                <p className="text-slate-400 mt-3">
                  Your current role does not have permission to open this admin module.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
