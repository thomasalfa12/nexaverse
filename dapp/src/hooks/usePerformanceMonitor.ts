"use client";

import { useEffect, useRef } from "react";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  componentName: string;
}

// Interface untuk gtag global
interface GtagWindow extends Window {
  gtag?: (
    command: string,
    action: string,
    parameters: Record<string, string | number>
  ) => void;
}

export const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef<number>(Date.now());
  const mountTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Catat waktu mount
    mountTimeRef.current = Date.now();
    const loadTime = mountTimeRef.current - startTimeRef.current;

    // Catat waktu render setelah paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const paintEntries = entries.filter(entry => 
        entry.name === 'first-contentful-paint' || 
        entry.name === 'largest-contentful-paint'
      );

      if (paintEntries.length > 0) {
        const renderTime = Date.now() - (mountTimeRef.current || 0);
        
        const metrics: PerformanceMetrics = {
          loadTime,
          renderTime,
          componentName,
        };

        console.log(`🔥 Performance [${componentName}]:`, {
          ...metrics,
          loadTime: `${loadTime}ms`,
          renderTime: `${renderTime}ms`,
        });

        // Kirim ke analytics jika diperlukan dengan type safety
        const gtagWindow = window as GtagWindow;
        if (typeof window !== 'undefined' && gtagWindow.gtag) {
          gtagWindow.gtag('event', 'component_performance', {
            component_name: componentName,
            load_time: loadTime,
            render_time: renderTime,
          });
        }
      }
    });

    try {
      observer.observe({ entryTypes: ['paint'] });
    } catch (error) {
      console.warn('PerformanceObserver tidak didukung:', error);
    }

    return () => {
      observer.disconnect();
    };
  }, [componentName]);

  // Return utilities untuk debugging
  return {
    markTime: (label: string) => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTimeRef.current;
      console.log(`⏱️ ${componentName} - ${label}: ${elapsedTime}ms`);
    },
    getLoadTime: () => {
      return mountTimeRef.current ? mountTimeRef.current - startTimeRef.current : 0;
    }
  };
};