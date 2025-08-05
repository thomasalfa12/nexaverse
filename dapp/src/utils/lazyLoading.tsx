// utils/lazyLoading.ts
"use client";

// Interface untuk Connection API
interface NetworkInformation {
  effectiveType: string;
  saveData: boolean;
  downlink: number;
  rtt: number;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

// ✨ OPTIMISASI: Intersection Observer untuk lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: "50px",
    threshold: 0.1,
    ...options,
  });
};

// ✨ OPTIMISASI: Preload critical resources
export const preloadResource = (
  url: string,
  type: "script" | "style" | "image" | "font"
) => {
  if (typeof window === "undefined") return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.href = url;

  switch (type) {
    case "script":
      link.as = "script";
      break;
    case "style":
      link.as = "style";
      break;
    case "image":
      link.as = "image";
      break;
    case "font":
      link.as = "font";
      link.crossOrigin = "anonymous";
      break;
  }

  document.head.appendChild(link);
};

// ✨ OPTIMISASI: Dynamic import dengan error handling
export const lazyImport = async <T = unknown,>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  try {
    const startTime = performance.now();
    const importedModule = await importFn();
    const loadTime = performance.now() - startTime;

    console.log(`📦 Lazy import berhasil dalam ${loadTime.toFixed(2)}ms`);
    return importedModule;
  } catch (error) {
    console.error("❌ Gagal melakukan lazy import:", error);
    if (fallback) {
      console.log("🔄 Menggunakan fallback");
      return fallback;
    }
    throw error;
  }
};

// ✨ OPTIMISASI: Connection-aware loading
export const getConnectionInfo = () => {
  if (typeof window === "undefined" || !("navigator" in window)) {
    return { effectiveType: "4g", saveData: false, downlink: 10, rtt: 100 };
  }

  const navigatorWithConnection = navigator as NavigatorWithConnection;
  const connection =
    navigatorWithConnection.connection ||
    navigatorWithConnection.mozConnection ||
    navigatorWithConnection.webkitConnection;

  return {
    effectiveType: connection?.effectiveType || "4g",
    saveData: connection?.saveData || false,
    downlink: connection?.downlink || 10,
    rtt: connection?.rtt || 100,
  };
};

// ✨ OPTIMISASI: Adaptive loading berdasarkan koneksi
export const shouldLoadHighQuality = () => {
  const { effectiveType, saveData, downlink } = getConnectionInfo();

  // Jangan load quality tinggi jika:
  // - User mengaktifkan save data
  // - Koneksi lambat (2g, slow-2g)
  // - Bandwidth rendah
  if (
    saveData ||
    effectiveType === "2g" ||
    effectiveType === "slow-2g" ||
    downlink < 1.5
  ) {
    return false;
  }

  return true;
};

// ✨ OPTIMISASI: Prefetch dengan priority
export const prefetchRoute = (
  url: string,
  priority: "high" | "low" = "low"
) => {
  if (typeof window === "undefined") return;

  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = url;

  if (priority === "high") {
    link.setAttribute("importance", "high");
  }

  document.head.appendChild(link);

  console.log(`🚀 Prefetching route: ${url} (priority: ${priority})`);
};

// ✨ OPTIMISASI: Preload dengan timeout
export const preloadWithTimeout = (
  url: string,
  timeout: number = 5000
): Promise<boolean> => {
  return new Promise((resolve) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.href = url;
    link.as = "script";

    const timeoutId = setTimeout(() => {
      console.warn(`⏰ Preload timeout untuk: ${url}`);
      resolve(false);
    }, timeout);

    link.onload = () => {
      clearTimeout(timeoutId);
      console.log(`✅ Preload berhasil: ${url}`);
      resolve(true);
    };

    link.onerror = () => {
      clearTimeout(timeoutId);
      console.error(`❌ Preload gagal: ${url}`);
      resolve(false);
    };

    document.head.appendChild(link);
  });
};
