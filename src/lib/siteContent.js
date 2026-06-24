/**
 * Purpose: Resolves public-facing website content from local admin-managed records with sensible fallbacks.
 * Used by: homepage sections, about/services pages, FAQ page, and shared layout components.
 * Main dependencies: Supabase REST helpers and public fallback copy defined in this module.
 * Public functions: getWebsiteSettingValue, getWebsiteSettingsByCategory, getPublicFaqs, getFeaturedTestimonials, getServicePillars, useSiteContentSync.
 * Side effects: Optionally fetches Supabase content and keeps an in-memory cache for public content.
 */
import { useEffect, useState } from 'react';
import { isSupabaseConfigured, listSupabaseRows } from './supabaseRest.js';

const STORAGE_KEYS = {
  websiteSettings: 'baliora_admin_website_settings',
  faqs: 'baliora_admin_faqs',
  testimonials: 'baliora_admin_testimonials',
};

const subscribers = new Set();
let syncPromise = null;
let websiteSettingsCache = [];
let faqsCache = [];
let testimonialsCache = [];

const notifySubscribers = () => {
  subscribers.forEach((listener) => {
    try {
      listener();
    } catch (error) {
      console.warn(error);
    }
  });
};

const mapWebsiteSetting = (row) => ({
  key: row.key,
  value: row.value ?? '',
  label: row.label ?? row.key,
  category: row.category ?? 'General',
  type: row.type ?? 'text',
});

const mapFaq = (row) => ({
  question: row.question,
  answer: row.answer,
  category: row.category ?? 'General',
  status: row.status ?? 'active',
  sort_order: row.sort_order ?? 0,
});

const mapTestimonial = (row) => ({
  owner_name: row.owner_name,
  country: row.country ?? '',
  villa_name: row.villa_name ?? '',
  review: row.review,
  rating: row.rating ?? 5,
  photo_url: row.photo_url ?? '',
  status: row.status ?? 'active',
  is_featured: Boolean(row.is_featured),
  sort_order: row.sort_order ?? 0,
});

const syncPublicContent = async () => {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!syncPromise) {
    syncPromise = Promise.all([
      listSupabaseRows('website_settings', {}, { orderBy: 'key', limit: 200 }),
      listSupabaseRows('faqs', {}, { orderBy: 'sort_order', limit: 200 }),
      listSupabaseRows('testimonials', {}, { orderBy: 'sort_order', limit: 200 }),
    ])
      .then(([settingsRows, faqRows, testimonialRows]) => {
        const normalizedSettings = settingsRows.map(mapWebsiteSetting);
        const normalizedFaqs = faqRows.map(mapFaq);
        const normalizedTestimonials = testimonialRows.map(mapTestimonial);

        websiteSettingsCache = normalizedSettings;
        faqsCache = normalizedFaqs;
        testimonialsCache = normalizedTestimonials;
        notifySubscribers();

        return {
          settings: normalizedSettings,
          faqs: normalizedFaqs,
          testimonials: normalizedTestimonials,
        };
      })
      .catch((error) => {
        console.warn(error);
        return null;
      })
      .finally(() => {
        syncPromise = null;
      });
  }

  return syncPromise;
};

