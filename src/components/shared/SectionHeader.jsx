import React from 'react';
import { motion } from 'framer-motion';

export default function SectionHeader({ eyebrow, title, description, align = 'center', light = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}
    >
      {eyebrow && (
        <span className={`font-body text-xs tracking-[0.25em] uppercase ${
          light ? 'text-primary' : 'text-primary'
        }`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`font-display text-4xl lg:text-5xl leading-tight mt-3 ${
        light ? 'text-accent-foreground' : 'text-foreground'
      }`}>
        {title}
      </h2>
      {description && (
        <p className={`font-body text-lg leading-relaxed mt-5 ${
          light ? 'text-accent-foreground/60' : 'text-muted-foreground'
        }`}>
          {description}
        </p>
      )}
    </motion.div>
  );
}