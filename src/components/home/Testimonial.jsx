/**
 * Purpose: Displays featured owner testimonials in an auto-rotating homepage carousel.
 * Used by: Home page.
 * Main dependencies: React state/effect, framer-motion, and site content helpers.
 * Public functions: Testimonial default export.
 * Side effects: Starts and clears an interval timer for testimonial rotation.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { getFeaturedTestimonials, getWebsiteSettingValue, useSiteContentSync } from '@/lib/siteContent';

const STATIC = {
  review:
    "Since partnering with Baliora, our villa occupancy increased by 40% and we finally have complete visibility into every aspect of our property. It's the peace of mind every villa owner deserves.",
  owner_name: 'Villa Owner',
  country: 'Seminyak, Bali',
  photo_url: null,
};

export default function Testimonial() {
  useSiteContentSync();
  const fallbackImage = getWebsiteSettingValue('testimonial_image');
  const testimonials = useMemo(() => {
    const featuredTestimonials = getFeaturedTestimonials();
    return featuredTestimonials.length > 0 ? featuredTestimonials : [STATIC];
  }, []);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (testimonials.length <= 1 || paused) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, [paused, testimonials.length]);

  useEffect(() => {
    setActiveIndex(0);
  }, [testimonials.length]);

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % testimonials.length);
  };

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length);
  };

  const featured = testimonials[activeIndex] || testimonials[0] || STATIC;
  const featureImage = featured.photo_url || fallbackImage;

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-12 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="col-span-12 lg:col-span-5"
          >
            <img
              src={featureImage}
              alt="Luxury Bali villa bedroom"
              className="w-full h-80 lg:h-[500px] object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="col-span-12 lg:col-span-6 lg:col-start-7"
          >
            <div
              className="relative min-h-[320px]"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
            >
              {testimonials.map((item, index) => {
                const isActive = index === activeIndex;

                return (
                  <motion.div
                    key={`${item.owner_name || 'testimonial'}-${index}`}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      x: isActive ? 0 : 24,
                      pointerEvents: isActive ? 'auto' : 'none',
                    }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="absolute inset-0"
                    aria-hidden={!isActive}
                  >
                    <Quote size={40} className="text-primary/30 mb-6" />
                    {item.rating && (
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, starIndex) => (
                          <Star
                            key={starIndex}
                            size={14}
                            className={
                              starIndex < item.rating
                                ? 'text-primary fill-primary'
                                : 'text-border'
                            }
                          />
                        ))}
                      </div>
                    )}
                    <blockquote className="font-display text-2xl lg:text-3xl text-foreground leading-relaxed italic">
                      "{item.review}"
                    </blockquote>
                    <div className="flex items-center gap-3 mt-8">
                      {item.photo_url && (
                        <img
                          src={item.photo_url}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <p className="font-body text-sm font-medium text-foreground">
                          {item.owner_name}
                        </p>
                        <p className="font-body text-sm text-muted-foreground mt-0.5">
                          {item.villa_name ? `${item.villa_name} · ` : ''}
                          {item.country}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {testimonials.length > 1 && (
                <div className="absolute right-0 top-0 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow-md"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-background/90 text-foreground shadow-sm transition-all hover:border-primary hover:text-primary hover:shadow-md"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </div>

            {testimonials.length > 1 && (
              <div className="flex items-center gap-2 mt-8">
                {testimonials.map((item, index) => (
                  <button
                    key={`${item.owner_name || 'testimonial-dot'}-${index}`}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex ? 'w-8 bg-primary' : 'w-2 bg-primary/30'
                    }`}
                    aria-label={`Show testimonial ${index + 1}`}
                    aria-pressed={index === activeIndex}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