const DEFAULT_SETTINGS = {
  company_name: 'BALIORA',
  company_tagline: 'End-to-end villa management in Bali. Protecting your asset, elevating your returns.',
  contact_email: 'info@v-teki.com',
  whatsapp_number: '+62-822 2788 8025',
  address: 'Bali, Indonesia',
  website_url: 'www.balioravilla.com',
  hero_eyebrow: 'Villa Management in Bali',
  hero_title: 'End-to-End Villa Management in Bali',
  hero_subtitle: 'Protecting your asset, elevating your returns.',
  hero_image:
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600&q=80',
  trust_statement: 'Your villa is an investment. We manage it like one.',
  about_hero_title: 'Your Dedicated Villa Management Partner',
  about_hero_desc:
    'Owning a villa in Bali should be rewarding, not demanding. Baliora exists to bridge that gap with professional, end-to-end management.',
  about_image:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
  about_story_title: 'Built for Villa Owners Who Expect More',
  about_story_p1:
    'Baliora was founded on a simple observation: most villa owners in Bali are underserved. They invest in beautiful properties but lack the professional infrastructure to protect and maximize their investment.',
  about_story_p2:
    'We handle operations, finance, maintenance, staffing, compliance, guest experience, and owner reporting so you can enjoy the returns of villa ownership without the day-to-day demands.',
  about_story_p3:
    'Our team brings together hospitality expertise, financial discipline, and deep local knowledge to deliver a level of management that rivals the best hotel brands.',
  about_mission_title:
    'To set the standard for professional villa management in Bali',
  about_mission_desc:
    'We believe every villa owner deserves a management partner who treats their property with the same care and accountability as they would. Our mission is to professionalize villa operations across Bali, one property at a time.',
  services_page_title: 'Six Pillars of Complete Villa Management',
  services_page_desc:
    'Every aspect of your villa - managed, maintained, and optimized by a single accountable team.',
  services_cta_title: 'Ready for Professional Management?',
  services_cta_subtitle:
    "Tell us about your villa. We'll show you what complete management looks like.",
  testimonial_image:
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
};

const DEFAULT_SERVICE_PILLARS = [
  {
    number: '01',
    title: 'Management & Administration',
    description:
      'The backbone of your villa operations - from finance to compliance, we handle it all with precision and accountability.',
    services: [
      'Accounting & Finance',
      'Budgeting & Forecasting',
      'Accounts Payable / Receivable',
      'Bank Reconciliation',
      'Tax Reporting & Filing',
      'HR & Payroll Management',
      'BPJS Administration',
      'Monthly Owner Reports',
      'Legal & Contract Support',
      'Vendor Compliance',
    ],
  },
  {
    number: '02',
    title: 'Daily Operations',
    description:
      'Hotel-grade daily operations that keep your villa guest-ready and running smoothly at all times.',
    services: [
      'Professional Housekeeping',
      'Laundry & Linen Management',
      'Preventive Maintenance',
      'Food & Beverage Service',
      'Daily Guest-Ready Operations',
      'Quality Inspection Protocols',
    ],
  },
  {
    number: '03',
    title: 'Amenities & Equipment',
    description:
      'Every detail matters. We equip your villa with premium amenities that elevate the guest experience.',
    services: [
      'Premium Toiletries',
      'Bathrobes & Slippers',
      'Welcome Amenities Setup',
      'Coffee & Tea Station',
      'Hotel-Quality Linen',
      'Pool & Outdoor Amenities',
      'Safety Equipment',
    ],
  },
  {
    number: '04',
    title: 'Facility Maintenance & Care',
    description:
      "Proactive maintenance that preserves your villa's condition and protects your long-term asset value.",
    services: [
      'Pest Control',
      'Garden & Landscaping',
      'Pool Maintenance',
      'Deep Cleaning Programs',
      'AC Sanitization',
      'High-Pressure Washing',
      'Preventive Maintenance Calendar',
    ],
  },
  {
    number: '05',
    title: 'Furniture & Interior',
    description:
      'From procurement to styling - we ensure your villa interiors reflect modern tropical luxury.',
    services: [
      'Furniture Procurement',
      'Vendor Sourcing',
      'Renovation & Fit-out Management',
      'Interior Styling',
      'Modern Tropical Concept',
      'Balinese-Inspired Luxury',
      'Inventory & Asset Management',
    ],
  },
  {
    number: '06',
    title: 'Rental Villa',
    description:
      'Maximize your rental revenue with professional listing management, dynamic pricing, and exceptional guest services.',
    services: [
      'Listing Optimization',
      'Dynamic Pricing Strategy',
      'Booking Management',
      'Guest Communication',
      'Check-in / Check-out',
      'Concierge Assistance',
      'Review Management',
      'Revenue Reporting',
    ],
  },
];

