/**
 * Purpose: Shows detailed villa information backed by local seeded records.
 * Used by: /villas/:slug route.
 * Main dependencies: localClient villa queries plus booking and gallery components.
 * Public functions: VillaDetail default export.
 * Side effects: reads villa data from localStorage-backed services.
 */
import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  Bed,
  Bath,
  Users,
  Star,
  Phone,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { localClient } from '@/api/localClient';
import VillaGallery from '../components/villas/VillaGallery';
import BookingInquiryForm from '../components/villas/BookingInquiryForm';
import AmenityBadge from '../components/villas/AmenityBadge';
import SimilarVillas from '../components/villas/SimilarVillas';

export default function VillaDetail() {
  const { slug } = useParams();

  const { data: allVillas = [], isLoading } = useQuery({
    queryKey: ['villas'],
    queryFn: () => localClient.entities.VillaListing.list('-created_date', 50),
  });

  const villa = useMemo(
    () => allVillas.find((item) => item.slug === slug),
    [allVillas, slug]
  );

  const whatsappMessage = villa
    ? `Hello, I am interested in booking ${villa.name} in ${villa.location}. Can you please share availability?`
    : '';
  const whatsappUrl = `https://wa.me/6282227888025?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 bg-background">
        <Loader2 size={32} className="text-primary animate-spin" />
      </div>
    );
  }

  if (!villa) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-background text-center px-6">
        <AlertTriangle size={40} className="text-muted-foreground mb-4" />
        <h2 className="font-display text-3xl text-foreground">
          Villa Not Found
        </h2>
        <p className="font-body text-muted-foreground mt-3">
          The villa you&apos;re looking for isn&apos;t available.
        </p>
        <Link
          to="/villas"
          className="mt-6 rounded-full font-body text-sm px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/90 inline-block"
        >
          Browse All Villas
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="pt-24 lg:pt-28 pb-4 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-2 font-body text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link to="/villas" className="hover:text-foreground transition-colors">
              Villas
            </Link>
            <span>/</span>
            <span className="text-foreground truncate">{villa.name}</span>
          </div>
        </div>
      </div>

      <section className="pb-6 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <VillaGallery images={villa.image_urls} villaName={villa.name} />
        </div>
      </section>

      <section className="py-8 lg:py-12 bg-background">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            <div className="col-span-12 lg:col-span-7 space-y-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex flex-wrap gap-2 mb-3">
                  {(villa.highlight_tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="font-body text-xs tracking-wide px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h1 className="font-display text-4xl lg:text-5xl text-foreground leading-tight">
                  {villa.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin size={15} />
                    <span className="font-body text-sm">
                      {villa.address_area || villa.location}, Bali
                    </span>
                  </div>
                  {villa.rating && (
                    <div className="flex items-center gap-1">
                      <Star size={15} className="text-amber-500 fill-amber-500" />
                      <span className="font-body text-sm font-medium text-foreground">
                        {villa.rating}
                      </span>
                      {villa.review_count > 0 && (
                        <span className="font-body text-sm text-muted-foreground">
                          ({villa.review_count} reviews)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              <div className="w-full h-px bg-border" />

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-4"
              >
                {[
                  { icon: Bed, label: 'Bedrooms', value: villa.bedrooms },
                  { icon: Bath, label: 'Bathrooms', value: villa.bathrooms },
                  { icon: Users, label: 'Max Guests', value: villa.max_guests },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center p-4 rounded-2xl bg-secondary/60 border border-border/50"
                  >
                    <stat.icon size={20} className="text-primary mx-auto mb-2" />
                    <p className="font-display text-2xl text-foreground">
                      {stat.value}
                    </p>
                    <p className="font-body text-xs text-muted-foreground mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </motion.div>

              <div className="w-full h-px bg-border" />

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <h2 className="font-display text-2xl text-foreground mb-4">
                  About This Villa
                </h2>
                <p className="font-body text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                  {villa.full_description || villa.short_description}
                </p>
              </motion.div>

              <div className="w-full h-px bg-border" />

              {villa.amenities?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="font-display text-2xl text-foreground mb-5">
                    Amenities
                  </h2>
                  <div className="flex flex-wrap gap-2.5">
                    {villa.amenities.map((amenity) => (
                      <AmenityBadge key={amenity} amenity={amenity} />
                    ))}
                  </div>
                </motion.div>
              )}

              {villa.house_rules?.length > 0 && (
                <>
                  <div className="w-full h-px bg-border" />
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                  >
                    <h2 className="font-display text-2xl text-foreground mb-5">
                      House Rules
                    </h2>
                    <div className="space-y-3">
                      {villa.house_rules.map((rule, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Check
                            size={15}
                            className="text-primary mt-0.5 flex-shrink-0"
                          />
                          <span className="font-body text-sm text-foreground">
                            {rule}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </>
              )}

              <div className="w-full h-px bg-border" />
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="font-display text-2xl text-foreground mb-4">
                  Location
                </h2>
                <div className="flex items-start gap-3 p-5 rounded-3xl bg-secondary/60 border border-border">
                  <MapPin size={18} className="text-primary mt-0.5" />
                  <div>
                    <p className="font-body text-base text-foreground">
                      {villa.address_area || villa.location}
                    </p>
                    <p className="font-body text-sm text-muted-foreground mt-1">
                      {villa.location}, Bali, Indonesia
                    </p>
                  </div>
                </div>
                <div className="mt-4 h-48 rounded-3xl bg-secondary border border-border flex items-center justify-center">
                  <p className="font-body text-sm text-muted-foreground">
                    Map view · {villa.location}, Bali
                  </p>
                </div>
              </motion.div>

              <div className="w-full h-px bg-border" />
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h2 className="font-display text-2xl text-foreground mb-4">
                  Availability
                </h2>
                <div className="p-8 rounded-3xl bg-secondary border border-border text-center">
                  <p className="font-body text-sm text-muted-foreground">
                    Live availability calendar coming soon.{' '}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline underline-offset-2"
                    >
                      Contact us on WhatsApp
                    </a>{' '}
                    to check dates instantly.
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="col-span-12 lg:col-span-4 lg:col-start-9">
              <div className="lg:sticky lg:top-28">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="border border-border p-6 lg:p-8 bg-background shadow-lg rounded-3xl"
                >
                  <BookingInquiryForm villa={villa} />
                </motion.div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-full font-body text-sm tracking-wide py-3.5 bg-green-600 text-white hover:bg-green-700 transition-all duration-400"
                >
                  <Phone size={16} />
                  Book via WhatsApp
                </a>

                <p className="font-body text-xs text-muted-foreground text-center mt-3">
                  Managed by BALIORA · Professional hospitality standards
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SimilarVillas villas={allVillas} currentSlug={slug} />
    </>
  );
}
