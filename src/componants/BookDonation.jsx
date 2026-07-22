import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios.js';
import { Link } from 'react-router-dom';

export default function BookDonation() {
  const [galleryImages, setGalleryImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(null); // null = closed

  const isOpen = activeIndex !== null;

  useEffect(() => {
    let isMounted = true;

    api
      .get('/gallery')
      .then((res) => {
        if (!isMounted) return;
        const images = (res.data.images || []).map((img, i) => ({
          // GalleryImage stores the URL as `imageUrl` and any description as `caption`.
          src: img.imageUrl,
          alt: img.caption || `Book donation photo ${i + 1}`,
        }));
        setGalleryImages(images);
      })
      .catch(() => {
        // Public page -- fail quietly rather than showing an error card.
        if (isMounted) setGalleryImages([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

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

  // Nothing to show yet and nothing loading -- don't render an empty section.
  if (!loading && galleryImages.length === 0) return null;

  return (
    <section id="books" className="bg-[#F5F5F5] py-16">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-[#F4882A] font-heading text-sm font-semibold uppercase tracking-wide">nIP - National integration programme</p>
        <h2 className="font-heading text-2xl md:text-4xl font-bold text-[#344256] mt-2">
          One Book help for One year studies
        </h2>
        <div className="w-20 h-0.5 bg-[#F4882A] my-6" />

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-full h-48 rounded bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
         <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
  {galleryImages.slice(0, 9).map((img, i) => (
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
        {galleryImages.length > 9 && (
  <div className="flex justify-center mt-8">
    <Link
      to="/gallery"
      className="group inline-flex items-center gap-2 bg-[#F4882A] text-white px-6 py-2 rounded-full font-semibold shadow-md hover:bg-[#e67a17] hover:shadow-lg transition-all duration-300"
    >
      <span>View More</span>

      <svg
        className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 12h14m-5-5 5 5-5 5"
        />
      </svg>
    </Link>
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
    </section>
  );
}