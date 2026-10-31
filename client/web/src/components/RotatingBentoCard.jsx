import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PawPrint, HeartHandshake, Activity, Headphones, ArrowUpRight } from "lucide-react";
import GlowingEffect from "./ui/glowing-effect";

/**
 * RotatingBentoCard
 * Unified Bento statistics card displaying the four key PetLink metrics
 * through an automatic rotating carousel with manual pagination dots,
 * pause-on-hover, semantic color shifts, and proximity border glow.
 */
export default function RotatingBentoCard({ metrics = {}, onNavigate }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const slides = [
    {
      id: "pets",
      title: "Registered Pets",
      count: metrics.pets ?? 0,
      description: "Active pet profiles",
      icon: PawPrint,
      color: "#0066CC",
      bgLight: "rgba(0, 102, 204, 0.08)",
      glowColor: "rgba(0, 102, 204, 0.45)",
      highlightColor: "rgba(56, 189, 248, 0.9)",
      destination: "pets",
    },
    {
      id: "listings",
      title: "Active Listings",
      count: metrics.listings ?? 0,
      description: "Marketplace items",
      icon: HeartHandshake,
      color: "#16A34A",
      bgLight: "rgba(22, 163, 74, 0.08)",
      glowColor: "rgba(22, 163, 74, 0.45)",
      highlightColor: "rgba(74, 222, 128, 0.9)",
      destination: "marketplace",
    },
    {
      id: "vaccines",
      title: "Vaccines Tracked",
      count: metrics.vaccines ?? 0,
      description: "Immunization records",
      icon: Activity,
      color: "#EA580C",
      bgLight: "rgba(234, 179, 8, 0.12)",
      glowColor: "rgba(234, 88, 12, 0.45)",
      highlightColor: "rgba(251, 146, 60, 0.9)",
      destination: "pets",
    },
    {
      id: "support",
      title: "Support Sessions",
      count: metrics.support ?? 0,
      description: "Advisor consultations",
      icon: Headphones,
      color: "#8B5CF6",
      bgLight: "rgba(139, 92, 246, 0.08)",
      glowColor: "rgba(139, 92, 246, 0.45)",
      highlightColor: "rgba(192, 132, 252, 0.9)",
      destination: "ai",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Automatic carousel transition every 4.5 seconds (paused on hover)
  useEffect(() => {
    if (isPaused) return;

    // Check prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    timerRef.current = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  const current = slides[currentIndex];
  const IconComponent = current.icon;

  const handleCardClick = () => {
    if (onNavigate) {
      onNavigate(current.destination);
    }
  };

  return (
    <div
      className="dash-bento-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={handleCardClick}
      role="region"
      aria-roledescription="carousel"
      aria-label="Key PetLink Statistics"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* Dynamic Proximity Glowing Border matching current active slide color */}
      <GlowingEffect
        spread={150}
        proximity={90}
        glowColor={current.glowColor}
        highlightColor={current.highlightColor}
      />

      {/* Bento Header */}
      <div className="dash-bento-header">
        <div className="dash-bento-tag">
          <span
            className="dash-bento-live-dot"
            style={{ backgroundColor: current.color }}
          />
          <span>Live Metrics</span>
        </div>
        <button
          type="button"
          className="dash-bento-arrow-btn"
          aria-label={`View ${current.title}`}
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* Bento Body with Smooth Slide/Fade Transition */}
      <div className="dash-bento-body">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="dash-bento-slide"
          >
            {/* Icon Badge */}
            <div
              className="dash-bento-icon-box"
              style={{
                color: current.color,
                backgroundColor: current.bgLight,
              }}
            >
              <IconComponent size={24} />
            </div>

            {/* Metric Value */}
            <div className="dash-bento-value" style={{ color: "#0F172A" }}>
              {current.count}
            </div>

            {/* Metric Label & Description */}
            <div className="dash-bento-meta">
              <h4 className="dash-bento-label">{current.title}</h4>
              <p className="dash-bento-desc">{current.description}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Indicators */}
      <div
        className="dash-bento-pagination"
        onClick={(e) => e.stopPropagation()}
        role="tablist"
        aria-label="Choose statistic slide"
      >
        {slides.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            className={`dash-bento-dot ${idx === currentIndex ? "active" : ""}`}
            style={{
              backgroundColor: idx === currentIndex ? current.color : undefined,
              width: idx === currentIndex ? "20px" : "6px",
            }}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Show ${s.title}`}
            aria-selected={idx === currentIndex}
            role="tab"
          />
        ))}
      </div>
    </div>
  );
}

