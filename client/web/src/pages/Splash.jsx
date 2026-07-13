import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import './Splash.css';

export default function Splash({ onProceed }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="splash-container">
      <div className="splash-card">
        <img 
          src="/logo/logo.jpeg" 
          alt="PetLink Logo" 
          className="splash-logo-img"
          onError={(e) => {
            // Fallback to png if jpeg fails
            e.target.onerror = null;
            e.target.src = "/logo/logo.png";
          }}
        />
        
        <h1 className="splash-title">PetLink</h1>
        <p className="splash-tagline">
          Bringing paws and people together, one click at a time.
        </p>

        {loading ? (
          <div className="splash-loader-bar">
            <div className="splash-loader-fill"></div>
          </div>
        ) : (
          <button 
            className="btn btn-primary fade-in"
            onClick={onProceed}
            style={{ width: '100%', padding: '14px 28px' }}
          >
            Get Started
            <ArrowRight size={18} />
          </button>
        )}

        <div className="splash-footer">
          Group ID: S26SE025 | UCP
        </div>
      </div>
    </div>
  );
}
