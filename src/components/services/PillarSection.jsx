import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function PillarSection({ number, title, description, services, reversed = false }) {
  return (
    <section className={`py-20 lg:py-24 ${reversed ? 'bg-secondary' : 'bg-background'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={`col-span-12 lg:col-span-4 ${reversed ? 'lg:order-2 lg:col-start-9' : ''}`}
          >
            <span className="font-display text-7xl lg:text-8xl text-primary/20 leading-none block mb-2">
              {number}
            </span>
            <h3 className="font-display text-3xl lg:text-4xl text-foreground leading-tight">
              {title}
            </h3>
            <p className="font-body text-base text-muted-foreground leading-relaxed mt-4">
              {description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`col-span-12 lg:col-span-7 ${reversed ? 'lg:order-1' : 'lg:col-start-6'}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((service, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-background/80 border border-border/50 hover:border-primary/30 hover:shadow-[0_12px_26px_-18px_rgba(0,0,0,0.22)] transition-all duration-400"
                >
                  <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check size={12} />
                  </div>
                  <span className="font-body text-sm leading-relaxed text-foreground">{service}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
