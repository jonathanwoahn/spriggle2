"use client";

import { FloatingBook } from "./floating-book";
import { Sparkles } from "./sparkles";
import { useEffect, useState } from "react";

interface HeroCanvasProps {
  width: number;
  height: number;
}

// Book configurations for desktop - main large book centered with smaller ones around it
const DESKTOP_BOOK_CONFIGS = [
  // Main large book (centered, prominent)
  { src: "/book_1.png", width: 320, height: 320, x: "70%", y: "50%", rotation: 5, depth: 1.0, floatDuration: 5, floatDelay: 0 },
  // Upper left of main book
  { src: "/book_2.png", width: 140, height: 140, x: "52%", y: "22%", rotation: -15, depth: 0.6, floatDuration: 4.5, floatDelay: 0.5 },
  // Upper right of main book
  { src: "/book_3.png", width: 130, height: 130, x: "88%", y: "25%", rotation: 18, depth: 0.55, floatDuration: 4, floatDelay: 1 },
  // Lower right of main book
  { src: "/book_4.png", width: 120, height: 120, x: "92%", y: "65%", rotation: -8, depth: 0.5, floatDuration: 4.2, floatDelay: 0.8 },
  // Lower left of main book
  { src: "/book_2.png", width: 110, height: 110, x: "50%", y: "72%", rotation: 12, depth: 0.45, floatDuration: 3.8, floatDelay: 1.2 },
  // Far background book (small)
  { src: "/book_3.png", width: 90, height: 90, x: "60%", y: "15%", rotation: -20, depth: 0.3, floatDuration: 4.5, floatDelay: 0.3 },
];

// Book configurations for mobile - books in upper portion above text
const MOBILE_BOOK_CONFIGS = [
  // Main large book (centered in upper area)
  { src: "/book_1.png", width: 200, height: 200, x: "50%", y: "25%", rotation: 5, depth: 1.0, floatDuration: 5, floatDelay: 0 },
  // Upper left
  { src: "/book_2.png", width: 100, height: 100, x: "15%", y: "18%", rotation: -15, depth: 0.6, floatDuration: 4.5, floatDelay: 0.5 },
  // Upper right
  { src: "/book_3.png", width: 95, height: 95, x: "85%", y: "15%", rotation: 18, depth: 0.55, floatDuration: 4, floatDelay: 1 },
  // Lower right of main
  { src: "/book_4.png", width: 85, height: 85, x: "80%", y: "38%", rotation: -8, depth: 0.5, floatDuration: 4.2, floatDelay: 0.8 },
  // Lower left of main
  { src: "/book_2.png", width: 80, height: 80, x: "20%", y: "40%", rotation: 12, depth: 0.45, floatDuration: 3.8, floatDelay: 1.2 },
];

export function HeroCanvas({ width, height }: HeroCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check for reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (!mounted) return null;

  // Responsive configurations
  const isMobile = width < 768;
  const sparkleCount = isMobile ? 50 : 100;
  const bookConfigs = isMobile ? MOBILE_BOOK_CONFIGS : DESKTOP_BOOK_CONFIGS;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* Sparkles layer */}
      {!prefersReducedMotion && <Sparkles count={sparkleCount} />}

      {/* Floating books */}
      {bookConfigs.map((config, index) => (
        <FloatingBook
          key={index}
          src={config.src}
          alt={`Flying book ${index + 1}`}
          width={config.width}
          height={config.height}
          x={config.x}
          y={config.y}
          rotation={prefersReducedMotion ? 0 : config.rotation}
          depth={config.depth}
          floatDuration={prefersReducedMotion ? 0 : config.floatDuration}
          floatDelay={config.floatDelay}
        />
      ))}
    </div>
  );
}

export default HeroCanvas;
