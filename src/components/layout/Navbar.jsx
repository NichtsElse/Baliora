/**
 * Purpose: Renders the public site navigation with admin-managed content and local auth-aware actions.
 * Used by: App shell across all public pages.
 * Main dependencies: router links, React Query website settings, and AuthContext session state.
 * Public functions: Navbar default export.
 * Side effects: Adds and removes a window scroll listener and can clear the local auth session on logout.
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, UserCircle2, Shield, LogOut, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import { useAuth } from '@/lib/AuthContext';

const DEFAULT_NAV_LINKS = [
  { label: 'Villa Management', path: '/services' },
  { label: 'Rental Villas', path: '/villas' },
  { label: 'How It Works', path: '/how-it-works' },
  { label: 'Journal', path: '/blog' },
  { label: 'About', path: '/about' },
];
const DEFAULT_CTA = [
  { label: 'Owner Consultation', path: '/contact', style: 'primary' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  const { data: settings = [] } = useQuery({
    queryKey: ['content-navbar'],
    queryFn: () => localClient.entities.WebsiteSetting.filter({ category: 'navbar' }, 'key', 20),
    staleTime: 1000 * 60 * 5,
  });

  const map = settings.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {});
  const brandName = map.brand_name || 'BALIORA';
  const navLinks = map.nav_links ? (() => { try { return JSON.parse(map.nav_links); } catch { return DEFAULT_NAV_LINKS; } })() : DEFAULT_NAV_LINKS;
  const ctaButtons = map.cta_buttons ? (() => { try { return JSON.parse(map.cta_buttons); } catch { return DEFAULT_CTA; } })() : DEFAULT_CTA;
  const canOpenAdmin = isAuthenticated && user?.role !== 'user';
  const secondaryActions = isAuthenticated
    ? [{ label: 'Logout', type: 'button' }]
    : [{ label: 'Login', path: '/login', type: 'link' }];

  const renderActionClass = (variant) =>
    variant === 'primary'
      ? 'rounded-full font-body text-sm tracking-wide px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-400'
      : 'rounded-full font-body text-sm tracking-wide px-5 py-2.5 border border-foreground/15 text-foreground hover:border-primary hover:text-primary transition-all duration-400';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    setAccountOpen(false);
  }, [location, isAuthenticated]);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 h-20">
            <Link to="/home" className="flex items-center gap-2">
              <span className="font-display text-2xl lg:text-3xl tracking-wider text-foreground">
                {brandName}
              </span>
            </Link>

            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-body text-sm tracking-wide transition-colors duration-300 hover:text-primary ${location.pathname === link.path ? 'text-primary' : 'text-foreground/70'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3 ml-auto">
              {ctaButtons.map((btn, idx) => (
                <Link
                  key={idx}
                  to={btn.path}
                  className={renderActionClass(btn.style)}
                >
                  {btn.label}
                </Link>
              ))}
              {isAuthenticated && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((current) => !current)}
                    className="group flex items-center gap-3 rounded-full border border-foreground/10 bg-background/80 px-3 py-2 text-left shadow-sm backdrop-blur-md transition-all hover:border-primary/30 hover:shadow-md"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-primary ring-1 ring-primary/10">
                      <UserCircle2 size={17} />
                    </span>
                    <span className="max-w-28 truncate text-sm font-medium text-foreground/85">
                      {user?.full_name || user?.email || 'Account'}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`text-foreground/40 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {accountOpen && (
                    <div className="absolute right-0 top-full mt-3 w-64 rounded-[24px] border border-border bg-background/95 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-xl">
                      <div className="flex items-center gap-3 rounded-2xl bg-secondary/40 px-3 py-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserCircle2 size={18} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {user?.full_name || 'Guest'}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {user?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                      <Link
                        to="/profile"
                        className="mt-2 flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-secondary"
                      >
                        <Settings2 size={14} />
                        Profile
                      </Link>
                      {canOpenAdmin && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-2 rounded-2xl px-3 py-2.5 text-sm text-foreground/80 transition-colors hover:bg-secondary"
                        >
                          <Shield size={14} />
                          Admin
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => logout(false)}
                        className="mt-1 flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background pt-20"
          >
            <div className="flex flex-col items-center gap-6 pt-12 px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-display text-2xl tracking-wide transition-colors duration-300 ${location.pathname === link.path ? 'text-primary' : 'text-foreground/60'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="w-12 h-px bg-primary/30 my-4" />
              {isAuthenticated && (
                <>
                  <Link
                    to="/profile"
                    className="rounded-full font-body text-sm tracking-wide px-8 py-3 border border-primary text-primary"
                  >
                    Profile
                  </Link>
                  {canOpenAdmin && (
                    <Link
                      to="/admin"
                      className="rounded-full font-body text-sm tracking-wide px-8 py-3 border border-dashed border-foreground/15 text-foreground/50"
                    >
                      Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => logout(false)}
                    className="rounded-full font-body text-sm tracking-wide px-8 py-3 border border-primary text-primary"
                  >
                    Logout
                  </button>
                </>
              )}
              {ctaButtons.map((btn, idx) => (
                <Link
                  key={idx}
                  to={btn.path}
                  className={btn.style === 'primary'
                    ? 'rounded-full font-body text-sm tracking-wide px-8 py-3 bg-primary text-primary-foreground'
                    : 'rounded-full font-body text-sm tracking-wide px-8 py-3 border border-primary text-primary'
                  }
                >
                  {btn.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
