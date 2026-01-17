"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useMemo, useEffect, useState, useCallback } from "react";

interface SparklesProps {
  count?: number;
}

interface Sparkle {
  id: number;
  x: number; // percentage
  y: number; // percentage
  size: number;
  delay: number;
  duration: number;
  color: string;
}

const SPARKLE_COLORS = [
  "#FFEB66", // Yellow
  "#FFD700", // Gold
  "#FFFFFF", // White
  "#FFF5CC", // Pale yellow
  "#FFE4B5", // Moccasin
];

function SparkleElement({
  sparkle,
  mouseX,
  mouseY,
}: {
  sparkle: Sparkle;
  mouseX: number;
  mouseY: number;
}) {
  // Calculate distance from mouse (0-1 scale, where 0 is closest)
  const distance = useMemo(() => {
    const dx = sparkle.x - mouseX * 100;
    const dy = sparkle.y - mouseY * 100;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.min(dist / 30, 1); // Normalize: within 30% = affected
  }, [sparkle.x, sparkle.y, mouseX, mouseY]);

  // When mouse is close, sparkle gets brighter and larger
  const isNearMouse = distance < 1;
  const hoverScale = isNearMouse ? 1 + (1 - distance) * 1.5 : 1;
  const hoverBrightness = isNearMouse ? 1 + (1 - distance) * 0.5 : 1;

  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${sparkle.x}%`,
        top: `${sparkle.y}%`,
        width: sparkle.size,
        height: sparkle.size,
        borderRadius: "50%",
        backgroundColor: sparkle.color,
        boxShadow: `0 0 ${sparkle.size * 2}px ${sparkle.color}, 0 0 ${sparkle.size * 4}px ${sparkle.color}`,
        filter: `brightness(${hoverBrightness})`,
        transform: `translate(-50%, -50%) scale(${hoverScale})`,
      }}
      animate={
        isNearMouse
          ? {
              opacity: [0.8, 1, 0.8],
              scale: [hoverScale * 0.9, hoverScale * 1.1, hoverScale * 0.9],
            }
          : {
              opacity: [0.3, 0.9, 0.3],
              scale: [0.8, 1.2, 0.8],
            }
      }
      transition={{
        duration: isNearMouse ? sparkle.duration * 0.5 : sparkle.duration,
        repeat: Infinity,
        delay: sparkle.delay,
        ease: "easeInOut",
      }}
    />
  );
}

// 4-point star sparkle for larger ones
function StarSparkle({
  sparkle,
  mouseX,
  mouseY,
}: {
  sparkle: Sparkle;
  mouseX: number;
  mouseY: number;
}) {
  const distance = useMemo(() => {
    const dx = sparkle.x - mouseX * 100;
    const dy = sparkle.y - mouseY * 100;
    const dist = Math.sqrt(dx * dx + dy * dy);
    return Math.min(dist / 30, 1);
  }, [sparkle.x, sparkle.y, mouseX, mouseY]);

  const isNearMouse = distance < 1;
  const hoverScale = isNearMouse ? 1 + (1 - distance) * 2 : 1;

  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${sparkle.x}%`,
        top: `${sparkle.y}%`,
        width: sparkle.size * 2,
        height: sparkle.size * 2,
        transform: `translate(-50%, -50%)`,
      }}
      animate={
        isNearMouse
          ? {
              opacity: [0.7, 1, 0.7],
              scale: [hoverScale * 0.95, hoverScale * 1.05, hoverScale * 0.95],
              rotate: [0, 15, 0],
            }
          : {
              opacity: [0.4, 1, 0.4],
              scale: [0.9, 1.1, 0.9],
              rotate: [0, 10, 0],
            }
      }
      transition={{
        duration: isNearMouse ? sparkle.duration * 0.4 : sparkle.duration,
        repeat: Infinity,
        delay: sparkle.delay,
        ease: "easeInOut",
      }}
    >
      {/* 4-point star using CSS */}
      <svg
        viewBox="0 0 24 24"
        fill={sparkle.color}
        style={{
          width: "100%",
          height: "100%",
          filter: `drop-shadow(0 0 ${sparkle.size}px ${sparkle.color})`,
        }}
      >
        <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10Z" />
      </svg>
    </motion.div>
  );
}

export function Sparkles({ count = 80 }: SparklesProps) {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const sparkles = useMemo<Sparkle[]>(() => {
    return Array.from({ length: count }, (_, i) => {
      let x: number;
      let y: number;

      if (isMobile) {
        // On mobile: concentrate sparkles in upper portion (where books are)
        // Avoid lower 50% where text is
        x = Math.random() * 100;
        y = Math.random() * 55; // Only top 55%
      } else {
        // On desktop: bias sparkles toward the right side (where books are)
        const rand = Math.random();
        if (rand < 0.2) {
          x = Math.random() * 40;
        } else {
          x = 40 + Math.random() * 60;
        }
        y = Math.random() * 100;
      }

      return {
        id: i,
        x,
        y,
        size: 2 + Math.random() * 5,
        delay: Math.random() * 3,
        duration: 1.5 + Math.random() * 2.5,
        color: SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)],
      };
    });
  }, [count, isMobile]);

  // Split into regular sparkles and star sparkles
  const regularSparkles = sparkles.filter((s) => s.size < 4.5);
  const starSparkles = sparkles.filter((s) => s.size >= 4.5);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* Regular circular sparkles */}
      {regularSparkles.map((sparkle) => (
        <SparkleElement
          key={sparkle.id}
          sparkle={sparkle}
          mouseX={mousePos.x}
          mouseY={mousePos.y}
        />
      ))}

      {/* 4-point star sparkles for larger ones */}
      {starSparkles.map((sparkle) => (
        <StarSparkle
          key={`star-${sparkle.id}`}
          sparkle={sparkle}
          mouseX={mousePos.x}
          mouseY={mousePos.y}
        />
      ))}
    </div>
  );
}
