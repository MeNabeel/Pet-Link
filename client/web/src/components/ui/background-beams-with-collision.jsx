import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * BackgroundBeamsWithCollision
 * Aceternity UI component for animated background beams with collision effects.
 * Tuned for PetLink theme: elegant blues, subtle particles, fully contained.
 */
export const BackgroundBeamsWithCollision = ({
  children,
  className,
  containerClassName
}) => {
  const containerRef = useRef(null);
  const parentRef = useRef(null);

  const beams = [
    {
      initialX: 30,
      translateX: 30,
      duration: 6,
      repeatDelay: 2,
      delay: 0.5,
    },
    {
      initialX: 180,
      translateX: 180,
      duration: 5,
      repeatDelay: 3,
      delay: 1.5,
    },
    {
      initialX: 360,
      translateX: 360,
      duration: 7,
      repeatDelay: 2,
      delay: 0.8,
    },
    {
      initialX: 540,
      translateX: 540,
      duration: 6.5,
      repeatDelay: 4,
      delay: 2,
    },
    {
      initialX: 720,
      translateX: 720,
      duration: 5.5,
      repeatDelay: 2.5,
      delay: 1,
    },
    {
      initialX: 900,
      translateX: 900,
      duration: 8,
      repeatDelay: 3.5,
      delay: 2.5,
    },
  ];

  return (
    <div
      ref={parentRef}
      className={cn(
        "relative w-full overflow-hidden",
        containerClassName
      )}
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
        const threshold = containerRect.bottom - 24;
        if (beamRect.bottom >= threshold) {
          const relativeX = beamRect.left - containerRect.left + beamRect.width / 2;
          const relativeY = containerRect.height - 18;

          setCollision({
            detected: true,
            coordinates: {
              x: Math.max(10, Math.min(relativeX, containerRect.width - 10)),
              y: relativeY,
            },
          });
        }
      }
    };

    const animationInterval = setInterval(checkCollision, 60);
    return () => clearInterval(animationInterval);
  }, [collision.detected, containerRef, parentRef]);

  useEffect(() => {
    if (collision.detected) {
      const resetTimeout = setTimeout(() => {
        setCollision({ detected: false, coordinates: null });
        setCycle((prev) => prev + 1);
      }, 1800);

      const keyTimeout = setTimeout(() => {
        setBeamKey((prev) => prev + 1);
      }, 2000);

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
          translateY: "-100px",
          top: 0,
          opacity: 0,
        }}
        variants={{
          animate: {
            translateY: "450px",
            opacity: [0, 0.7, 0.7, 0],
            transition: {
              duration: beamOptions.duration || 6,
              repeat: Infinity,
              repeatDelay: beamOptions.repeatDelay || 2,
              delay: beamOptions.delay || 0,
              ease: "linear",
            },
          },
        }}
        style={{
          position: "absolute",
          left: `${beamOptions.initialX || 0}px`,
          top: 0,
          transform: `rotate(${beamOptions.rotate || 0}deg)`,
        }}
        className={cn(
          "pointer-events-none w-[1.5px] rounded-full bg-gradient-to-b from-transparent via-[#0066CC] to-[#38BDF8]",
          "h-24 opacity-60 shadow-[0_0_8px_rgba(0,102,204,0.4)]",
          beamOptions.className
        )}
      />

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
  const spans = Array.from({ length: 14 }, (_, index) => {
    const angle = (index * 360) / 14;
    const distance = 12 + (index % 4) * 6;
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians) * distance;
    const y = Math.sin(radians) * distance * 0.5 - 4; // slight upward bias

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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute -inset-4 rounded-full bg-gradient-to-b from-[#38BDF8]/20 to-transparent blur-[6px]"
      />
      {spans.map((span) => (
        <motion.span
          key={span.id}
          initial={{ x: 0, y: 0, opacity: 0.8, scale: 1 }}
          animate={{
            x: span.directionX,
            y: span.directionY,
            opacity: 0,
            scale: 0.2,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute h-1 w-1 rounded-full bg-gradient-to-b from-[#0066CC] to-[#38BDF8]"
        />
      ))}
    </div>
  );
};
