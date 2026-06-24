import React from 'react';
import {
  Waves, ChefHat, Coffee, Eye, Leaf, Baby,
  Heart, PartyPopper, Wifi, Car, Wind, Dumbbell,
  Tv, Flame, Bath, Sparkles
} from 'lucide-react';

const AMENITY_CONFIG = {
  'Private Pool': { icon: Waves, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
  'Private Chef': { icon: ChefHat, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-100' },
  'Breakfast Included': { icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  'Ocean View': { icon: Eye, color: 'text-sky-600', bg: 'bg-sky-50 border-sky-100' },
  'Rice Field View': { icon: Leaf, color: 'text-green-600', bg: 'bg-green-50 border-green-100' },
  'Family Friendly': { icon: Baby, color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
  'Honeymoon Setup': { icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-100' },
  'Events Allowed': { icon: PartyPopper, color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100' },
  'Free WiFi': { icon: Wifi, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
  'Free Parking': { icon: Car, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
  'Air Conditioning': { icon: Wind, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100' },
  'Gym': { icon: Dumbbell, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-100' },
  'Smart TV': { icon: Tv, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200' },
  'BBQ': { icon: Flame, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
  'Outdoor Bathtub': { icon: Bath, color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100' },
  'Daily Housekeeping': { icon: Sparkles, color: 'text-primary', bg: 'bg-primary/5 border-primary/10' },
};

export default function AmenityBadge({ amenity, size = 'md' }) {
  const config = AMENITY_CONFIG[amenity] || { icon: Sparkles, color: 'text-foreground/60', bg: 'bg-secondary border-border' };
  const Icon = config.icon;

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 border text-xs font-body ${config.bg} ${config.color}`}>
        <Icon size={11} />
        {amenity}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1.5 border text-sm font-body ${config.bg} ${config.color}`}>
      <Icon size={14} />
      {amenity}
    </span>
  );
}