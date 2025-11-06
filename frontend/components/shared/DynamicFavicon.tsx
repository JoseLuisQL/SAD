'use client';

import { useEffect, useState, useRef } from 'react';
import { useConfigurationStore } from '@/store/configurationStore';

export function DynamicFavicon() {
  const { config, fetchConfig } = useConfigurationStore();
  const [isMounted, setIsMounted] = useState(false);
  const isUpdatingRef = useRef(false);
  const createdLinksRef = useRef<HTMLLinkElement[]>([]);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      setIsMounted(false);
    };
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

    // Prevent concurrent updates
    if (isUpdatingRef.current) {
      return;
    }

    isUpdatingRef.current = true;

    try {
      // Always use the API route for favicon, which will return dynamic or default
      const timestamp = new Date().getTime();
      const faviconApiUrl = `/api/favicon?v=${timestamp}`;

      // Safely remove all existing favicon links
      const existingLinks = document.querySelectorAll("link[rel*='icon']");
      existingLinks.forEach(el => {
        try {
          // Triple check: element exists, has parent, and parent is still in DOM
          if (el && el.parentNode && document.contains(el.parentNode)) {
            el.parentNode.removeChild(el);
          }
        } catch (removeError) {
          // Silently ignore removal errors (element may have been removed already)
          console.debug('Favicon removal skipped:', removeError);
        }
      });

      // Clear previous references
      createdLinksRef.current = [];

      // Create multiple favicon links for better browser compatibility
      const sizes = ['16x16', '32x32', '48x48'];

      sizes.forEach(size => {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.sizes = size;
        link.href = faviconApiUrl;
        link.dataset.dynamicFavicon = 'true'; // Mark as dynamically created

        if (document.head && isMounted) {
          document.head.appendChild(link);
          createdLinksRef.current.push(link);
        }
      });

      // Add shortcut icon for older browsers
      const shortcutLink = document.createElement('link');
      shortcutLink.rel = 'shortcut icon';
      shortcutLink.type = 'image/x-icon';
      shortcutLink.href = faviconApiUrl;
      shortcutLink.dataset.dynamicFavicon = 'true';

      if (document.head && isMounted) {
        document.head.appendChild(shortcutLink);
        createdLinksRef.current.push(shortcutLink);
      }

      // Add apple-touch-icon for iOS devices
      const appleTouchIcon = document.createElement('link');
      appleTouchIcon.rel = 'apple-touch-icon';
      appleTouchIcon.href = faviconApiUrl;
      appleTouchIcon.dataset.dynamicFavicon = 'true';

      if (document.head && isMounted) {
        document.head.appendChild(appleTouchIcon);
        createdLinksRef.current.push(appleTouchIcon);
      }
    } catch (error) {
      console.error('Error updating favicon:', error);
    } finally {
      // Reset the updating flag after a short delay to prevent rapid re-renders
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 100);
    }

    // Cleanup function to remove created links when component unmounts
    return () => {
      createdLinksRef.current.forEach(link => {
        try {
          if (link && link.parentNode && document.contains(link.parentNode)) {
            link.parentNode.removeChild(link);
          }
        } catch (cleanupError) {
          // Silently ignore cleanup errors
          console.debug('Favicon cleanup skipped:', cleanupError);
        }
      });
      createdLinksRef.current = [];
    };
  }, [isMounted, config?.faviconUrl]);

  return null; // This component doesn't render anything
}
