import { useEffect, useState } from 'react';
import api from '../api/axios.js';

export default function Banner() {
  const [bannerUrl, setBannerUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;

    api
      .get('/banner')
      .then((res) => {
        if (isMounted) setBannerUrl(res.data.banner?.imageUrl || null);
      })
      .catch(() => {
        // The banner is decorative -- if the fetch fails for any reason we
        // just keep the default solid background instead of showing an error.
        if (isMounted) setBannerUrl(null);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section
      id="top"
      className="relative bg-[#344256] text-white pt-20 pb-12 text-center bg-cover bg-center"
      style={bannerUrl ? { backgroundImage: `url(${bannerUrl})` } : undefined}
    >
      {/* Overlay keeps the text readable over any banner image, without
          changing the look when no banner is set (bg-[#344256] alone shows). */}
      {bannerUrl && <div className="absolute inset-0 bg-[#344256]/70" />}

      <div className="relative max-w-5xl mx-auto px-4 py-25">
        <h1 className="font-heading text-3xl md:text-5xl font-bold">NIP (National Integration Programme)</h1>
        <p className="font-heading text-xl md:text-2xl mt-4">Bharatiya Samata Hindi Prachar Parishad</p>
        <div className="w-24 h-0.5 bg-[#F4882A] mx-auto mt-6" />
      </div>
    </section>
  );
}