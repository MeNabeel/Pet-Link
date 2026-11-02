import React, { useEffect, useState, useRef } from 'react';
import './user-cursor.css';

/**
 * PetLink SaaS Custom Cursor
 * - Hardware-accelerated movement via requestAnimationFrame
 * - Trailing spring aura with PetLink cyan/blue styling
 * - Auto-disables on touch screens and mobile devices (@media pointer: fine)
 * - Adapts on hover over buttons/links and fades on text inputs for perfect UX
 */
export default function UserCursor({ user }) {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [ripples, setRipples] = useState([]);

  // Coordinates
  const mouseRef = useRef({ x: -100, y: -100 });
  const auraRef = useRef({ x: -100, y: -100 });
  const pointerElRef = useRef(null);
  const auraElRef = useRef(null);
  const rafIdRef = useRef(null);

  // Check if fine pointer (mouse / trackpad) is supported
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(pointer: fine) and (hover: hover)');
    const updateEnabled = () => {
      // Only enable on desktop/laptop with fine mouse pointer
      setEnabled(mediaQuery.matches && window.innerWidth >= 768);
    };

    updateEnabled();
    mediaQuery.addEventListener?.('change', updateEnabled);
    window.addEventListener('resize', updateEnabled);

    return () => {
      mediaQuery.removeEventListener?.('change', updateEnabled);
      window.removeEventListener('resize', updateEnabled);
    };
  }, []);

  // Animation loop for smooth movement and trailing aura
  useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      // Trailing spring physics for the glow aura
      const speed = 0.22;
      auraRef.current.x += (mouseRef.current.x - auraRef.current.x) * speed;
      auraRef.current.y += (mouseRef.current.y - auraRef.current.y) * speed;

      if (pointerElRef.current) {
        pointerElRef.current.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`;
      }

      if (auraElRef.current) {
        auraElRef.current.style.transform = `translate3d(${auraRef.current.x}px, ${auraRef.current.y}px, 0)`;
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    rafIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [enabled]);

  // Mouse event listeners
  useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      if (!visible) setVisible(true);

      // Check element under cursor for hover / text input states
      const target = e.target;
      if (target) {
        const isInteractive = Boolean(
          target.closest('a, button, [role="button"], input[type="button"], input[type="submit"], select, .clickable, [onclick]') ||
          window.getComputedStyle(target).cursor === 'pointer'
        );

        const isInput = Boolean(
          target.closest('input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]')
        );

        setIsHovering(isInteractive && !isInput);
        setIsTextInput(isInput);
      }
    };

    const handleMouseEnter = () => setVisible(true);
    const handleMouseLeave = () => setVisible(false);

    const handleMouseDown = (e) => {
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev.slice(-3), { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 500);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [enabled, visible]);

  if (!enabled || !visible) return null;

  const displayName = user?.name?.split(' ')[0] || user?.fullName?.split(' ')[0] || user?.username || 'PetLink';

  return (
    <div className="petlink-custom-cursor-layer" aria-hidden="true">
      {/* Trailing soft cyan glow */}
      <div
        ref={auraElRef}
        className={`petlink-cursor-aura ${isHovering ? 'hovering' : ''} ${isTextInput ? 'text-input' : ''}`}
      />

      {/* Main sleek pointer */}
      <div
        ref={pointerElRef}
        className={`petlink-cursor-pointer ${isHovering ? 'hovering' : ''} ${isTextInput ? 'text-input' : ''}`}
      >
        <svg
          className="petlink-cursor-svg"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer stroke */}
          <path
            d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
            fill="#0066CC"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Inner accent dot */}
          <circle cx="4.5" cy="5.5" r="1.5" fill="#38BDF8" />
        </svg>

        {/* Micro tag badge */}
        <div className="petlink-cursor-tag">
          <span className="petlink-cursor-tag-dot" />
          <span>{displayName}</span>
        </div>
      </div>

      {/* Click Ripples */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="petlink-cursor-ripple"
          style={{ transform: `translate3d(${ripple.x}px, ${ripple.y}px, 0) translate(-50%, -50%)` }}
        />
      ))}
    </div>
  );
}