const DEFAULT_FAQS = [
  {
    question: 'What types of villas do you manage?',
    answer:
      'We manage luxury villas across Bali - from 2-bedroom private retreats to large compound estates. Whether your villa is used privately, as a rental, or a combination of both, our management services are tailored to your specific needs.',
    category: 'General',
    status: 'active',
    sort_order: 0,
  },
  {
    question: 'Do owners still have control over their property?',
    answer:
      'Absolutely. Baliora operates as your management partner, not a replacement for ownership decisions. You retain full control over pricing strategy, renovation decisions, and operational preferences. We provide expert recommendations and transparent reporting so you can make informed decisions.',
    category: 'General',
    status: 'active',
    sort_order: 1,
  },
  {
    question: 'How often are reports sent?',
    answer:
      'We provide comprehensive monthly reports covering financial performance, occupancy analytics, maintenance activities, guest reviews, and operational updates. Ad-hoc reports are also available upon request for specific areas of interest.',
    category: 'Reporting',
    status: 'active',
    sort_order: 2,
  },
  {
    question: 'Can Baliora help with renovation and interior design?',
    answer:
      'Yes. Our Furniture & Interior pillar covers everything from vendor sourcing and procurement to renovation management and interior styling. We specialize in modern tropical and Balinese-inspired luxury concepts that enhance both guest experience and property value.',
    category: 'Operations',
    status: 'active',
    sort_order: 3,
  },
  {
    question: 'Do you manage villa staff?',
    answer:
      'Yes. We handle all aspects of staff management including recruitment, training, scheduling, payroll, BPJS administration, and performance reviews. Our team ensures your staff operates to hospitality-grade standards.',
    category: 'Operations',
    status: 'active',
    sort_order: 4,
  },
];

const DEFAULT_TESTIMONIALS = [
  {
    owner_name: 'Villa Owner',
    country: 'Indonesia',
    villa_name: 'Seminyak Villa',
    review:
      "Since partnering with Baliora, our villa occupancy increased by 40% and we finally have complete visibility into every aspect of our property. It's the peace of mind every villa owner deserves.",
    rating: 5,
    photo_url: '',
    status: 'active',
    is_featured: true,
  },
];

const sortByOrder = (items) =>
  [...items].sort((left, right) => {
    const leftOrder = Number(left.sort_order ?? 0);
    const rightOrder = Number(right.sort_order ?? 0);
    return leftOrder - rightOrder;
  });

export const getWebsiteSettingValue = (key) => {
  const matchedSetting = websiteSettingsCache.find((item) => item.key === key);
  return matchedSetting?.value ?? DEFAULT_SETTINGS[key] ?? '';
};

export const getWebsiteSettingsByCategory = (category) => {
  return websiteSettingsCache.filter((item) => item.category === category);
};

export const getPublicFaqs = () => {
  const activeFaqs = sortByOrder(faqsCache).filter((item) => item.status !== 'hidden');
  return activeFaqs.length > 0 ? activeFaqs : DEFAULT_FAQS;
};

export const getFeaturedTestimonials = () => {
  const activeTestimonials = testimonialsCache.filter((item) => item.status !== 'hidden');
  const featuredTestimonials = activeTestimonials.filter((item) => item.is_featured);
  if (featuredTestimonials.length > 0) {
    return featuredTestimonials;
  }

  if (activeTestimonials.length > 0) {
    return activeTestimonials;
  }

  return DEFAULT_TESTIMONIALS;
};

export const getServicePillars = () =>
  DEFAULT_SERVICE_PILLARS.map((pillar, index) => {
    const keyIndex = index + 1;
    const customTitle = getWebsiteSettingValue(`pillar_${keyIndex}_title`);
    const customDescription = getWebsiteSettingValue(`pillar_${keyIndex}_desc`);
    const customServices = getWebsiteSettingValue(`pillar_${keyIndex}_services`);

    return {
      number: pillar.number,
      title: customTitle || pillar.title,
      description: customDescription || pillar.description,
      services:
        customServices
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean).length > 0
          ? customServices
              .split('\n')
              .map((item) => item.trim())
              .filter(Boolean)
          : pillar.services,
    };
  });

export const useSiteContentSync = () => {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    let mounted = true;

    const refresh = () => {
      if (mounted) {
        setRevision((current) => current + 1);
      }
    };

    subscribers.add(refresh);
    syncPublicContent();

    return () => {
      mounted = false;
      subscribers.delete(refresh);
    };
  }, []);

  return revision;
};
