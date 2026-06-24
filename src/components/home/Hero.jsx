/**
 * Purpose: Renders the homepage hero for the local Baliora marketing site.
 * Used by: Home page.
 * Main dependencies: router links, motion, static media URLs, and site content helpers.
 * Public functions: Hero default export.
 * Side effects: none.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { getWebsiteSettingValue, useSiteContentSync } from '@/lib/siteContent';

export default function Hero() {
  useSiteContentSync();
  const heroEyebrow = getWebsiteSettingValue('hero_eyebrow');
  const heroTitle = getWebsiteSettingValue('hero_title');
  const heroSubtitle = getWebsiteSettingValue('hero_subtitle');
  const heroImage = getWebsiteSettingValue('hero_image');
  const heroTitleLines = heroTitle.split('\n').map((line) => line.trim()).filter(Boolean);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Luxury Bali villa with infinity pool at golden hour"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full py-32">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="font-body text-xs tracking-[0.3em] uppercase text-primary">
                {heroEyebrow}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-foreground leading-[1.05] mt-6"
            >
              {heroTitleLines.length > 1
                ? heroTitleLines.map((line, index) => (
                    <React.Fragment key={`${line}-${index}`}>
                      {index === heroTitleLines.length - 1 ? <span className="italic text-primary">{line}</span> : line}
                      {index < heroTitleLines.length - 1 ? <br /> : null}
                    </React.Fragment>
                  ))
                : heroTitle}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="font-body text-lg lg:text-xl text-muted-foreground leading-relaxed mt-8 max-w-lg"
            >
              {heroSubtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 mt-10"
            >
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full font-body text-sm tracking-wide px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-400 shadow-[0_14px_32px_-20px_rgba(0,0,0,0.28)] hover:shadow-[0_18px_36px_-20px_rgba(0,0,0,0.34)]"
              >
                Schedule a Consultation
                <ArrowRight size={16} />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 rounded-full font-body text-sm tracking-wide px-8 py-4 border border-foreground/20 text-foreground hover:border-primary hover:text-primary transition-all duration-400 shadow-[0_12px_28px_-22px_rgba(0,0,0,0.18)] hover:shadow-[0_16px_32px_-22px_rgba(0,0,0,0.24)]"
              >
                Explore Services
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowDown size={20} className="text-foreground/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}
