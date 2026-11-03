import React, { useState, useEffect } from 'react';
import { PawPrint } from 'lucide-react';

export default function PetImage({ 
  src, 
  imageSettings, 
  type = 'card', 
  style = {}, 
  className = '',
  alt = 'Companion photo'
}) {
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }
    setHasError(false);
    setLoading(true);

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setLoading(false);
    };
    img.onerror = () => {
      setHasError(true);
      setLoading(false);
    };
  }, [src]);

  // Fallback state when src is missing or image fails to load
  if (!src || hasError) {
    return (
      <div 
        style={{
          width: '100%',
          height: '100%',
          minHeight: type === 'hero' ? '280px' : '150px',
          backgroundColor: '#F1F5F9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          color: '#94A3B8',
          userSelect: 'none',
          ...style
        }}
        className={`pet-img-fallback ${className}`}
        aria-label="No companion photo available"
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#0066CC'
        }}>
          <PawPrint size={22} strokeWidth={2} />
        </div>
        <span style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>
          PetLink Companion
        </span>
      </div>
    );
  }

  // Position calculation (defaults to center 50% 50%)
  const posX = imageSettings?.positionX ?? 50;
  const posY = imageSettings?.positionY ?? 50;
  const objPos = imageSettings?.objectPosition || `${posX}% ${posY}%`;

  const containerStyle = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F1F5F9',
    ...style
  };

  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: objPos,
    display: 'block',
    transition: 'transform 0.25s ease, opacity 0.2s ease',
    opacity: loading ? 0 : 1
  };

  return (
    <div style={containerStyle} className={`pet-img-container ${className}`}>
      {loading && (
        <div 
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F1F5F9',
            zIndex: 1
          }}
        >
          <PawPrint size={20} className="pulse-soft" color="#94A3B8" />
        </div>
      )}
      <img 
        src={src} 
        alt={alt} 
        style={imgStyle}
        onError={() => setHasError(true)}
      />
    </div>
  );
}
