/**
 * Purpose: Shows a curated subset of locally seeded villas on the homepage.
 * Used by: Home page.
 * Main dependencies: react-query and localClient villa listing queries.
 * Public functions: FeaturedVillas default export.
 * Side effects: reads local villa data through localStorage-backed services.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { localClient } from '@/api/localClient';
import VillaCard from '../villas/VillaCard';

export default function FeaturedVillas() {
  const { data: villas = [], isLoading } = useQuery({
    queryKey: ['villas'],
    queryFn: () => localClient.entities.VillaListing.filter({ status: 'available' }, '-created_date', 6),
  });

  return (
    <section className="py-24 lg:py-32 bg-secondary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-12"
        >
          <div>
            <span className="font-body text-xs tracking-[0.25em] uppercase text-primary">
              Rental Villas
            </span>
            <h2 className="font-display text-4xl lg:text-5xl text-foreground leading-tight mt-3">
              Featured Villas<br />
              <span className="italic text-primary">in Bali</span>
            </h2>
            <p className="font-body text-base text-muted-foreground mt-4 max-w-lg">
              Handpicked, professionally managed villas for unforgettable Bali stays.
            </p>
          </div>
          <Link
            to="/villas"
            className="inline-flex items-center gap-2 rounded-full border border-primary/25 px-5 py-2.5 font-body text-sm text-primary hover:border-primary hover:text-primary/80 transition-all duration-300 flex-shrink-0"
          >
            Explore All Villas <ArrowRight size={16} />
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={28} className="text-primary animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {villas.slice(0, 3).map((villa, idx) => (
              <VillaCard key={villa.id} villa={villa} index={idx} />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link
            to="/villas"
            className="inline-flex items-center gap-2 rounded-full font-body text-sm tracking-wide px-8 py-3.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-400 shadow-[0_14px_30px_-20px_rgba(0,0,0,0.28)] hover:shadow-[0_18px_36px_-20px_rgba(0,0,0,0.34)]"
          >
            Explore All Villas
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
