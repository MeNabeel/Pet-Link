import React, { useState, useEffect } from 'react';

export default function PetImage({ src, imageSettings, type = 'card', style = {}, className = '' }) {
  const [orientation, setOrientation] = useState('landscape'); // 'landscape' | 'portrait' | 'square'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const ratio = img.width / img.height;
      if (ratio > 1.1) {
        setOrientation('landscape');
      } else if (ratio < 0.9) {
        setOrientation('portrait');
      } else {
        setOrientation('square');
      }
      setLoading(false);
    };
    img.onerror = () => {
      setLoading(false);
    };
  }, [src]);

  if (!src) {
    return (
      <div 
        style={{
          width: '100%',
          height: type === 'hero' ? '320px' : '180px',
          backgroundColor: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
        className={className}
      >
        <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: '500' }}>No Companion Photo</span>
      </div>
    );
  }

  const posX = imageSettings?.positionX ?? 50;
  const posY = imageSettings?.positionY ?? 50;
  const objPos = imageSettings?.objectPosition || `${posX}% ${posY}%`;

  const isPortrait = orientation === 'portrait';
  
  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: isPortrait ? 'contain' : 'cover',
    objectPosition: isPortrait ? 'center' : objPos,
    backgroundColor: isPortrait ? '#F3F4F6' : 'transparent',
    transition: 'object-position 0.1s ease-out',
    display: 'block'
  };

  const containerStyle = {
    width: '100%',
    height: type === 'hero' ? '320px' : '180px',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F3F4F6',
    ...style
  };

  return (
    <div style={containerStyle} className={className}>
      {loading && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6', zIndex: 1 }}>
          <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Loading...</div>
        </div>
      )}
      <img src={src} alt="Companion" style={imgStyle} />
    </div>
  );
}
