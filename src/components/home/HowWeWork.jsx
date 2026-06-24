import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const steps = [
  { num: '01', title: 'Assessment', desc: 'We evaluate your property condition, current operations, and revenue potential.' },
  { num: '02', title: 'Onboarding', desc: 'Agreement setup, SOP implementation, staffing review, and vendor coordination.' },
  { num: '03', title: 'Operation', desc: 'Daily management, guest services, maintenance, finance, and full reporting.' },
  { num: '04', title: 'Optimization', desc: 'Monthly reports, occupancy analysis, revenue insights, and improvement plans.' },
];

export default function HowWeWork() {
  return (
    <section className="py-24 lg:py-32 bg-secondary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-16"
        >
          <div>
            <span className="font-body text-xs tracking-[0.25em] uppercase text-primary">
              How We Work
            </span>
            <h2 className="font-display text-4xl lg:text-5xl text-foreground leading-tight mt-3">
              A Seamless Process
            </h2>
          </div>
          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-2 font-body text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Learn more <ArrowRight size={16} />
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="relative"
            >
              <div className="flex items-center gap-4">
                <span className="font-display text-5xl lg:text-6xl leading-none text-primary/28">
                  {step.num}
                </span>
              </div>
              <h3 className="font-display text-xl text-foreground mt-2">
                {step.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed mt-3">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
