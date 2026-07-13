import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.js';

export default function Gallery() {
  const navigate = useNavigate();

  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeIndex, setActiveIndex] = useState(null); // null = closed

  const isOpen = activeIndex !== null;

  const fetchGallery = useCallback(() => {
    setLoading(true);
    setLoadError('');

    api
      .get('/gallery')
      .then((res) => {
        const images = (res.data.images || []).map((img, i) => ({
          src: img.imageUrl,
          alt: img.caption || `Book donation photo ${i + 1}`,
        }));
        setGalleryImages(images);
      })
      .catch(() => {
        setLoadError("Couldn't load the gallery. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  const openAt = (index) => setActiveIndex(index);
  const close = () => setActiveIndex(null);

  const showPrev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? galleryImages.length - 1 : i - 1));
  }, [galleryImages.length]);

  const showNext = useCallback(() => {
    setActiveIndex((i) => (i === galleryImages.length - 1 ? 0 : i + 1));
  }, [galleryImages.length]);

  // Keyboard support: Escape to close, arrow keys to navigate
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showPrev, showNext]);

  // Lock background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Standalone page bar -- no shared Header/Footer here, just Back */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[#344256] font-semibold hover:text-[#F4882A] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-[#F4882A] font-heading text-sm font-semibold uppercase tracking-wide">nIP - National integration programme</p>
        <h1 className="font-heading text-2xl md:text-4xl font-bold text-[#344256] mt-2">
          One Book donation for One year studies
        </h1>
        <div className="w-20 h-0.5 bg-[#F4882A] my-6" />

        {loadError ? (
          <div className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            <span>{loadError}</span>
            <button
              type="button"
              onClick={fetchGallery}
              className="text-xs font-semibold uppercase tracking-wide text-red-700 hover:text-red-900 shrink-0"
            >
              Retry
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-full h-48 rounded bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : galleryImages.length === 0 ? (
          <p className="text-sm text-gray-500">No photos have been added yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => openAt(i)}
                className="block overflow-hidden rounded shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ---- Lightbox Modal ---- */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center px-4"
          onClick={close}
        >
          {/* Close button */}
          <button
            onClick={close}
            aria-label="Close"
            className="absolute top-5 right-5 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Prev arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
            aria-label="Previous image"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Image + counter */}
          <div
            className="max-w-4xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[activeIndex].src}
              alt={galleryImages[activeIndex].alt}
              className="max-h-[80vh] w-auto max-w-full object-contain rounded shadow-2xl"
            />
            <p className="text-white/70 text-sm mt-4">
              {activeIndex + 1} / {galleryImages.length}
            </p>
          </div>

          {/* Next arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); showNext(); }}
            aria-label="Next image"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}