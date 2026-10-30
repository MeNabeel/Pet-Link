import React, { useRef, useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

/**
 * GlowingEffect
 * Aceternity UI component for subtle, professional proximity border-glow effect.
 * Tracks pointer movement on the card to generate an elegant dynamic radial glow.
 */
export const GlowingEffect = memo(({
  blur = 12,
  spread = 40,
  proximity = 80,
  borderWidth = 1.5,
  glow = true,
  disabled = false,
  className,
  glowColor = "rgba(0, 102, 204, 0.28)",
  highlightColor = "rgba(56, 189, 248, 0.4)",
}) => {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (disabled || !glow) return;
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const handleMouseMove = (e) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setPosition({ x, y });

      // Proximity check: fade in when mouse is inside or near parent
      const isNear =
        x >= -proximity &&
        x <= rect.width + proximity &&
        y >= -proximity &&
        y <= rect.height + proximity;

      setOpacity(isNear ? 1 : 0);
    };

    const handleMouseLeave = () => {
      setOpacity(0);
    };

    parent.addEventListener("mousemove", handleMouseMove);
    parent.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      parent.removeEventListener("mousemove", handleMouseMove);
      parent.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [disabled, glow, proximity]);

  if (disabled || !glow) return null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 -z-0 overflow-hidden rounded-[inherit] transition-opacity duration-300",
        className
      )}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Outer border glow tracker */}
      <div
        className="absolute inset-0 rounded-[inherit] transition-transform duration-75"
        style={{
          padding: `${borderWidth}px`,
          background: `radial-gradient(${spread}px circle at ${position.x}px ${position.y}px, ${highlightColor}, ${glowColor}, transparent 70%)`,
          mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      />
      {/* Subtle interior glow spot */}
      <div
        className="absolute inset-0 rounded-[inherit] opacity-25"
        style={{
          background: `radial-gradient(${spread * 1.5}px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 60%)`,
        }}
      />
    </div>
  );
});

GlowingEffect.displayName = "GlowingEffect";

export default GlowingEffect;

