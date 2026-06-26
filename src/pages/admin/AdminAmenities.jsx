import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Sparkles,
  Loader2,
  Check,
  Plus,
  Trash2,
  HelpCircle,
} from 'lucide-react';
import { localClient } from '@/api/localClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const AMENITY_CATEGORIES = {
  General: [
    'Fast Wi-Fi',
    'Air Conditioning',
    'Daily Housekeeping',
    'Safety Deposit Box',
    'Smart TV',
    'Workstation',
  ],
  'Outdoor & Wellness': [
    'Private Pool',
    'Rice Field View',
    'Ocean View',
    'Jungle View',
    'Sunset Deck',
    'Yoga Deck',
    'Outdoor Shower',
    'Tropical Garden',
  ],
  Services: [
    'Airport Transfer',
    'Private Chef',
    'Driver on Request',
    'Butler Service',
    'In-Villa Massage',
    'Breakfast Included',
    'Daily Turn-down Service',
  ],
  Family: [
    'Family Setup',
    'Baby Cot',
    'Near Beach',
    'Bike Rental',
    'Home Cinema',
    '24/7 Security',
  ],
};

import { useLocation } from 'react-router-dom';

export default function AdminAmenities() {
  const { toast } = useToast();
  const location = useLocation();
  const preselectedId = location.state?.villaId;
  const [selectedVillaId, setSelectedVillaId] = useState(preselectedId || null);
  const [customAmenity, setCustomAmenity] = useState('');
  // Local optimistic amenity state — avoids re-render scroll reset
  const [localAmenities, setLocalAmenities] = useState(null);
  const lastSyncedVillaId = useRef(null);

  // Fetch Villas
  const { data: villas = [], isLoading } = useQuery({
    queryKey: ['admin-villas-amenities'],
    queryFn: () => localClient.entities.VillaListing.list('name', 100),
    onSuccess: (data) => {
      if (data.length > 0 && !selectedVillaId) {
        setSelectedVillaId(preselectedId || data[0].id);
      }
    },
  });

  // Selected Villa Object
  const activeVillaId = selectedVillaId || (villas.length > 0 ? villas[0].id : null);
  const selectedVilla = villas.find((v) => v.id === activeVillaId);

  // Sync localAmenities when selected villa changes (not on every render)
  if (selectedVilla && selectedVilla.id !== lastSyncedVillaId.current) {
    lastSyncedVillaId.current = selectedVilla.id;
    setLocalAmenities(selectedVilla.amenities || []);
  }

  // Update Mutation — syncs to backend silently without touching React Query cache
  // This avoids any re-render cascade that resets the scroll position
  const updateMutation = useMutation({
    mutationFn: ({ id, amenities }) =>
      localClient.entities.VillaListing.update(id, { amenities }),
    onSuccess: () => {
      toast({
        title: 'Amenities Updated',
        description: 'Villa amenities have been successfully saved.',
      });
    },
    onError: (err, { amenities: failedAmenities }) => {
      // Rollback optimistic update on error
      setLocalAmenities(failedAmenities);
      toast({
        title: 'Update Failed',
        description: err.message,
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  // Use local optimistic state for rendering — falls back to villa data while loading
  const currentAmenities = localAmenities ?? selectedVilla?.amenities ?? [];

  const handleToggleAmenity = (amenity) => {
    if (!selectedVilla) return;
    let nextAmenities;
    if (currentAmenities.includes(amenity)) {
      nextAmenities = currentAmenities.filter((a) => a !== amenity);
    } else {
      nextAmenities = [...currentAmenities, amenity];
    }
    // Immediately update local state — no scroll reset, no re-render flash
    setLocalAmenities(nextAmenities);
    // Sync to backend in background
    updateMutation.mutate({ id: selectedVilla.id, amenities: nextAmenities });
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customAmenity.trim() || !selectedVilla) return;
    const cleanAmenity = customAmenity.trim();
    if (currentAmenities.includes(cleanAmenity)) {
      toast({
        title: 'Already exists',
        description: `"${cleanAmenity}" is already in this villa's amenities.`,
      });
      return;
    }
    const nextAmenities = [...currentAmenities, cleanAmenity];
    setLocalAmenities(nextAmenities);
    updateMutation.mutate({ id: selectedVilla.id, amenities: nextAmenities });
    setCustomAmenity('');
  };

  const handleRemoveCustom = (amenity) => {
    if (!selectedVilla) return;
    const nextAmenities = currentAmenities.filter((a) => a !== amenity);
    setLocalAmenities(nextAmenities);
    updateMutation.mutate({ id: selectedVilla.id, amenities: nextAmenities });
  };

  // Find amenities that aren't categorized in standard categories
  const allStandard = Object.values(AMENITY_CATEGORIES).flat();
  const customAmenities = currentAmenities.filter((a) => !allStandard.includes(a));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="text-amber-500" size={24} /> Amenities Manager
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Configure features, facilities, and welcome experiences for each villa
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Villas List */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Select Villa
          </h2>
          {villas.map((villa) => (
            <button
              key={villa.id}
              onClick={() => setSelectedVillaId(villa.id)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                activeVillaId === villa.id
                  ? 'bg-amber-600/10 border border-amber-500/30 text-white font-medium'
                  : 'border border-transparent text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {villa.name}
              <span className="block text-xs text-slate-500 font-normal mt-0.5">
                {villa.amenities?.length || 0} active amenities
              </span>
            </button>
          ))}
        </div>

        {/* Right Column: Amenities Checklist */}
        <div className="lg:col-span-3 space-y-6">
          {selectedVilla ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              {/* Active Villa Banner */}
              <div className="border-b border-slate-800 pb-5">
                <span className="text-amber-500 text-xs font-semibold uppercase tracking-wider">
                  Managing Amenities For:
                </span>
                <h2 className="text-white text-xl font-bold mt-0.5">{selectedVilla.name}</h2>
                <p className="text-slate-500 text-xs mt-1">
                  Location: {selectedVilla.location} | {selectedVilla.bedrooms} BR | {selectedVilla.bathrooms} BA
                </p>
              </div>

              {/* Grid of Standard Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(AMENITY_CATEGORIES).map(([category, items]) => (
                  <div key={category} className="space-y-3 bg-slate-950/40 p-4 border border-slate-800/40 rounded-xl">
                    <h3 className="text-white font-semibold text-sm tracking-wide border-b border-slate-800/60 pb-1.5">
                      {category}
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {items.map((item) => {
                        const isActive = currentAmenities.includes(item);
                        return (
                          <label
                            key={item}
                            className={`relative flex items-center gap-3 px-3 py-2 border rounded-lg cursor-pointer transition-all duration-200 select-none ${
                              isActive
                                ? 'bg-amber-600/5 border-amber-500/20 text-white'
                                : 'border-slate-800/60 text-slate-400 hover:text-slate-300 hover:bg-slate-800/20'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => handleToggleAmenity(item)}
                              className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              isActive ? 'bg-amber-600 border-amber-600' : 'border-slate-700 bg-slate-900'
                            }`}>
                              {isActive && <Check size={10} className="text-white font-bold" />}
                            </div>
                            <span className="text-sm">{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Amenities Section */}
              <div className="border-t border-slate-800 pt-6 space-y-4">
                <div>
                  <h3 className="text-white font-semibold text-sm">Custom Amenities</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Add specific amenities or features unique to this property
                  </p>
                </div>

                {customAmenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {customAmenities.map((amenity) => (
                      <span
                        key={amenity}
                        className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full"
                      >
                        {amenity}
                        <button
                          onClick={() => handleRemoveCustom(amenity)}
                          className="text-slate-500 hover:text-rose-400 p-0.5 rounded-full"
                        >
                          <Trash2 size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Add Custom Form */}
                <form onSubmit={handleAddCustom} className="flex gap-2 max-w-md">
                  <Input
                    value={customAmenity}
                    onChange={(e) => setCustomAmenity(e.target.value)}
                    placeholder="e.g. Floating breakfast tray, Smart toilets..."
                    className="bg-slate-950 border-slate-800 text-white text-sm"
                  />
                  <Button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5"
                  >
                    <Plus size={16} /> Add
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center text-slate-500">
              <HelpCircle className="mx-auto text-slate-700 mb-3" size={36} />
              No villa selected. Create a villa first to manage its amenities.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
