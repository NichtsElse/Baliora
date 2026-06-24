import React from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, FileCheck, BarChart3 } from 'lucide-react';

const reasons = [
  {
    icon: Shield,
    title: 'Full-Service Management',
    description: 'From daily operations to financial reporting — every aspect of your villa, handled by one dedicated team.',
  },
  {
    icon: TrendingUp,
    title: 'Performance-Led Operations',
    description: 'We optimize your villa for maximum occupancy, revenue, and guest satisfaction through data-driven strategies.',
  },
  {
    icon: FileCheck,
    title: 'Compliance & Protection',
    description: 'Tax, legal, insurance, and regulatory compliance managed proactively to protect your asset value.',
  },
  {
    icon: BarChart3,
    title: 'Transparent Reporting',
    description: 'Monthly financial reports, occupancy analytics, and maintenance logs — complete visibility, always.',
  },
];

export default function WhyBaliora() {
  return (
    <section className="py-24 lg:py-32 bg-secondary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-body text-xs tracking-[0.25em] uppercase text-primary">
            Why Baliora
          </span>
          <h2 className="font-display text-4xl lg:text-5xl text-foreground leading-tight mt-3">
            One Property. One Team.<br />Complete Accountability.
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {reasons.map((reason, idx) => (
            <motion.div
              key={reason.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex gap-6 p-8 bg-background/60 backdrop-blur-sm hover:bg-background transition-all duration-400 group"
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-400">
                <reason.icon size={22} />
              </div>
              <div>
                <h3 className="font-display text-xl text-foreground">{reason.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mt-2">
                  {reason.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
