/**
 * Purpose: Explains BALIORA's four-step onboarding and management process.
 * Used by: /how-it-works route.
 * Main dependencies: PageHero, CTASection, framer-motion, lucide icons.
 * Public functions: HowItWorks default export.
 * Side effects: none.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Search, Settings, Play, LineChart } from 'lucide-react';
import PageHero from '../components/shared/PageHero';
import CTASection from '../components/shared/CTASection';

const steps = [
  {
    num: '01',
    icon: Search,
    title: 'Assessment',
    subtitle: 'Understanding Your Property',
    description: 'We start by evaluating your villa - its current condition, operational setup, market positioning, and revenue potential. This comprehensive assessment forms the foundation for everything that follows.',
    details: [
      'Property condition evaluation',
      'Current operations review',
      'Revenue & occupancy analysis',
      'Market positioning assessment',
      'Improvement opportunity identification',
    ],
  },
  {
    num: '02',
    icon: Settings,
    title: 'Onboarding',
    subtitle: 'Setting Up for Success',
    description: 'We establish the operational framework - from management agreements and SOP documentation to staffing review and vendor coordination. Every system is put in place before we begin operations.',
    details: [
      'Management agreement setup',
      'SOP documentation & implementation',
      'Staffing review & optimization',
      'Vendor review & coordination',
      'Operational infrastructure setup',
    ],
  },
  {
    num: '03',
    icon: Play,
    title: 'Operation',
    subtitle: 'Daily Management Excellence',
    description: 'Your villa enters professional management. Daily housekeeping, guest services, maintenance, financial operations, and comprehensive reporting - all handled by our team.',
    details: [
      'Daily housekeeping & maintenance',
      'Guest services & concierge',
      'Financial operations & accounting',
      'Staff management & scheduling',
      'Quality control & inspections',
    ],
  },
  {
    num: '04',
    icon: LineChart,
    title: 'Reporting & Optimization',
    subtitle: 'Continuous Improvement',
    description: 'Every month, you receive detailed reports on financial performance, occupancy, maintenance, and guest satisfaction. We use this data to identify improvements and maximize returns.',
    details: [
      'Monthly financial reports',
      'Occupancy & revenue analysis',
      'Guest satisfaction insights',
      'Maintenance & capex recommendations',
      'Revenue optimization strategies',
    ],
  },
];

export default function HowItWorks() {
  return (
    <>
      <PageHero
        eyebrow="How It Works"
        title="From Assessment to Optimization"
        description="A proven four-step process designed to transition your villa into professional management - seamlessly and transparently."
      />

      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="space-y-0">
            {steps.map((step, idx) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className={`grid grid-cols-12 gap-8 py-16 lg:py-20 ${
                  idx < steps.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <div className="col-span-12 lg:col-span-1">
                  <span className="font-display text-5xl lg:text-6xl text-primary/20 leading-none block">
                    {step.num}
                  </span>
                </div>

                <div className="col-span-12 lg:col-span-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 flex items-center justify-center text-primary">
                      <step.icon size={20} />
                    </div>
                    <span className="font-body text-xs tracking-[0.2em] uppercase text-primary">
                      {step.subtitle}
                    </span>
                  </div>
                  <h3 className="font-display text-3xl lg:text-4xl text-foreground">
                    {step.title}
                  </h3>
                  <p className="font-body text-base text-muted-foreground leading-relaxed mt-4">
                    {step.description}
                  </p>
                </div>

                <div className="col-span-12 lg:col-span-5 lg:col-start-7">
                  <div className="space-y-3 lg:pt-10">
                    {step.details.map((detail, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/60 border border-border/30"
                      >
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                        <span className="font-body text-sm text-foreground">{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Start Your Villa Assessment"
        subtitle="The first step is a free, no-obligation assessment of your property."
        primaryCTA="Request Assessment"
        primaryLink="/assessment"
      />
    </>
  );
}
