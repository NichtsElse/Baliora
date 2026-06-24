/**
 * Purpose: Applies page-specific document metadata for the marketing SPA.
 * Used by: App layout so each route gets a title and SEO description.
 * Main dependencies: react-router location and DOM head metadata.
 * Public functions: RouteSeo default export.
 * Side effects: Updates document title and meta description/keywords tags.
 */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_SEO = {
  title: 'BALIORA Villa Management | End-to-End Villa Management in Bali',
  description:
    'Professional villa management in Bali for owners who want hands-off operations, transparent reporting, guest satisfaction, and optimized rental performance.',
  keywords:
    'villa management Bali, Bali villa management, luxury villa management Bali, rental villa management Bali, villa operations Bali, villa owner services Bali',
};

const PAGE_SEO = {
  '/': {
    title: 'BALIORA Villa Management | End-to-End Villa Management in Bali',
    description:
      'Premium villa management in Bali for owners who want complete accountability, transparent reporting, and hospitality-standard operations.',
  },
  '/about': {
    title: 'About BALIORA | Dedicated Villa Management Partner in Bali',
    description:
      'Learn how BALIORA supports villa owners in Bali with owner-first management, hospitality standards, local expertise, and transparent reporting.',
  },
  '/services': {
    title: 'Villa Management Services | BALIORA Bali',
    description:
      'Explore BALIORA six pillars of villa management in Bali, from finance and operations to maintenance, interiors, and rental performance.',
  },
  '/why-baliora': {
    title: 'Why BALIORA | One Property. One Team. Complete Accountability.',
    description:
      'Discover why Bali villa owners choose BALIORA for end-to-end coverage, compliance, hotel-grade SOPs, and hands-off ownership.',
  },
  '/how-it-works': {
    title: 'How It Works | BALIORA Villa Management',
    description:
      'See BALIORA four-step process for taking a villa in Bali from assessment to onboarding, daily operations, and ongoing optimization.',
  },
  '/dashboard': {
    title: 'Owner Dashboard Preview | BALIORA Villa Management',
    description:
      'Preview BALIORA owner dashboard experience with financial reporting, occupancy tracking, maintenance logs, and asset visibility.',
  },
  '/faq': {
    title: 'FAQ | BALIORA Villa Management',
    description:
      'Answers to the most common questions about BALIORA villa management services, reporting, compliance, staffing, and rental performance.',
  },
  '/contact': {
    title: 'Request Consultation | BALIORA Villa Management',
    description:
      'Contact BALIORA to discuss your villa in Bali and request a tailored consultation with our management team.',
  },
  '/assessment': {
    title: 'Request Villa Assessment | BALIORA Villa Management',
    description:
      'Submit your villa details for a complimentary BALIORA assessment covering operations, positioning, revenue potential, and management opportunities.',
  },
  '/villas': {
    title: 'Rental Villas | BALIORA Bali Villa Collection',
    description:
      'Browse the BALIORA villa collection across Bali, including Canggu, Ubud, Uluwatu, Sanur, Seminyak, and Nusa Dua.',
  },
};

const upsertMetaTag = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
};

export default function RouteSeo() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname.startsWith('/villas/')
      ? '/villas'
      : location.pathname;
    const seo = PAGE_SEO[pathname] || DEFAULT_SEO;

    document.title = seo.title;
    upsertMetaTag('description', seo.description || DEFAULT_SEO.description);
    upsertMetaTag('keywords', seo.keywords || DEFAULT_SEO.keywords);
  }, [location.pathname]);

  return null;
}
