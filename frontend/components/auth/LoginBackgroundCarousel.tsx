'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useConfigurationStore } from '@/store/configurationStore';

export function LoginBackgroundCarousel() {
  const { config } = useConfigurationStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const backgrounds = config?.loginBackgrounds || [];
  const hasBackgrounds = backgrounds.length > 0;

  useEffect(() => {
    if (!hasBackgrounds || backgrounds.length <= 1) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % backgrounds.length);
        setIsTransitioning(false);
      }, 800); // Half of transition duration for smooth crossfade
    }, 8000); // Change background every 8 seconds

    return () => clearInterval(interval);
  }, [hasBackgrounds, backgrounds.length]);

  if (!hasBackgrounds) {
    // Default gradient background - optimizado
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background Images with reduced blur for better performance */}
      {backgrounds.map((bg, index) => (
        <div
          key={bg}
          className={`absolute inset-0 transition-opacity duration-[1600ms] ease-in-out ${
            index === currentIndex && !isTransitioning
              ? 'opacity-100'
              : 'opacity-0'
          }`}
        >
          <Image
            src={bg}
            alt={`Background ${index + 1}`}
            fill
            priority={index === 0}
            quality={90}
            className="object-cover blur-[2px] scale-[1.02]"
            unoptimized
          />
        </div>
      ))}

      {/* Optimized overlay for better legibility */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-slate-900/50 to-indigo-900/60" />
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.25)_100%)]" />

      {/* Carousel indicators - hidden on mobile */}
      {backgrounds.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden md:flex gap-1.5 z-10">
          {backgrounds.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(index);
                  setIsTransitioning(false);
                }, 400);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-6 bg-white shadow-lg'
                  : 'w-1.5 bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
