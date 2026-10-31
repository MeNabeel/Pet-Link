import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * BackgroundBeamsWithCollision
 * Aceternity UI component for animated background beams with collision effects.
 * Optimized for PetLink theme: vibrant cyan/blue contrast against light-blue cards,
 * visible motion, glowing heads, and delicate contained collision bursts.
 */
export const BackgroundBeamsWithCollision = ({
  children,
  className,
  containerClassName,
}) => {
  const containerRef = useRef(null);
  const parentRef = useRef(null);

  // Responsive percentage-based beam paths for consistent distribution across screen widths
  const beams = [
    { left: "6%", duration: 5.5, delay: 0.2, rotate: -0.5 },
    { left: "19%", duration: 4.8, delay: 1.4, rotate: 0.5 },
    { left: "33%", duration: 6.2, delay: 0.6, rotate: 0 },
    { left: "48%", duration: 5.0, delay: 2.1, rotate: -0.5 },
    { left: "63%", duration: 5.8, delay: 1.0, rotate: 0.5 },
    { left: "77%", duration: 4.6, delay: 2.6, rotate: -0.2 },
    { left: "91%", duration: 6.5, delay: 0.8, rotate: 0.2 },
  ];

  return (
    <div
      ref={parentRef}
      className={cn("relative w-full overflow-hidden", containerClassName)}
    >
      <div
        ref={containerRef}
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        {beams.map((beam, index) => (
          <CollisionMechanism
            key={`beam-${index}`}
            beamOptions={beam}
            containerRef={containerRef}
            parentRef={parentRef}
          />
        ))}
      </div>

      <div className={cn("relative z-10 w-full", className)}>
        {children}
      </div>
    </div>
  );
};

const CollisionMechanism = React.memo(({ beamOptions, containerRef, parentRef }) => {
  const beamRef = useRef(null);
  const [collision, setCollision] = useState({
    detected: false,
    coordinates: null,
  });
  const [beamKey, setBeamKey] = useState(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const checkCollision = () => {
      if (
        beamRef.current &&
        containerRef.current &&
        parentRef.current &&
        !collision.detected
      ) {
        const beamRect = beamRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        // Check if beam bottom reached near the container base
        const threshold = containerRect.bottom - 20;
        if (beamRect.bottom >= threshold) {
          const relativeX = beamRect.left - containerRect.left + beamRect.width / 2;
          const relativeY = containerRect.height - 16;

          setCollision({
            detected: true,
            coordinates: {
              x: Math.max(12, Math.min(relativeX, containerRect.width - 12)),
              y: relativeY,
            },
          });
        }
      }
    };

    const animationInterval = setInterval(checkCollision, 50);
    return () => clearInterval(animationInterval);
  }, [collision.detected, containerRef, parentRef]);

  useEffect(() => {
    if (collision.detected) {
      const resetTimeout = setTimeout(() => {
        setCollision({ detected: false, coordinates: null });
        setCycle((prev) => prev + 1);
      }, 1600);

      const keyTimeout = setTimeout(() => {
        setBeamKey((prev) => prev + 1);
      }, 1800);

      return () => {
        clearTimeout(resetTimeout);
        clearTimeout(keyTimeout);
      };
    }
  }, [collision.detected]);

  return (
    <>
      <motion.div
        key={`${beamKey}-${cycle}`}
        ref={beamRef}
        animate="animate"
        initial={{
          translateY: "-120px",
          top: 0,
          opacity: 0,
        }}
        variants={{
          animate: {
            translateY: "480px",
            opacity: [0, 0.95, 0.95, 0],
            transition: {
              duration: beamOptions.duration || 5.5,
              repeat: Infinity,
              repeatDelay: 1.5,
              delay: beamOptions.delay || 0,
              ease: "linear",
            },
          },
        }}
        style={{
          position: "absolute",
          left: beamOptions.left || "50%",
          top: 0,
          transform: `rotate(${beamOptions.rotate || 0}deg)`,
        }}
        className={cn(
          "pointer-events-none relative flex flex-col items-center",
          "w-[3px] h-32 rounded-full",
          "bg-gradient-to-b from-transparent via-[#38BDF8] via-[#0284C7] to-[#0052A3]",
          "shadow-[0_0_12px_rgba(2,132,199,0.7),0_0_5px_rgba(0,102,204,0.9)]"
        )}
      >
        {/* Glowing Head Point at the tip of the beam */}
        <div className="absolute -bottom-1 h-[4.5px] w-[4.5px] rounded-full bg-white shadow-[0_0_10px_#38BDF8,0_0_5px_#0066CC]" />
      </motion.div>

      <AnimatePresence>
        {collision.detected && collision.coordinates && (
          <Explosion
            key={`explosion-${beamKey}-${collision.coordinates.x}`}
            className=""
            style={{
              left: `${collision.coordinates.x}px`,
              top: `${collision.coordinates.y}px`,
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
});

CollisionMechanism.displayName = "CollisionMechanism";

const Explosion = ({ ...props }) => {
  const spans = Array.from({ length: 16 }, (_, index) => {
    const angle = (index * 360) / 16;
    const distance = 14 + (index % 4) * 8;
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians) * distance;
    const y = Math.sin(radians) * distance * 0.5 - 6;

    return {
      id: index,
      directionX: x,
      directionY: y,
    };
  });

  return (
    <div
      {...props}
      className={cn("pointer-events-none absolute z-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2", props.className)}
    >
      {/* Central burst radial bloom */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.4, 1.8] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="absolute -inset-4 rounded-full bg-gradient-to-b from-[#38BDF8]/40 to-[#0066CC]/20 blur-[8px]"
      />
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1.2 }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="absolute h-1.5 w-1.5 rounded-full bg-gradient-to-b from-[#38BDF8] to-[#0066CC] shadow-[0_0_6px_rgba(2,132,199,0.9)]"
        />
      ))}
    </div>
  );
};

export default BackgroundBeamsWithCollision;
