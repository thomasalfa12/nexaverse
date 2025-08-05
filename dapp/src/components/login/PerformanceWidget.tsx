// components/PerformanceWidget.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Eye, EyeOff } from "lucide-react";

interface PerformanceData {
  fps: number;
  memoryUsage: number;
  renderTime: number;
  loadTime: number;
}

// Interface untuk memory performance API
interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface ExtendedPerformance extends Performance {
  memory?: MemoryInfo;
}

const PerformanceWidget = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    fps: 0,
    memoryUsage: 0,
    renderTime: 0,
    loadTime: 0,
  });

  useEffect(() => {
    if (!isVisible) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const updateMetrics = () => {
      const currentTime = performance.now();
      frameCount++;

      // Hitung FPS setiap detik
      if (currentTime - lastTime >= 1000) {
        const fps = (frameCount * 1000) / (currentTime - lastTime);

        // Dapatkan memory usage dengan type safety
        const extendedPerformance = performance as ExtendedPerformance;
        const memoryInfo = extendedPerformance.memory;
        const memoryUsage = memoryInfo
          ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024)
          : 0;

        setPerformanceData((prev) => ({
          ...prev,
          fps: Math.round(fps),
          memoryUsage,
          renderTime: Math.round(currentTime - lastTime),
        }));

        frameCount = 0;
        lastTime = currentTime;
      }

      animationId = requestAnimationFrame(updateMetrics);
    };

    updateMetrics();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible]);

  // Hanya tampilkan di development mode
  if (
    process.env.NODE_ENV === "production" &&
    !window.location.search.includes("debug=true")
  ) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(!isVisible)}
        className="mb-2 bg-black/80 text-white border-gray-600 hover:bg-gray-800"
      >
        {isVisible ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        <Activity className="h-4 w-4 ml-1" />
      </Button>

      {isVisible && (
        <Card className="w-64 bg-black/90 text-white border-gray-600 backdrop-blur-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Performance Monitor
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2 text-xs">
            <div className="flex justify-between">
              <span>FPS:</span>
              <span
                className={`font-mono ${
                  performanceData.fps < 30
                    ? "text-red-400"
                    : performanceData.fps < 50
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {performanceData.fps}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Memory:</span>
              <span
                className={`font-mono ${
                  performanceData.memoryUsage > 100
                    ? "text-red-400"
                    : performanceData.memoryUsage > 50
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {performanceData.memoryUsage}MB
              </span>
            </div>

            <div className="flex justify-between">
              <span>Render:</span>
              <span className="font-mono text-blue-400">
                {performanceData.renderTime}ms
              </span>
            </div>

            <div className="h-px bg-gray-600 my-2" />

            <div className="text-xs text-gray-400">
              • FPS:{" "}
              {performanceData.fps >= 50
                ? "✅ Optimal"
                : performanceData.fps >= 30
                ? "⚠️ Moderate"
                : "❌ Poor"}
            </div>
            <div className="text-xs text-gray-400">
              • Memory:{" "}
              {performanceData.memoryUsage <= 50
                ? "✅ Good"
                : performanceData.memoryUsage <= 100
                ? "⚠️ High"
                : "❌ Critical"}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PerformanceWidget;
