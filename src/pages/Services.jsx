/**
 * Purpose: Presents BALIORA's six operational service pillars.
 * Used by: /services route.
 * Main dependencies: PageHero, PillarSection, CTASection, and site content helpers.
 * Public functions: Services default export.
 * Side effects: none.
 */
import React from 'react';
import PageHero from '../components/shared/PageHero';
import PillarSection from '../components/services/PillarSection';
import CTASection from '../components/shared/CTASection';
import {
  getServicePillars,
  getWebsiteSettingValue,
  useSiteContentSync,
} from '@/lib/siteContent';

export default function Services() {
  useSiteContentSync();
  const pillars = getServicePillars();
  const pageTitle = getWebsiteSettingValue('services_page_title');
  const pageDescription = getWebsiteSettingValue('services_page_desc');
  const ctaTitle = getWebsiteSettingValue('services_cta_title');
  const ctaSubtitle = getWebsiteSettingValue('services_cta_subtitle');

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title={pageTitle}
        description={pageDescription}
      />

      {pillars.map((pillar, idx) => (
        <PillarSection
          key={pillar.number}
          number={pillar.number}
          title={pillar.title}
          description={pillar.description}
          services={pillar.services}
          reversed={idx % 2 === 1}
        />
      ))}

      <CTASection
        title={ctaTitle}
        subtitle={ctaSubtitle}
        primaryCTA="Request Villa Assessment"
        primaryLink="/assessment"
      />
    </>
  );
}
