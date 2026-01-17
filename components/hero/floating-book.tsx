"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

interface FloatingBookProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  x: string; // CSS position (e.g., "70%")
  y: string; // CSS position (e.g., "60%")
  rotation?: number;
  depth?: number; // 0-1, affects parallax intensity and size
  floatDuration?: number;
  floatDelay?: number;
}

export function FloatingBook({
  src,
  alt,
  width,
  height,
  x,
  y,
  rotation = 0,
  depth = 0.5,
  floatDuration = 4,
  floatDelay = 0,
}: FloatingBookProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth the mouse values
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Transform mouse position to parallax offset based on depth
  const parallaxX = useTransform(smoothMouseX, [-1, 1], [-30 * depth, 30 * depth]);
  const parallaxY = useTransform(smoothMouseY, [-1, 1], [-20 * depth, 20 * depth]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Scale based on depth (further = smaller)
  const scale = 0.5 + depth * 0.5;

  return (
    <motion.div
      style={{
        position: "absolute",
        left: x,
        top: y,
        x: parallaxX,
        y: parallaxY,
        transform: `translate(-50%, -50%)`,
        zIndex: Math.round(depth * 10),
      }}
      animate={{
        y: [0, -15, 0],
        rotate: [rotation - 2, rotation + 2, rotation - 2],
      }}
      transition={{
        y: {
          duration: floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatDelay,
        },
        rotate: {
          duration: floatDuration * 1.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: floatDelay,
        },
      }}
      whileHover={{ scale: 1.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div
        animate={{
          filter: isHovered
            ? "drop-shadow(0 0 20px rgba(255, 235, 100, 0.6))"
            : "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))",
        }}
        transition={{ duration: 0.3 }}
        style={{ cursor: "pointer" }}
      >
        <Image
          src={src}
          alt={alt}
          width={Math.round(width * scale)}
          height={Math.round(height * scale)}
          style={{
            objectFit: "contain",
            pointerEvents: "auto",
          }}
          priority
        />
      </motion.div>
    </motion.div>
  );
}
