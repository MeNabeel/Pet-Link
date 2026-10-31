import React, { useRef, useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";

/**
 * GlowingEffect
 * Aceternity-inspired cursor proximity glowing border effect.
 * Positions a vibrant, localized radial illumination along the card's outer border that
 * tracks pointer movement and glows visibly on hover without blocking interactions.
 */
export const GlowingEffect = memo(({
  spread = 160,
  proximity = 100,
  borderWidth = 2,
  glow = true,
  disabled = false,
  className,
  glowColor = "rgba(0, 102, 204, 0.45)",
  highlightColor = "rgba(56, 189, 248, 0.9)",
}) => {
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ x: -200, y: -200 });
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (disabled || !glow) return;
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setOpacity(0);
      return;
    }

    const handleMouseMove = (e) => {
      const rect = parent.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setPosition({ x, y });

      const isInsideOrNear =
        x >= -proximity &&
        x <= rect.width + proximity &&
        y >= -proximity &&
        y <= rect.height + proximity;

      setOpacity(isInsideOrNear ? 1 : 0);
    };

    const handleMouseLeave = () => {
      setOpacity(0);
    };

    parent.addEventListener("mousemove", handleMouseMove, { passive: true });
    parent.addEventListener("mouseleave", handleMouseLeave, { passive: true });

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
        "pointer-events-none absolute -inset-[1px] z-20 overflow-hidden rounded-[inherit] transition-opacity duration-300 ease-out",
        className
      )}
      style={{ opacity }}
      aria-hidden="true"
    >
      {/* Layer 1: Crisp illuminated border stroke tracking cursor */}
      <div
        className="absolute inset-0 rounded-[inherit]"
        style={{
          border: `${borderWidth}px solid transparent`,
          backgroundImage: `radial-gradient(${spread}px circle at ${position.x}px ${position.y}px, ${highlightColor}, ${glowColor} 50%, transparent 75%)`,
          backgroundOrigin: "border-box",
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
        }}
      />

      {/* Layer 2: Soft diffuse outer aura for realistic illumination */}
      <div
        className="absolute inset-0 rounded-[inherit] opacity-70"
        style={{
          background: `radial-gradient(${spread * 1.2}px circle at ${position.x}px ${position.y}px, ${glowColor}, transparent 65%)`,
          filter: "blur(8px)",
          WebkitMask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          mask: "linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)",
          maskComposite: "exclude",
        }}
      />
    </div>
  );
});

GlowingEffect.displayName = "GlowingEffect";

export default GlowingEffect;
