import React from 'react';
import { motion } from 'framer-motion';
import VillaCard from './VillaCard';

export default function SimilarVillas({ villas, currentSlug }) {
  const similar = villas
    .filter(v => v.slug !== currentSlug && v.status === 'available')
    .slice(0, 3);

  if (!similar.length) return null;

  return (
    <section className="py-16 lg:py-24 bg-secondary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <span className="font-body text-xs tracking-[0.25em] uppercase text-primary">More Villas</span>
          <h2 className="font-display text-3xl lg:text-4xl text-foreground mt-2">You May Also Like</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {similar.map((villa, idx) => (
            <VillaCard key={villa.id} villa={villa} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}