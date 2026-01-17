"use client";

import { Box } from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { HeroContent } from "./hero-content";
import { HeroCanvas } from "./hero-canvas";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Track container dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <Box
      ref={containerRef}
      sx={{
        background: "linear-gradient(135deg, #9966FF 0%, #FF8866 100%)",
        position: "relative",
        overflow: "hidden",
        minHeight: { xs: "100vh", md: "70vh" },
        display: "flex",
        alignItems: "center",
      }}
    >
      {/* Animated books and sparkles */}
      {isClient && dimensions.width > 0 && (
        <HeroCanvas width={dimensions.width} height={dimensions.height} />
      )}

      {/* Text Content Overlay */}
      <HeroContent />
    </Box>
  );
}

export default Hero;
