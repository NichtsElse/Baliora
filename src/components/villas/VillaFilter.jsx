import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const LOCATIONS = ['All Locations', 'Canggu', 'Seminyak', 'Uluwatu', 'Ubud', 'Sanur', 'Nusa Dua'];
const BEDROOM_OPTIONS = ['Any', '1', '2', '3', '4', '5+'];
const AMENITY_FILTERS = [
  'Private Pool', 'Private Chef', 'Breakfast Included', 'Ocean View',
  'Rice Field View', 'Family Friendly', 'Honeymoon Setup', 'Events Allowed',
];

export default function VillaFilter({ filters, onChange, totalCount }) {
  const [showFilters, setShowFilters] = useState(false);

  const handleLocation = (val) => onChange({ ...filters, location: val === 'All Locations' ? '' : val });
  const handleBedrooms = (val) => onChange({ ...filters, bedrooms: val === 'Any' ? '' : val });
  const handlePriceRange = (val) => onChange({ ...filters, maxPrice: val[0] });
  const handleAmenity = (amenity) => {
    const current = filters.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter(a => a !== amenity)
      : [...current, amenity];
    onChange({ ...filters, amenities: updated });
  };
  const clearAll = () => onChange({ location: '', bedrooms: '', maxPrice: 2000, amenities: [] });

  const activeCount = [
    filters.location,
    filters.bedrooms,
    filters.maxPrice < 2000 ? '1' : '',
    ...(filters.amenities || []),
  ].filter(Boolean).length;

  return (
    <div className="border-b border-border bg-background sticky top-20 z-30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 font-body text-sm px-4 py-2 rounded-full border transition-all duration-300 ${
                showFilters ? 'border-primary text-primary bg-primary/5' : 'border-border text-foreground hover:border-primary/50'
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeCount > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full">
                  {activeCount}
                </span>
              )}
              <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Quick location pills */}
            <div className="hidden md:flex items-center gap-2 overflow-x-auto">
              {LOCATIONS.map(loc => (
                <button
                  key={loc}
                  onClick={() => handleLocation(loc)}
                  className={`flex-shrink-0 font-body text-xs px-3 py-1.5 rounded-full border transition-all duration-300 ${
                    (filters.location === loc) || (loc === 'All Locations' && !filters.location)
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1.5 font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={13} /> Clear
              </button>
            )}
            <span className="font-body text-sm text-muted-foreground">
              {totalCount} {totalCount === 1 ? 'villa' : 'villas'}
            </span>
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="pb-6 border-t border-border pt-5 space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bedrooms */}
              <div>
                <p className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Bedrooms</p>
                <div className="flex flex-wrap gap-2">
                  {BEDROOM_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleBedrooms(opt)}
                      className={`font-body text-sm px-4 py-2 rounded-full border transition-all ${
                        (filters.bedrooms === opt) || (opt === 'Any' && !filters.bedrooms)
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-border text-foreground hover:border-primary/40'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <p className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">
                  Max Price / Night: <span className="text-foreground">${filters.maxPrice?.toLocaleString()}</span>
                </p>
                <Slider
                  value={[filters.maxPrice || 2000]}
                  min={100}
                  max={2000}
                  step={50}
                  onValueChange={handlePriceRange}
                  className="w-full"
                />
                <div className="flex justify-between mt-1">
                  <span className="font-body text-xs text-muted-foreground">$100</span>
                  <span className="font-body text-xs text-muted-foreground">$2,000+</span>
                </div>
              </div>

              {/* Mobile location */}
              <div className="md:hidden">
                <p className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Location</p>
                <Select value={filters.location || 'All Locations'} onValueChange={handleLocation}>
                  <SelectTrigger className="border-border font-body text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amenities */}
            <div>
              <p className="font-body text-xs tracking-[0.15em] uppercase text-muted-foreground mb-3">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {AMENITY_FILTERS.map(amenity => {
                  const active = (filters.amenities || []).includes(amenity);
                  return (
                    <button
                      key={amenity}
                      onClick={() => handleAmenity(amenity)}
                      className={`font-body text-sm px-4 py-2 rounded-full border transition-all ${
                        active
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-border text-foreground hover:border-primary/40'
                      }`}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
