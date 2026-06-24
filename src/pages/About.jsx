/**
 * Purpose: Presents the Baliora story and brand values for the public website.
 * Used by: /about route.
 * Main dependencies: motion UI components, shared page sections, and site content helpers.
 * Public functions: About default export.
 * Side effects: none.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Eye, Award, Users } from 'lucide-react';
import PageHero from '../components/shared/PageHero';
import CTASection from '../components/shared/CTASection';
import { getWebsiteSettingValue, useSiteContentSync } from '@/lib/siteContent';

const values = [
  { icon: Heart, title: 'Owner-First Mindset', desc: 'Every decision is guided by what protects and grows your investment.' },
  { icon: Eye, title: 'Full Transparency', desc: 'Detailed monthly reports, open communication, and no hidden fees.' },
  { icon: Award, title: 'Hospitality Standards', desc: 'Hotel-grade SOPs applied to every villa we manage.' },
  { icon: Users, title: 'Local Expertise', desc: 'Deep Bali knowledge - culture, regulations, vendors, and market trends.' },
];

export default function About() {
  useSiteContentSync();
  const heroTitle = getWebsiteSettingValue('about_hero_title');
  const heroDescription = getWebsiteSettingValue('about_hero_desc');
  const storyImage = getWebsiteSettingValue('about_image');
  const storyTitle = getWebsiteSettingValue('about_story_title');
  const storyParagraphs = [
    getWebsiteSettingValue('about_story_p1'),
    getWebsiteSettingValue('about_story_p2'),
    getWebsiteSettingValue('about_story_p3'),
  ].filter(Boolean);
  const missionTitle = getWebsiteSettingValue('about_mission_title');
  const missionDescription = getWebsiteSettingValue('about_mission_desc');

  return (
    <>
      <PageHero
        eyebrow="About Baliora"
        title={heroTitle}
        description={heroDescription}
      />

      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="col-span-12 lg:col-span-5"
            >
              <img
                src={storyImage}
                alt="Elegant Bali villa interior with modern tropical design"
                className="w-full h-80 lg:h-[480px] object-cover"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="col-span-12 lg:col-span-6 lg:col-start-7"
            >
              <span className="font-body text-xs tracking-[0.25em] uppercase text-primary">Our Story</span>
              <h2 className="font-display text-3xl lg:text-4xl text-foreground leading-tight mt-3">
                {storyTitle}
              </h2>
              <div className="space-y-4 mt-6">
                {storyParagraphs.map((paragraph) => (
                  <p key={paragraph} className="font-body text-base text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="font-body text-xs tracking-[0.25em] uppercase text-primary">Our Mission</span>
            <h2 className="font-display text-3xl lg:text-4xl text-foreground leading-tight mt-3">
              {missionTitle}
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mt-6">
              {missionDescription}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="font-body text-xs tracking-[0.25em] uppercase text-primary">Our Values</span>
            <h2 className="font-display text-4xl lg:text-5xl text-foreground mt-3">What Guides Us</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((val, idx) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 flex items-center justify-center mx-auto text-primary mb-5">
                  <val.icon size={24} />
                </div>
                <h3 className="font-display text-lg text-foreground">{val.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mt-2">
                  {val.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Partner With Baliora"
        subtitle="Let's discuss how we can protect and elevate your villa investment."
      />
    </>
  );
}
