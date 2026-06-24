import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Grid3X3, Maximize2 } from 'lucide-react';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=1200&q=85',
  'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=85',
  'https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1200&q=85',
  'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=85',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=85',
];

export default function VillaGallery({ images, villaName }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const galleryImages = images?.length ? images : PLACEHOLDER_IMAGES;
  const displayImages = galleryImages.slice(0, 5);

  const openLightbox = (idx) => {
    setActiveIndex(idx);
    setLightboxOpen(true);
  };

  const prev = () => setActiveIndex(i => (i - 1 + galleryImages.length) % galleryImages.length);
  const next = () => setActiveIndex(i => (i + 1) % galleryImages.length);

  const handleKey = (e) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape') setLightboxOpen(false);
  };

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[420px] lg:h-[540px]" onKeyDown={handleKey} tabIndex={0}>
        {/* Main large image */}
        <div
          className="col-span-4 lg:col-span-2 row-span-2 relative overflow-hidden cursor-pointer group"
          onClick={() => openLightbox(0)}
        >
          <img
            src={displayImages[0]}
            alt={`${villaName} main`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Maximize2 size={24} className="text-white drop-shadow-lg" />
          </div>
        </div>

        {/* 4 smaller images */}
        {displayImages.slice(1, 5).map((img, idx) => (
          <div
            key={idx}
            className="col-span-2 lg:col-span-1 relative overflow-hidden cursor-pointer group"
            onClick={() => openLightbox(idx + 1)}
          >
            <img
              src={img}
              alt={`${villaName} ${idx + 2}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-all duration-300" />
            {idx === 3 && galleryImages.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Grid3X3 size={20} className="mx-auto mb-1" />
                  <span className="font-body text-sm">+{galleryImages.length - 5} more</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* View All button */}
      <button
        onClick={() => openLightbox(0)}
        className="mt-3 flex items-center gap-2 rounded-full font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Grid3X3 size={15} />
        View all {galleryImages.length} photos
      </button>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 rounded-full text-white/70 hover:text-white p-2"
            >
              <X size={28} />
            </button>

            <span className="absolute top-5 left-1/2 -translate-x-1/2 font-body text-sm text-white/50">
              {activeIndex + 1} / {galleryImages.length}
            </span>

            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 rounded-full text-white/60 hover:text-white p-3 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={32} />
            </button>

            <motion.img
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              src={galleryImages[activeIndex]}
              alt={`${villaName} ${activeIndex + 1}`}
              className="max-w-[90vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 rounded-full text-white/60 hover:text-white p-3 hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={32} />
            </button>

            {/* Thumbnails */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-4">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(idx); }}
                  className={`flex-shrink-0 w-14 h-10 overflow-hidden rounded-lg transition-all ${
                    idx === activeIndex ? 'ring-2 ring-primary opacity-100' : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
