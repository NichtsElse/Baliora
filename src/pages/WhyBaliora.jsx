/**
 * Purpose: Explains the Baliora management value proposition in the local website build.
 * Used by: /why-baliora route.
 * Main dependencies: motion UI components and shared CTA sections.
 * Public functions: WhyBaliora default export.
 * Side effects: none.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, BarChart3, Users, Lock, Handshake, Eye } from 'lucide-react';
import PageHero from '../components/shared/PageHero';
import CTASection from '../components/shared/CTASection';

const advantages = [
  {
    icon: Shield,
    title: 'One Accountable Partner',
    description: 'No fragmented vendors. One team manages every aspect of your villa - from daily housekeeping to tax compliance.',
  },
  {
    icon: FileText,
    title: 'End-to-End Coverage',
    description: 'Six operational pillars covering administration, operations, amenities, maintenance, interiors, and rental management.',
  },
  {
    icon: Eye,
    title: 'Owner-Focused Reporting',
    description: 'Monthly financial reports, occupancy analytics, maintenance logs, and revenue insights - delivered with clarity and transparency.',
  },
  {
    icon: BarChart3,
    title: 'Hotel-Grade SOP',
    description: 'We apply hospitality industry standards to your villa operations, ensuring consistent quality and guest satisfaction.',
  },
  {
    icon: Lock,
    title: 'Compliance & Risk Management',
    description: 'Tax, legal, BPJS, insurance, and regulatory compliance managed proactively to protect your investment.',
  },
  {
    icon: Users,
    title: 'Strong Local Vendor Network',
    description: 'Trusted relationships with the best vendors in Bali - from landscaping to renovations - ensuring quality and fair pricing.',
  },
  {
    icon: Handshake,
    title: 'Hands-Off Ownership',
    description: 'Enjoy the returns of villa ownership without the daily demands. We handle everything, you receive the reports.',
  },
];

export default function WhyBaliora() {
  return (
    <>
      <PageHero
        eyebrow="Why Baliora"
        title="The Case for Professional Villa Management"
        description="Most villa owners in Bali manage properties through fragmented services. Baliora brings everything under one roof - with one team and complete accountability."
      />

      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="col-span-12 lg:col-span-5 lg:sticky lg:top-32"
            >
              <img
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80"
                alt="Aerial view of luxury Bali villa compound with tropical landscaping"
                className="w-full h-64 lg:h-[420px] object-cover"
              />
              <div className="p-8 bg-accent mt-px">
                <p className="font-display text-xl text-accent-foreground italic leading-relaxed">
                  "One Property. One Team. Complete Accountability."
                </p>
                <p className="font-body text-sm text-accent-foreground/60 mt-3">
                  - The Baliora Promise
                </p>
              </div>
            </motion.div>

            <div className="col-span-12 lg:col-span-6 lg:col-start-7 space-y-8">
              {advantages.map((adv, idx) => (
                <motion.div
                  key={adv.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  className="flex gap-5 p-6 border border-border hover:border-primary/30 transition-all duration-400"
                >
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-primary">
                    <adv.icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-foreground">{adv.title}</h3>
                    <p className="font-body text-sm text-muted-foreground leading-relaxed mt-2">
                      {adv.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
