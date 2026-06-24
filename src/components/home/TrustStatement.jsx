/**
 * Purpose: Displays the homepage trust statement using admin-managed copy with a local fallback.
 * Used by: Home page.
 * Main dependencies: framer-motion and site content helpers.
 * Public functions: TrustStatement default export.
 * Side effects: none.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { getWebsiteSettingValue, useSiteContentSync } from '@/lib/siteContent';

export default function TrustStatement() {
  useSiteContentSync();
  const trustStatement = getWebsiteSettingValue('trust_statement');

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="w-12 h-px bg-primary mx-auto mb-10" />
          <blockquote className="font-display text-3xl lg:text-4xl xl:text-5xl text-foreground leading-tight italic">
            "{trustStatement}"
          </blockquote>
          <div className="w-12 h-px bg-primary mx-auto mt-10" />
        </motion.div>
      </div>
    </section>
  );
}
