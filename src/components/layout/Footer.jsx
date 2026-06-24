/**
 * Purpose: Site footer with navigation, contact details, and trust links.
 * Used by: main layout shell across public pages.
 * Main dependencies: react-router Link, lucide icons, and site content helpers.
 * Public functions: Footer default export.
 * Side effects: none.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { getWebsiteSettingValue, useSiteContentSync } from '@/lib/siteContent';

const footerLinks = {
  'Company': [
    { label: 'About', path: '/about' },
    { label: 'Services', path: '/services' },
    { label: 'Why Baliora', path: '/why-baliora' },
    { label: 'How It Works', path: '/how-it-works' },
  ],
  'Resources': [
    { label: 'Owner Dashboard', path: '/dashboard' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact', path: '/contact' },
  ],
};

export default function Footer() {
  useSiteContentSync();
  const companyName = getWebsiteSettingValue('company_name');
  const companyTagline = getWebsiteSettingValue('company_tagline');
  const contactEmail = getWebsiteSettingValue('contact_email');
  const whatsappNumber = getWebsiteSettingValue('whatsapp_number');
  const address = getWebsiteSettingValue('address');
  const websiteUrl = getWebsiteSettingValue('website_url');

  return (
    <footer className="bg-accent text-accent-foreground">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <div className="lg:col-span-1">
            <span className="font-display text-3xl tracking-wider text-accent-foreground">
              {companyName}
            </span>
            <p className="font-body text-sm text-accent-foreground/60 mt-4 leading-relaxed max-w-xs">
              {companyTagline}
            </p>
            <div className="mt-6 space-y-3">
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-3 text-sm text-accent-foreground/60 hover:text-primary transition-colors">
                <Mail size={16} />
                {contactEmail}
              </a>
              <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} className="flex items-center gap-3 text-sm text-accent-foreground/60 hover:text-primary transition-colors">
                <Phone size={16} />
                {whatsappNumber}
              </a>
              <div className="flex items-center gap-3 text-sm text-accent-foreground/60">
                <MapPin size={16} />
                {address}
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-body text-xs tracking-[0.2em] uppercase text-accent-foreground/40 mb-6">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className="font-body text-sm text-accent-foreground/60 hover:text-primary transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h4 className="font-body text-xs tracking-[0.2em] uppercase text-accent-foreground/40 mb-6">
              Get Started
            </h4>
            <p className="font-body text-sm text-accent-foreground/60 leading-relaxed mb-6">
              Ready to protect your villa investment? Let's start with a free consultation.
            </p>
            <Link
              to="/contact"
              className="inline-block rounded-full font-body text-sm tracking-wide px-6 py-2.5 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-400"
            >
              Request Consultation
            </Link>
          </div>
        </div>

        <div className="border-t border-accent-foreground/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-accent-foreground/40">
            Copyright {new Date().getFullYear()} {companyName} Villa Management. All rights reserved.
          </p>
          <p className="font-body text-xs text-accent-foreground/40">
            {websiteUrl}
          </p>
        </div>
      </div>
    </footer>
  );
}
