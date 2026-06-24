/**
 * Purpose: Previews the six BALIORA service pillars on the homepage.
 * Used by: Home page.
 * Main dependencies: router links, motion, and lucide icons.
 * Public functions: ServicePillarsPreview default export.
 * Side effects: none.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ClipboardList, Home, Sparkles, Wrench, Sofa, CalendarCheck } from 'lucide-react';

const pillars = [
  { num: '01', title: 'Management & Administration', icon: ClipboardList, desc: 'Finance, HR, compliance, and reporting - the backbone of your operations.' },
  { num: '02', title: 'Daily Operations', icon: Home, desc: 'Housekeeping, maintenance, F&B, and quality inspections to hospitality standards.' },
  { num: '03', title: 'Amenities & Equipment', icon: Sparkles, desc: 'Premium toiletries, linens, welcome setups, and hotel-grade guest essentials.' },
  { num: '04', title: 'Facility Maintenance', icon: Wrench, desc: 'Pest control, pool care, landscaping, deep cleaning, and preventive upkeep.' },
  { num: '05', title: 'Furniture & Interior', icon: Sofa, desc: 'Procurement, renovation management, interior styling, and asset tracking.' },
  { num: '06', title: 'Rental Villa', icon: CalendarCheck, desc: 'Listing optimization, dynamic pricing, booking management, and revenue reporting.' },
];

export default function ServicePillarsPreview() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="font-body text-xs tracking-[0.25em] uppercase text-primary">
            Our Services
          </span>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mt-3">
            <h2 className="font-display text-4xl lg:text-5xl text-foreground leading-tight">
              Six Pillars of<br />Complete Management
            </h2>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 font-body text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View all services <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={pillar.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="bg-secondary/70 p-8 lg:p-10 rounded-[28px] border border-border/50 shadow-[0_20px_40px_-32px_rgba(0,0,0,0.22)] group hover:bg-secondary transition-all duration-500"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="font-display text-5xl text-primary/30 group-hover:text-primary/45 transition-colors duration-500">
                  {pillar.num}
                </span>
                <pillar.icon size={24} className="text-muted-foreground group-hover:text-primary transition-colors duration-500" />
              </div>
              <h3 className="font-display text-xl text-foreground">
                {pillar.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mt-3">
                {pillar.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
