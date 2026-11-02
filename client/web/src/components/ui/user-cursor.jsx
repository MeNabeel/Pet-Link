import React, { useEffect, useState, useRef } from 'react';
import './user-cursor.css';

/**
 * PetLink SaaS Custom Cursor
 * - Hardware-accelerated movement & rotation via requestAnimationFrame
 * - 360° dynamic directional rotation following mouse vector (Math.atan2)
 * - Completely hides native cursor on desktop while keeping text selection functional
 * - Increased size by 20-25% with PetLink colors & cyan trailing aura
 * - Auto-disables on touch screens and mobile devices (@media pointer: fine)
 */
export default function UserCursor({ user }) {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTextInput, setIsTextInput] = useState(false);
  const [ripples, setRipples] = useState([]);

  // Coordinates & Velocity Refs
  const mouseRef = useRef({ x: -100, y: -100 });
  const auraRef = useRef({ x: -100, y: -100 });
  const lastMousePosRef = useRef({ x: -100, y: -100 });

  // Directional rotation refs (in degrees)
  const targetAngleRef = useRef(0);
  const currentAngleRef = useRef(0);
  const isHoveringRef = useRef(false);

  // DOM element refs for direct hardware-accelerated transforms
  const pointerElRef = useRef(null);
  const auraElRef = useRef(null);
  const svgElRef = useRef(null);
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

  // When enabled on desktop, attach cursor-hiding class to html & body
  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add('petlink-custom-cursor-active');
      document.body.classList.add('petlink-custom-cursor-active');
    } else {
      document.documentElement.classList.remove('petlink-custom-cursor-active');
      document.body.classList.remove('petlink-custom-cursor-active');
    }

    return () => {
      document.documentElement.classList.remove('petlink-custom-cursor-active');
      document.body.classList.remove('petlink-custom-cursor-active');
    };
  }, [enabled]);

  // Animation loop: smooth position, trailing aura, and dynamic 360° rotation
  useEffect(() => {
    if (!enabled) return;

    const animate = () => {
      // 1. Trailing spring physics for the glow aura
      const auraSpeed = 0.22;
      auraRef.current.x += (mouseRef.current.x - auraRef.current.x) * auraSpeed;
      auraRef.current.y += (mouseRef.current.y - auraRef.current.y) * auraSpeed;

      // 2. Shortest angular distance to prevent 360-degree flip
      let angleDiff = (targetAngleRef.current - currentAngleRef.current) % 360;
      if (angleDiff > 180) angleDiff -= 360;
      if (angleDiff < -180) angleDiff += 360;

      // 3. Smooth angle interpolation (lerp speed 0.28 gives responsive turn without lag)
      currentAngleRef.current += angleDiff * 0.28;

      // 4. Update pointer position
      if (pointerElRef.current) {
        pointerElRef.current.style.transform = `translate3d(${mouseRef.current.x}px, ${mouseRef.current.y}px, 0)`;
      }

      // 5. Update aura position
      if (auraElRef.current) {
        auraElRef.current.style.transform = `translate3d(${auraRef.current.x}px, ${auraRef.current.y}px, 0)`;
      }

      // 6. Apply dynamic rotation to the cursor arrow
      if (svgElRef.current) {
        const scale = isHoveringRef.current ? 1.15 : 1;
        svgElRef.current.style.transform = `rotate(${currentAngleRef.current}deg) scale(${scale})`;
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
      const clientX = e.clientX;
      const clientY = e.clientY;

      if (!visible) setVisible(true);

      // On first mouse move, initialize previous position to avoid jump
      if (lastMousePosRef.current.x === -100 && lastMousePosRef.current.y === -100) {
        lastMousePosRef.current = { x: clientX, y: clientY };
        mouseRef.current = { x: clientX, y: clientY };
        auraRef.current = { x: clientX, y: clientY };
        return;
      }

      // Calculate directional vector
      const deltaX = clientX - lastMousePosRef.current.x;
      const deltaY = clientY - lastMousePosRef.current.y;
      const distance = Math.hypot(deltaX, deltaY);

      // Jitter prevention: only update angle if movement is distinct (>= 3px)
      if (distance >= 3) {
        // Math.atan2(deltaY, deltaX):
        //  0° = pure right
        //  90° = pure down
        //  180° = pure left
        // -90° = pure up
        const rad = Math.atan2(deltaY, deltaX);
        targetAngleRef.current = (rad * 180) / Math.PI;
        lastMousePosRef.current = { x: clientX, y: clientY };
      }

      mouseRef.current.x = clientX;
      mouseRef.current.y = clientY;

      // Check element under cursor for hover / text input states
      const target = e.target;
      if (target) {
        const isInteractive = Boolean(
          target.closest('a, button, [role="button"], input[type="button"], input[type="submit"], select, .clickable, [onclick]') ||
          window.getComputedStyle(target).cursor === 'pointer'
        );

        const isInput = Boolean(
          target.closest('input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable="true"]')
        );

        isHoveringRef.current = isInteractive && !isInput;
        setIsHovering(isHoveringRef.current);
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
      {/* Trailing soft cyan glow aura */}
      <div
        ref={auraElRef}
        className={`petlink-cursor-aura ${isHovering ? 'hovering' : ''} ${isTextInput ? 'text-input' : ''}`}
      />

      {/* Main cursor pointer */}
      <div
        ref={pointerElRef}
        className={`petlink-cursor-pointer ${isHovering ? 'hovering' : ''} ${isTextInput ? 'text-input' : ''}`}
      >
        {/* Directional rotating arrow wrapper */}
        <div className="petlink-cursor-svg-wrapper">
          <svg
            ref={svgElRef}
            className="petlink-cursor-svg"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Directional arrowhead (tip at 21.5, 12 facing pure right at 0deg) */}
            <path
              d="M21.5 12L3.5 3.5L7.5 12L3.5 20.5L21.5 12Z"
              fill="#0066CC"
              stroke="#FFFFFF"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            {/* Center PetLink cyan accent dot */}
            <circle cx="12" cy="12" r="1.8" fill="#38BDF8" />
          </svg>
        </div>

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
