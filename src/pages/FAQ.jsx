/**
 * Purpose: Renders the public FAQ page using locally managed admin content with fallback entries.
 * Used by: /faq route.
 * Main dependencies: framer-motion, shared page sections, and site content helpers.
 * Public functions: FAQ default export.
 * Side effects: none.
 */
import React from 'react';
import { motion } from 'framer-motion';
import PageHero from '../components/shared/PageHero';
import CTASection from '../components/shared/CTASection';
import { getPublicFaqs, useSiteContentSync } from '@/lib/siteContent';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function FAQ() {
  useSiteContentSync();
  const faqs = getPublicFaqs();

  return (
    <>
      <PageHero
        eyebrow="Frequently Asked Questions"
        title="Questions Villa Owners Ask"
        description="Everything you need to know about partnering with Baliora for professional villa management."
      />

      <section className="py-20 lg:py-28 bg-background">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id || index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-border px-6 data-[state=open]:border-primary/30 transition-colors"
                >
                  <AccordionTrigger className="font-display text-lg text-foreground text-left hover:no-underline hover:text-primary transition-colors py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="font-body text-base text-muted-foreground leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </section>

      <CTASection
        title="Still Have Questions?"
        subtitle="Our team is here to help. Reach out and we will get back to you within 24 hours."
        primaryCTA="Contact Us"
      />
    </>
  );
}
