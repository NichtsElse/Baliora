import React from 'react';
import Hero from '../components/home/Hero';
import TrustStatement from '../components/home/TrustStatement';
import WhyBaliora from '../components/home/WhyBaliora';
import ServicePillarsPreview from '../components/home/ServicePillarsPreview';
import FeaturedVillas from '../components/home/FeaturedVillas';
import HowWeWork from '../components/home/HowWeWork';
import Testimonial from '../components/home/Testimonial';
import CTASection from '../components/shared/CTASection';

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStatement />
      <FeaturedVillas />
      <WhyBaliora />
      <ServicePillarsPreview />
      <HowWeWork />
      <Testimonial />
      <CTASection />
    </>
  );
}