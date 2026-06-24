/**
 * Purpose: Presents the future BALIORA owner dashboard preview.
 * Used by: /dashboard route.
 * Main dependencies: PageHero, CTASection, framer-motion.
 * Public functions: Dashboard default export.
 * Side effects: none.
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, Calendar, TrendingUp, Wrench,
  Users, Star, BarChart3,
  FolderOpen, Package
} from 'lucide-react';
import PageHero from '../components/shared/PageHero';
import CTASection from '../components/shared/CTASection';

const features = [
  { icon: DollarSign, title: 'Monthly Financial Report', desc: 'Revenue, expenses, net income - complete P&L at your fingertips.' },
  { icon: Calendar, title: 'Occupancy Dashboard', desc: 'Real-time booking calendar with occupancy rates and trends.' },
  { icon: TrendingUp, title: 'Revenue Performance', desc: 'Track ADR, RevPAR, and month-over-month revenue growth.' },
  { icon: Wrench, title: 'Maintenance Logs', desc: 'Complete history of maintenance activities, costs, and schedules.' },
  { icon: Users, title: 'Staff Schedule', desc: 'Staff attendance, roster management, and payroll overview.' },
  { icon: DollarSign, title: 'Vendor Expenses', desc: 'Vendor payment tracking and cost analysis by category.' },
  { icon: Star, title: 'Guest Reviews', desc: 'Aggregated guest feedback and satisfaction scores.' },
  { icon: BarChart3, title: 'Capex Recommendations', desc: 'Data-driven investment recommendations for your property.' },
  { icon: FolderOpen, title: 'Document Storage', desc: 'Contracts, permits, insurance - all documents in one secure place.' },
  { icon: Package, title: 'Villa Asset Inventory', desc: 'Complete inventory tracking for furniture, equipment, and supplies.' },
];

export default function Dashboard() {
  return (
    <>
      <PageHero
        eyebrow="Owner Dashboard"
        title="Complete Visibility Into Your Villa"
        description="A digital dashboard designed for villa owners who want full transparency - financial performance, operations, maintenance, and guest insights in one place."
      />

      <section className="py-16 lg:py-24 bg-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="bg-background border border-border rounded-[28px] overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg tracking-wider text-foreground">BALIORA</span>
                  <span className="font-body text-xs text-muted-foreground">Owner Portal</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-body text-xs text-muted-foreground">Live</span>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Net Revenue', value: '$12,450', change: '+18%' },
                    { label: 'Occupancy Rate', value: '78%', change: '+5%' },
                    { label: 'ADR', value: '$285', change: '+12%' },
                    { label: 'Guest Rating', value: '4.9', change: '+0.2' },
                  ].map((metric) => (
                    <div key={metric.label} className="p-4 bg-secondary/60 border border-border/50 rounded-2xl">
                      <p className="font-body text-xs text-muted-foreground">{metric.label}</p>
                      <p className="font-display text-2xl text-foreground mt-1">{metric.value}</p>
                      <span className="font-body text-xs text-green-600">{metric.change}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 h-48 bg-secondary/40 border border-border/50 rounded-3xl flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 size={32} className="text-primary/30 mx-auto" />
                      <p className="font-body text-xs text-muted-foreground mt-2">Revenue Performance Chart</p>
                    </div>
                  </div>
                  <div className="h-48 bg-secondary/40 border border-border/50 rounded-3xl flex items-center justify-center">
                    <div className="text-center">
                      <Calendar size={32} className="text-primary/30 mx-auto" />
                      <p className="font-body text-xs text-muted-foreground mt-2">Booking Calendar</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -top-3 -right-3 rounded-full bg-primary text-primary-foreground font-body text-xs tracking-wider px-4 py-2 shadow-lg">
              COMING SOON
            </div>
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
            <span className="font-body text-xs tracking-[0.25em] uppercase text-primary">
              Dashboard Features
            </span>
            <h2 className="font-display text-4xl lg:text-5xl text-foreground mt-3">
              Everything You Need to Know
            </h2>
            <p className="font-body text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
              Our owner dashboard is being developed to give you complete visibility into every aspect of your villa operations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-px bg-border">
            {features.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-background p-6 border border-border/40 group hover:bg-secondary transition-colors duration-400 text-center"
              >
                <feat.icon size={20} className="text-primary mb-4 mx-auto" />
                <h3 className="font-display text-base text-foreground">{feat.title}</h3>
                <p className="font-body text-xs text-muted-foreground leading-relaxed mt-2">
                  {feat.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection
        title="Be the First to Access the Owner Dashboard"
        subtitle="Join our managed portfolio and get early access to the owner dashboard when it launches."
      />
    </>
  );
}
