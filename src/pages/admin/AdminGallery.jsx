import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  Upload,
  HelpCircle,
} from 'lucide-react';
import { localClient } from '@/api/localClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

import { useLocation } from 'react-router-dom';

export default function AdminGallery() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const location = useLocation();
  const preselectedId = location.state?.villaId;
  const [selectedVillaId, setSelectedVillaId] = useState(preselectedId || null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch Villas
  const { data: villas = [], isLoading } = useQuery({
    queryKey: ['admin-villas-gallery'],
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

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, image_urls }) =>
      localClient.entities.VillaListing.update(id, { image_urls }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-villas-gallery'] });
      toast({
        title: 'Gallery Updated',
        description: 'Villa photos updated successfully.',
      });
    },
    onError: (err) => {
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

  const currentImages = selectedVilla?.image_urls || [];

  const handleSaveImages = (newImages) => {
    if (!selectedVilla) return;
    updateMutation.mutate({ id: selectedVilla.id, image_urls: newImages });
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    const cleanUrl = imageUrl.trim();
    if (currentImages.includes(cleanUrl)) {
      toast({
        title: 'Duplicate URL',
        description: 'This image is already in the gallery.',
      });
      return;
    }
    handleSaveImages([...currentImages, cleanUrl]);
    setImageUrl('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await localClient.integrations.Core.UploadFile({ file });
      if (response?.file_url) {
        handleSaveImages([...currentImages, response.file_url]);
        toast({
          title: 'Upload Successful',
          description: 'Photo has been added to the gallery.',
        });
      }
    } catch (err) {
      toast({
        title: 'Upload Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = (indexToDelete) => {
    if (!confirm('Are you sure you want to remove this photo?')) return;
    const nextImages = currentImages.filter((_, idx) => idx !== indexToDelete);
    handleSaveImages(nextImages);
  };

  const handleMakePrimary = (index) => {
    if (index === 0) return;
    const nextImages = [...currentImages];
    const [target] = nextImages.splice(index, 1);
    nextImages.unshift(target);
    handleSaveImages(nextImages);
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentImages.length) return;
    const nextImages = [...currentImages];
    const temp = nextImages[index];
    nextImages[index] = nextImages[targetIndex];
    nextImages[targetIndex] = temp;
    handleSaveImages(nextImages);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ImageIcon className="text-amber-500" size={24} /> Gallery Manager
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Organize, upload, and reorder photos displaying on the guest booking catalog
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
                {villa.image_urls?.length || 0} photos
              </span>
            </button>
          ))}
        </div>

        {/* Right Column: Gallery Dashboard */}
        <div className="lg:col-span-3 space-y-6">
          {selectedVilla ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
              {/* Selected Villa Info */}
              <div className="border-b border-slate-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-amber-500 text-xs font-semibold uppercase tracking-wider">
                    Managing Portfolio For:
                  </span>
                  <h2 className="text-white text-xl font-bold mt-0.5">{selectedVilla.name}</h2>
                  <p className="text-slate-500 text-xs mt-1">
                    Base Rate: ${selectedVilla.price_per_night?.toLocaleString()}/night
                  </p>
                </div>

                {/* Upload Action Form */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 bg-slate-950 border border-slate-850 hover:bg-slate-800 text-slate-300 text-sm px-4 py-2 rounded-lg cursor-pointer transition">
                    {uploading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Upload size={16} />
                    )}
                    Upload Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Paste Image URL Form */}
              <form onSubmit={handleAddUrl} className="flex gap-2 bg-slate-950/60 p-4 border border-slate-850 rounded-xl">
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste direct image URL here..."
                  className="bg-slate-950 border-slate-800 text-white text-sm"
                />
                <Button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shrink-0"
                >
                  <Plus size={16} /> Add URL
                </Button>
              </form>

              {/* Photos Grid */}
              {currentImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {currentImages.map((url, index) => {
                    const isPrimary = index === 0;
                    return (
                      <div
                        key={`${url}-${index}`}
                        className={`relative group bg-slate-950 border rounded-xl overflow-hidden flex flex-col justify-between transition duration-200 ${
                          isPrimary ? 'border-amber-500/50' : 'border-slate-800'
                        }`}
                      >
                        {/* Image Preview */}
                        <div className="aspect-[4/3] w-full overflow-hidden bg-slate-900 relative">
                          <img
                            src={url}
                            alt={`${selectedVilla.name} portfolio - ${index + 1}`}
                            className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          {isPrimary && (
                            <span className="absolute top-2 left-2 bg-amber-500 text-black font-semibold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                              <Star size={10} fill="currentColor" /> Primary
                            </span>
                          )}
                          <span className="absolute bottom-2 right-2 bg-black/70 text-slate-300 text-xs px-2 py-0.5 rounded">
                            #{index + 1}
                          </span>
                        </div>

                        {/* Controls Panel */}
                        <div className="p-3 bg-slate-950 flex items-center justify-between border-t border-slate-900">
                          {/* Reordering */}
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={index === 0}
                              onClick={() => handleMove(index, -1)}
                              className="w-8 h-8 text-slate-400 hover:text-white p-0 hover:bg-slate-800/40"
                            >
                              <ChevronLeft size={16} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={index === currentImages.length - 1}
                              onClick={() => handleMove(index, 1)}
                              className="w-8 h-8 text-slate-400 hover:text-white p-0 hover:bg-slate-800/40"
                            >
                              <ChevronRight size={16} />
                            </Button>
                          </div>

                          {/* Featured & Delete Actions */}
                          <div className="flex items-center gap-1.5">
                            {!isPrimary && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMakePrimary(index)}
                                className="text-amber-500 hover:text-amber-400 px-2 py-1 h-8 text-xs font-medium flex items-center gap-1"
                              >
                                <Star size={12} /> Set Primary
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteImage(index)}
                              className="w-8 h-8 text-slate-500 hover:text-rose-400 p-0 hover:bg-slate-800/40"
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-950/40 border border-dashed border-slate-800 rounded-xl text-slate-500 space-y-2">
                  <ImageIcon className="mx-auto text-slate-700 mb-2" size={32} />
                  <p className="text-sm">No photos uploaded for this villa yet.</p>
                  <p className="text-xs text-slate-650">Paste a URL or upload a file above to add images.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center text-slate-500">
              <HelpCircle className="mx-auto text-slate-700 mb-3" size={36} />
              No villa selected. Create a villa first to manage its gallery.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
