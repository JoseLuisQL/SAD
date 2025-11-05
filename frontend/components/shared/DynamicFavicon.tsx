'use client';

import { useEffect, useState } from 'react';
import { useConfigurationStore } from '@/store/configurationStore';

export function DynamicFavicon() {
  const { config, fetchConfig } = useConfigurationStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Fetch configuration on mount if not already loaded
    if (!config) {
      fetchConfig();
    }
  }, [config, fetchConfig]);

  useEffect(() => {
    // Only run on client side after component is mounted
    if (!isMounted || typeof window === 'undefined') return;

    try {
      // Always use the API route for favicon, which will return dynamic or default
      const timestamp = new Date().getTime();
      const faviconApiUrl = `/api/favicon?v=${timestamp}`;

      // Remove all existing favicon links first safely
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });

      // Create multiple favicon links for better browser compatibility
      const sizes = ['16x16', '32x32', '48x48'];
      
      sizes.forEach(size => {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.sizes = size;
        link.href = faviconApiUrl;
        if (document.head) {
          document.head.appendChild(link);
        }
      });

      // Add shortcut icon for older browsers
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.type = 'image/x-icon';
      shortcutLink.href = faviconApiUrl;
      if (document.head) {
        document.head.appendChild(shortcutLink);
      }

      // Add apple-touch-icon for iOS devices
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = faviconApiUrl;
      if (document.head) {
        document.head.appendChild(appleTouchIcon);
      }
    } catch (error) {
      console.error('Error updating favicon:', error);
    }

  }, [isMounted, config?.faviconUrl]);

  return null; // This component doesn't render anything
}
