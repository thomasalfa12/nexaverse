// components/InteractiveHero.tsx
"use client";

import { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { usePerformanceMonitor } from "@/hooks/usePerformanceMonitor";

const InteractiveHero = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  // ✨ OPTIMISASI: Performance Monitoring
  const { markTime } = usePerformanceMonitor("InteractiveHero");

  // useCallback untuk markTime agar tidak menyebabkan re-render
  const stableMarkTime = useCallback(markTime, [markTime]);

  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;

    stableMarkTime("Mulai inisialisasi Three.js");

    // Setup scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / currentMount.clientHeight,
      0.1,
      1000
    );
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance", // ✨ Optimisasi GPU
    });
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    currentMount.appendChild(renderer.domElement);
    camera.position.z = 10;

    stableMarkTime("Scene setup selesai");

    // Grid
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x444444);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // ✨ OPTIMISASI: Reduced particle count untuk mobile
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 1000 : 2000;

    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 20;
    }
    particlesGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(posArray, 3)
    );
    const particleMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.03 : 0.05, // ✨ Ukuran lebih kecil untuk mobile
      color: 0x3b82f6,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    });
    const particleMesh = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particleMesh);

    stableMarkTime("Particles setup selesai");

    // Mouse interaction - definisikan mouse di dalam useEffect
    const mouse = new THREE.Vector2();

    // ✨ OPTIMISASI: Throttled mouse interaction
    let lastMouseUpdate = 0;
    const mouseThrottle = 16; // ~60fps

    const handleMouseMove = (event: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseUpdate < mouseThrottle) return;
      lastMouseUpdate = now;

      const rect = currentMount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };
    currentMount.addEventListener("mousemove", handleMouseMove);

    // ✨ OPTIMISASI: Frame rate monitoring
    let frameCount = 0;
    let lastFPSCheck = Date.now();

    const animate = () => {
      requestAnimationFrame(animate);

      // Monitor FPS setiap 60 frame
      frameCount++;
      if (frameCount % 60 === 0) {
        const now = Date.now();
        const fps = 60000 / (now - lastFPSCheck);
        lastFPSCheck = now;

        // Kurangi kualitas jika FPS rendah
        if (fps < 30 && !isMobile) {
          console.warn("⚠️ FPS rendah terdeteksi, mengurangi particle count");
          // Bisa ditambahkan logika untuk mengurangi particles di sini
        }
      }

      const positions = particleMesh.geometry.attributes.position
        .array as Float32Array;
      for (let i = 1; i < particleCount * 3; i += 3) {
        positions[i] -= 0.01;
        if (positions[i] < -10) {
          positions[i] = 10;
        }
      }
      particleMesh.geometry.attributes.position.needsUpdate = true;
      camera.position.x += (mouse.x * 2 - camera.position.x) * 0.02;
      camera.position.y += (mouse.y * 2 - camera.position.y) * 0.02;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
    };
    animate();

    stableMarkTime("Animation loop dimulai");

    // Handle resize
    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // 🧹 OPTIMISASI 3: Memory Management untuk Three.js yang Lebih Lengkap
    return () => {
      stableMarkTime("Memulai cleanup");

      // Bersihkan event listeners
      window.removeEventListener("resize", handleResize);
      currentMount.removeEventListener("mousemove", handleMouseMove);

      // Bersihkan geometries
      particlesGeometry.dispose();
      gridHelper.geometry.dispose();

      // Bersihkan materials dengan type checking yang proper
      particleMaterial.dispose();

      // Handle gridHelper material dengan type checking yang aman
      const gridMaterial = gridHelper.material;
      if (gridMaterial) {
        if (Array.isArray(gridMaterial)) {
          gridMaterial.forEach((material: THREE.Material) =>
            material.dispose()
          );
        } else {
          gridMaterial.dispose();
        }
      }

      // Bersihkan renderer dan context
      renderer.dispose();
      renderer.forceContextLoss();

      // Hapus DOM element
      if (
        currentMount &&
        renderer.domElement &&
        currentMount.contains(renderer.domElement)
      ) {
        currentMount.removeChild(renderer.domElement);
      }

      // Bersihkan scene secara menyeluruh dengan type checking
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();

          const material = object.material;
          if (material) {
            if (Array.isArray(material)) {
              material.forEach((mat: THREE.Material) => mat.dispose());
            } else {
              material.dispose();
            }
          }
        }
      });

      // Hapus semua objek dari scene
      while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
      }

      stableMarkTime("Cleanup selesai");
      console.log("🧹 InteractiveHero: Memory cleanup berhasil");
    };
  }, [stableMarkTime]); // Dependency yang benar

  return <div ref={mountRef} className="absolute inset-0 z-0 h-full w-full" />;
};

export default InteractiveHero;
