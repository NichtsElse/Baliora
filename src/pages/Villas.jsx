/**
 * Purpose: Displays the locally managed villa catalog with client-side filtering.
 * Used by: /villas route.
 * Main dependencies: localClient villa queries and VillaFilter/VillaCard UI.
 * Public functions: Villas default export.
 * Side effects: reads seeded villa data from localStorage-backed services.
 */
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { localClient } from '@/api/localClient';
import { useQuery } from '@tanstack/react-query';
import VillaCard from '../components/villas/VillaCard';
import VillaFilter from '../components/villas/VillaFilter';
import CTASection from '../components/shared/CTASection';
import { Loader2, Building2 } from 'lucide-react';

export default function Villas() {
  const [filters, setFilters] = useState({
    location: '',
    bedrooms: '',
    maxPrice: 2000,
    amenities: [],
  });

  const { data: villas = [], isLoading } = useQuery({
    queryKey: ['villas'],
    queryFn: () => localClient.entities.VillaListing.filter({ status: 'available' }, '-created_date', 50),
  });

  const filtered = useMemo(() => {
    return villas.filter(v => {
      if (filters.location && v.location !== filters.location) return false;
      if (filters.bedrooms && filters.bedrooms !== 'Any') {
        const n = parseInt(filters.bedrooms);
        if (filters.bedrooms === '5+') {
          if (v.bedrooms < 5) return false;
        } else {
          if (v.bedrooms !== n) return false;
        }
      }
      if (filters.maxPrice < 2000 && v.price_per_night > filters.maxPrice) return false;
      if (filters.amenities?.length) {
        const hasAll = filters.amenities.every(a => (v.amenities || []).includes(a));
        if (!hasAll) return false;
      }
      return true;
    });
  }, [villas, filters]);

  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-16 lg:pt-44 lg:pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=1600&q=80"
            alt="Luxury Bali villa collection"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background/60" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="font-body text-xs tracking-[0.3em] uppercase text-primary">
              BALIORA Villa Collection
            </span>
            <h1 className="font-display text-5xl lg:text-7xl text-foreground leading-[1.05] mt-4 max-w-3xl">
              Explore BALIORA Villas in Bali
            </h1>
            <p className="font-body text-lg lg:text-xl text-muted-foreground leading-relaxed mt-5 max-w-2xl">
              Discover curated private villas in Bali, professionally managed for comfort, privacy, and memorable stays.
            </p>
            <div className="w-16 h-px bg-primary mt-8" />
          </motion.div>
        </div>
      </section>

      {/* Filter Bar */}
      <VillaFilter filters={filters} onChange={setFilters} totalCount={filtered.length} />

      {/* Villa Grid */}
      <section className="py-12 lg:py-16 bg-background min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {isLoading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 size={32} className="text-primary animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-32"
            >
              <Building2 size={48} className="text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-2xl text-foreground">No villas match your filters</h3>
              <p className="font-body text-sm text-muted-foreground mt-2">Try adjusting your search criteria</p>
              <button
                onClick={() => setFilters({ location: '', bedrooms: '', maxPrice: 2000, amenities: [] })}
                className="mt-6 font-body text-sm px-6 py-2.5 border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filtered.map((villa, idx) => (
                <VillaCard key={villa.id} villa={villa} index={idx} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Management CTA */}
      <CTASection
        title="Own a Villa in Bali?"
        subtitle="Join the BALIORA portfolio. We manage, you earn — with full transparency and care."
        primaryCTA="Schedule Owner Consultation"
        primaryLink="/contact"
        secondaryCTA="Learn About Management"
        secondaryLink="/services"
      />
    </>
  );
}
