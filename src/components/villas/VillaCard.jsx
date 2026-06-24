/**
 * Purpose: Renders a single villa card with image, summary, and detail CTA.
 * Used by: villas listing pages and featured/similar villa sections.
 * Main dependencies: react-router Link, framer-motion, AmenityBadge.
 * Public functions: VillaCard default export.
 * Side effects: none.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Users, Bed, Bath, Star, ArrowRight } from 'lucide-react';
import AmenityBadge from './AmenityBadge';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&q=80',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80',
  'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=800&q=80',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
];

export default function VillaCard({ villa, index = 0 }) {
  const mainImage = villa.image_urls?.[0] || PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
  const topAmenities = (villa.amenities || []).slice(0, 3);
  const rating = villa.rating || 4.9;
  const reviewCount = villa.review_count || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group flex h-full flex-col bg-background border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-500 overflow-hidden"
    >
      {/* Image */}
      <Link to={`/villas/${villa.slug}`} className="block relative overflow-hidden aspect-[4/3]">
        <img
          src={mainImage}
          alt={villa.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {/* Location badge */}
        <div className="absolute top-4 left-4">
          <span className="font-body text-xs tracking-wide px-3 py-1.5 bg-background/90 backdrop-blur-sm text-foreground">
            {villa.location}
          </span>
        </div>
        {/* Price badge */}
        <div className="absolute bottom-4 right-4">
          <span className="font-body text-sm font-medium px-3 py-1.5 bg-primary text-primary-foreground">
            From ${villa.price_per_night?.toLocaleString()} / night
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-6">
        {/* Title row */}
        <div className="flex items-start justify-between gap-3">
          <Link to={`/villas/${villa.slug}`}>
            <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors duration-300 leading-tight">
              {villa.name}
            </h3>
          </Link>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star size={14} className="text-amber-500 fill-amber-500" />
            <span className="font-body text-sm text-foreground font-medium">{rating}</span>
            {reviewCount > 0 && (
              <span className="font-body text-xs text-muted-foreground">({reviewCount})</span>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 mt-2">
          <MapPin size={13} className="text-muted-foreground" />
          <span className="font-body text-sm text-muted-foreground">{villa.address_area || villa.location}, Bali</span>
        </div>

        {/* Description */}
        <p className="font-body text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-2">
          {villa.short_description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-foreground/70">
            <Bed size={15} />
            <span className="font-body text-sm">{villa.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-foreground/70">
            <Bath size={15} />
            <span className="font-body text-sm">{villa.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 text-foreground/70">
            <Users size={15} />
            <span className="font-body text-sm">Up to {villa.max_guests}</span>
          </div>
        </div>

        {/* Amenities */}
        {topAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {topAmenities.map(a => <AmenityBadge key={a} amenity={a} size="sm" />)}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-6">
          <Link
            to={`/villas/${villa.slug}`}
            className="w-full flex items-center justify-center gap-2 font-body text-sm tracking-wide py-3.5 px-5 rounded-full border border-foreground/15 text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-400 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.22)] hover:shadow-[0_16px_30px_-18px_rgba(0,0,0,0.28)]"
          >
            View Details
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
