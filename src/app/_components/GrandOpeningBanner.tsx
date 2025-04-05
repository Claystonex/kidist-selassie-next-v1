'use client';

import { useState, useEffect } from 'react';
import ConfettiExplosion from 'react-confetti-explosion';
import styles from '@/styles/GrandOpeningBanner.module.css';

const GrandOpeningBanner = () => {
  const [isExploding, setIsExploding] = useState(false);

  // Trigger confetti effect
  useEffect(() => {
    // Safe to run only in browser
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setIsExploding(true);
        setTimeout(() => setIsExploding(false), 2500);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className={styles.bannerContainer}>

      {/* Simple ticker like CHURCH NEWS */}
      <div className={styles.marquee}>
        <div className={styles.marqueeInner}>
          {/* Just enough items to fill the screen width plus some extra */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.marqueeItem}>
              ⋆ <span className={styles.grandOpening}>GRAND OPENING</span> ⋆
              <span className={styles.welcomeText}>Welcome to our community, we're so glad to grow with you</span>
            </div>
          ))}
        </div>
      </div>

      {/* Confetti effect */}
      {isExploding && (
        <div className={styles.confettiContainer}>
          <ConfettiExplosion
            force={0.8}
            duration={2500}
            particleCount={60}
            width={800}
          />
        </div>
      )}
    </div>
  );
};

export default GrandOpeningBanner;
