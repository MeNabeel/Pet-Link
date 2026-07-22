import React from 'react';
import './Skeleton.css';

export function Skeleton({ className = '', variant = 'text', width, height, style, ...props }) {
  const customStyle = {
    width,
    height,
    ...style
  };

  return (
    <div
      className={`skeleton-pulsate skeleton-${variant} ${className}`}
      style={customStyle}
      {...props}
    />
  );
}
