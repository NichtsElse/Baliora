/**
 * Purpose: Reusable call-to-action block for site-wide conversion prompts.
 * Used by: marketing pages and homepage sections.
 * Main dependencies: react-router Link, framer-motion, lucide icons.
 * Public functions: CTASection default export.
 * Side effects: none.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CTASection({
  title = "Ready to Protect Your Villa Investment?",
  subtitle = "Schedule a free consultation with our team. No obligations, just clarity.",
  primaryCTA = "Schedule Consultation",
  primaryLink = "/contact",
  secondaryCTA = "WhatsApp Us",
  secondaryLink = "https://wa.me/6282227888025",
}) {
  return (
    <section className="py-24 lg:py-32 bg-accent">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="font-display text-4xl lg:text-5xl text-accent-foreground leading-tight">
            {title}
          </h2>
          <p className="font-body text-lg text-accent-foreground/60 mt-6 leading-relaxed">
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              to={primaryLink}
              className="inline-flex items-center gap-2 rounded-full font-body text-sm tracking-wide px-8 py-3.5 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-400 shadow-[0_12px_28px_-18px_rgba(0,0,0,0.3)] hover:shadow-[0_18px_34px_-20px_rgba(0,0,0,0.35)]"
            >
              {primaryCTA}
              <ArrowRight size={16} />
            </Link>
            <a
              href={secondaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full font-body text-sm tracking-wide px-8 py-3.5 border border-accent-foreground/20 text-accent-foreground hover:border-primary hover:text-primary transition-all duration-400"
            >
              {secondaryCTA}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
