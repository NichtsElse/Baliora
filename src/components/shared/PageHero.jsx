import React from 'react';
import { motion } from 'framer-motion';

export default function PageHero({ eyebrow, title, description }) {
  return (
    <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          {eyebrow && (
            <span className="font-body text-xs tracking-[0.25em] uppercase text-primary">
              {eyebrow}
            </span>
          )}
          <h1 className="font-display text-5xl lg:text-7xl text-foreground leading-[1.1] mt-4">
            {title}
          </h1>
          {description && (
            <p className="font-body text-lg lg:text-xl text-muted-foreground leading-relaxed mt-6 max-w-2xl">
              {description}
            </p>
          )}
          <div className="w-16 h-px bg-primary mt-10" />
        </motion.div>
      </div>
    </section>
  );
}