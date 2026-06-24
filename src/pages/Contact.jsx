/**
 * Purpose: Captures owner consultation inquiries and shows local contact details.
 * Used by: /contact route.
 * Main dependencies: localClient inquiry entity and form UI.
 * Public functions: Contact default export.
 * Side effects: writes owner inquiry records to localStorage and calls the shared lead email endpoint.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { localClient } from '@/api/localClient';
import { sendLeadNotification } from '@/lib/sendLeadNotification';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import PageHero from '../components/shared/PageHero';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    villa_location: '',
    bedroom_count: '',
    current_status: '',
    message: '',
  });
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionNote, setSubmissionNote] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (honeypot) return;

    setSubmitting(true);
    try {
      setSubmissionNote('');
      await localClient.entities.Inquiry.create({
        ...formData,
        bedroom_count: formData.bedroom_count ? parseInt(formData.bedroom_count, 10) : undefined,
      });

      setSubmitted(true);
      sendLeadNotification({
        type: 'consultation',
        ...formData,
      })
        .then((emailResult) => {
          if (!emailResult.ok) {
            setSubmissionNote(
              emailResult.message ||
                'Your request was saved, but email delivery still needs to be configured.'
            );
          }
        })
        .catch(() => {
          setSubmissionNote(
            'Your request was saved, but email delivery still needs to be configured.'
          );
        });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-background pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto px-6 text-center"
          >
            <CheckCircle size={48} className="text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl lg:text-4xl text-foreground">
              Thank You
            </h2>
            <p className="font-body text-lg text-muted-foreground mt-4 leading-relaxed">
              Your consultation request has been received. Our team will reach out within 24 hours to discuss your villa.
            </p>
            {submissionNote && (
              <p className="font-body text-sm text-muted-foreground mt-4 leading-relaxed">
                {submissionNote}
              </p>
            )}
            <a
              href="/"
              className="inline-flex items-center gap-2 font-body text-sm text-primary mt-8 hover:text-primary/80 transition-colors"
            >
              Return to homepage <ArrowRight size={16} />
            </a>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="Request a Consultation"
        description="Tell us about your villa. Our team will get back to you within 24 hours with a tailored management proposal."
      />

      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="col-span-12 lg:col-span-7"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot */}
                <input
                  type="text"
                  name="full_name_verification"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="font-body text-sm text-foreground mb-2 block">Full Name *</Label>
                    <Input
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="border-border bg-transparent font-body focus:border-primary"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label className="font-body text-sm text-foreground mb-2 block">Email *</Label>
                    <Input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="border-border bg-transparent font-body focus:border-primary"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="font-body text-sm text-foreground mb-2 block">WhatsApp</Label>
                    <Input
                      value={formData.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                      className="border-border bg-transparent font-body focus:border-primary"
                      placeholder="+62 xxx xxxx xxxx"
                    />
                  </div>
                  <div>
                    <Label className="font-body text-sm text-foreground mb-2 block">Villa Location</Label>
                    <Input
                      value={formData.villa_location}
                      onChange={(e) => handleChange('villa_location', e.target.value)}
                      className="border-border bg-transparent font-body focus:border-primary"
                      placeholder="e.g. Seminyak, Canggu"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <Label className="font-body text-sm text-foreground mb-2 block">Number of Bedrooms</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.bedroom_count}
                      onChange={(e) => handleChange('bedroom_count', e.target.value)}
                      className="border-border bg-transparent font-body focus:border-primary"
                      placeholder="e.g. 3"
                    />
                  </div>
                  <div>
                    <Label className="font-body text-sm text-foreground mb-2 block">Current Status</Label>
                    <Select
                      value={formData.current_status}
                      onValueChange={(val) => handleChange('current_status', val)}
                    >
                      <SelectTrigger className="border-border bg-transparent font-body">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private_use">Private Use</SelectItem>
                        <SelectItem value="rental">Rental</SelectItem>
                        <SelectItem value="under_renovation">Under Renovation</SelectItem>
                        <SelectItem value="new_investment">New Investment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="font-body text-sm text-foreground mb-2 block">Message</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleChange('message', e.target.value)}
                    className="rounded-[28px] border-border bg-transparent font-body focus:border-primary min-h-[120px] px-4 py-3"
                    placeholder="Tell us about your villa and what you need..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 rounded-full font-body text-sm tracking-wide px-8 py-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-400 shadow-[0_14px_30px_-20px_rgba(0,0,0,0.28)] hover:shadow-[0_18px_34px_-20px_rgba(0,0,0,0.34)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Request Consultation'}
                  <ArrowRight size={16} />
                </button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="col-span-12 lg:col-span-4 lg:col-start-9"
            >
              <div className="space-y-8">
                <div>
                  <h3 className="font-display text-xl text-foreground mb-6">Get in Touch</h3>
                  <div className="space-y-4">
                    <a href="mailto:info@v-teki.com" className="flex items-start gap-3 group">
                      <Mail size={18} className="text-primary mt-0.5" />
                      <div>
                        <p className="font-body text-sm text-foreground group-hover:text-primary transition-colors">info@v-teki.com</p>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">Email us anytime</p>
                      </div>
                    </a>
                    <a href="https://wa.me/6282227888025" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                      <Phone size={18} className="text-primary mt-0.5" />
                      <div>
                        <p className="font-body text-sm text-foreground group-hover:text-primary transition-colors">+62-822 2788 8025</p>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">WhatsApp us</p>
                      </div>
                    </a>
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-primary mt-0.5" />
                      <div>
                        <p className="font-body text-sm text-foreground">Bali, Indonesia</p>
                        <p className="font-body text-xs text-muted-foreground mt-0.5">www.balioravilla.com</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border pt-8">
                  <h4 className="font-display text-lg text-foreground mb-3">Response Time</h4>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    We respond to all inquiries within 24 hours. For urgent matters, please reach us directly via WhatsApp.
                  </p>
                </div>

                <div className="p-6 bg-secondary">
                  <h4 className="font-display text-lg text-foreground mb-3">Villa Assessment</h4>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    Not sure where to start? We offer a complimentary villa assessment to evaluate your property and discuss management opportunities.
                  </p>
                  <a
                    href="/assessment"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 font-body text-sm tracking-wide text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                  >
                    Request Villa Assessment
                    <ArrowRight size={14} />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
