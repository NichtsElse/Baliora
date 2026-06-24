/**
 * Purpose: Captures complimentary villa assessment requests for owners evaluating Baliora.
 * Used by: /assessment route and assessment CTAs across marketing pages.
 * Main dependencies: localClient villa assessment entity and shared form UI controls.
 * Public functions: Assessment default export.
 * Side effects: Writes assessment requests locally and optionally posts them to Supabase.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, ClipboardList, LineChart, Shield } from 'lucide-react';
import { localClient } from '@/api/localClient';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHero from '../components/shared/PageHero';

const assessmentBenefits = [
  'Operational readiness review',
  'Revenue and positioning snapshot',
  'Maintenance and compliance observations',
  'Initial improvement recommendations',
];

export default function Assessment() {
  const [formData, setFormData] = useState({
    owner_name: '',
    contact: '',
    villa_name: '',
    location: '',
    bedrooms: '',
    current_operation: '',
    rental_platform: '',
    average_occupancy: '',
    monthly_revenue: '',
    main_problem: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field, value) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (honeypot) return;

    setSubmitting(true);
    try {
      await localClient.entities.VillaAssessment.create({
        ...formData,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms, 10) : undefined,
        average_occupancy: formData.average_occupancy ? parseFloat(formData.average_occupancy) : undefined,
        monthly_revenue: formData.monthly_revenue ? parseFloat(formData.monthly_revenue) : undefined,
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Villa Assessment"
        title="Request a Complimentary Villa Assessment"
        description="Share your villa details and we will review your current operations, positioning, and opportunities for stronger long-term performance."
      />

      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-10 lg:gap-14 items-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="col-span-12 lg:col-span-7"
            >
              {submitted ? (
                <div className="rounded-[28px] border border-border bg-secondary/50 p-8 lg:p-10 text-center">
                  <CheckCircle size={48} className="mx-auto text-primary" />
                  <h2 className="mt-5 font-display text-3xl text-foreground">Assessment Request Received</h2>
                  <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground">
                    Thank you. Our team will review your property details and reach out within 24 hours to discuss the next step.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input
                    type="text"
                    name="assessment_verification"
                    value={honeypot}
                    onChange={(event) => setHoneypot(event.target.value)}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2 block font-body text-sm text-foreground">Owner Name *</Label>
                      <Input
                        required
                        value={formData.owner_name}
                        onChange={(event) => handleChange('owner_name', event.target.value)}
                        placeholder="Your full name"
                        className="border-border bg-transparent"
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block font-body text-sm text-foreground">Contact *</Label>
                      <Input
                        required
                        value={formData.contact}
                        onChange={(event) => handleChange('contact', event.target.value)}
                        placeholder="Email or WhatsApp number"
                        className="border-border bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2 block font-body text-sm text-foreground">Villa Name</Label>
                      <Input
                        value={formData.villa_name}
                        onChange={(event) => handleChange('villa_name', event.target.value)}
                        placeholder="Optional property name"
                        className="border-border bg-transparent"
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block font-body text-sm text-foreground">Location *</Label>
                      <Input
                        required
                        value={formData.location}
                        onChange={(event) => handleChange('location', event.target.value)}
                        placeholder="Seminyak, Canggu, Ubud..."
                        className="border-border bg-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2 block font-body text-sm text-foreground">Bedrooms</Label>
                      <Input
                        type="number"
                        min="1"
                        value={formData.bedrooms}
                        onChange={(event) => handleChange('bedrooms', event.target.value)}
                        placeholder="e.g. 4"
                        className="border-border bg-transparent"
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block font-body text-sm text-foreground">Current Operation</Label>
                      <Select
                        value={formData.current_operation}
                        onValueChange={(value) => handleChange('current_operation', value)}
                      >
                        <SelectTrigger className="border-border bg-transparent">
                          <SelectValue placeholder="Select current setup" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private-use">Private use</SelectItem>
                          <SelectItem value="rental-villa">Rental villa</SelectItem>
                          <SelectItem value="hybrid-use">Private + rental</SelectItem>
                          <SelectItem value="under-preparation">Under preparation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <Label className="mb-2 block font-body text-sm text-foreground">Rental Platform</Label>
                      <Input
                        value={formData.rental_platform}
                        onChange={(event) => handleChange('rental_platform', event.target.value)}
                        placeholder="Airbnb, Booking.com, direct..."
                        className="border-border bg-transparent"
                      />
                    </div>
                    <div>
                      <Label className="mb-2 block font-body text-sm text-foreground">Average Occupancy (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.average_occupancy}
                        onChange={(event) => handleChange('average_occupancy', event.target.value)}
                        placeholder="e.g. 68"
                        className="border-border bg-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block font-body text-sm text-foreground">Monthly Revenue (optional)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.monthly_revenue}
                      onChange={(event) => handleChange('monthly_revenue', event.target.value)}
                      placeholder="Estimated monthly revenue"
                      className="border-border bg-transparent"
                    />
                  </div>

                  <div>
                    <Label className="mb-2 block font-body text-sm text-foreground">Main Problem or Goal</Label>
                    <Textarea
                      value={formData.main_problem}
                      onChange={(event) => handleChange('main_problem', event.target.value)}
                      placeholder="Tell us what you want to improve: operations, rentals, maintenance, staffing, reporting..."
                      className="min-h-[140px] border-border bg-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-body text-sm tracking-wide text-primary-foreground transition-all duration-400 hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Request Villa Assessment'}
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="col-span-12 lg:col-span-4 lg:col-start-9"
            >
              <div className="rounded-[28px] border border-border bg-secondary/50 p-7 lg:p-8">
                <div className="flex items-center gap-3 text-primary">
                  <ClipboardList size={20} />
                  <span className="font-body text-xs uppercase tracking-[0.22em]">What We Review</span>
                </div>
                <div className="mt-6 space-y-3">
                  {assessmentBenefits.map((benefit) => (
                    <div key={benefit} className="flex items-start gap-3 rounded-2xl border border-border/40 bg-background/80 px-4 py-3">
                      <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                      <span className="font-body text-sm text-foreground">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 rounded-[28px] bg-accent p-7 lg:p-8 text-accent-foreground">
                <div className="flex items-center gap-3 text-primary">
                  <LineChart size={20} />
                  <span className="font-body text-xs uppercase tracking-[0.22em]">Owner Outcome</span>
                </div>
                <h3 className="mt-5 font-display text-2xl leading-tight">Clearer next steps for your villa investment</h3>
                <p className="mt-4 font-body text-sm leading-relaxed text-accent-foreground/68">
                  We assess operational gaps, revenue opportunities, and risk points so you can make decisions with more confidence.
                </p>
                <div className="mt-6 flex items-start gap-3">
                  <Shield size={18} className="mt-0.5 text-primary" />
                  <p className="font-body text-sm leading-relaxed text-accent-foreground/72">
                    Submissions are stored locally for demos and can be sent to Supabase automatically once your environment variables are connected.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
