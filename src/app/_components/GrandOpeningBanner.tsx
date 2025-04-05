'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaScissors } from 'react-icons/fa';
import ConfettiExplosion from 'react-confetti-explosion';
import styles from '@/styles/GrandOpeningBanner.module.css';

interface GrandOpeningBannerProps {
  onClose: () => void;
}

const GrandOpeningBanner = ({ onClose }: GrandOpeningBannerProps) => {
  const [isExploding, setIsExploding] = useState(false);
  const [showRibbon, setShowRibbon] = useState(true);
  const [hasBeenShown, setHasBeenShown] = useState(false);

  // Check if banner has been shown before using localStorage
  useEffect(() => {
    const hasShown = localStorage.getItem('grandOpeningShown');
    if (hasShown) {
      setHasBeenShown(true);
    }
  }, []);

  // Store the fact that the banner has been shown
  const handleClose = () => {
    localStorage.setItem('grandOpeningShown', 'true');
    onClose();
  };

  // Start animation sequence when component mounts
  useEffect(() => {
    const timeout1 = setTimeout(() => {
      setShowRibbon(false);
      setIsExploding(true);
      
      // Stop explosion effect after 2 seconds
      const timeout2 = setTimeout(() => {
        setIsExploding(false);
      }, 2000);
      
      return () => clearTimeout(timeout2);
    }, 1500);
    
    return () => clearTimeout(timeout1);
  }, []);

  if (hasBeenShown) {
    return null; // Don't show if already seen
  }

  return (
    <div className={styles.overlay}>
      <motion.div 
        className={styles.modal}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <button className={styles.closeButton} onClick={handleClose}>
          <FaTimes />
        </button>
        
        <div className={styles.content}>
          {/* Ribbon and scissors animation */}
          <div className={styles.ribbonContainer}>
            {showRibbon && (
              <div className={styles.ribbon}>
                <div className={styles.ribbonLeft}></div>
                <div className={styles.ribbonRight}></div>
              </div>
            )}
            
            <motion.div 
              className={styles.scissors}
              initial={{ x: -100 }}
              animate={{ x: 0 }}
              transition={{ duration: 1.5 }}
            >
              <FaScissors size={32} />
            </motion.div>
            
            {/* Confetti explosion */}
            {isExploding && (
              <div className={styles.confettiContainer}>
                <ConfettiExplosion 
                  force={0.8}
                  duration={3000}
                  particleCount={100}
                  width={1600}
                />
              </div>
            )}
          </div>
          
          {/* Banner text */}
          <motion.div 
            className={styles.bannerText}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <motion.h1 
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.2, delay: 2, times: [0, 0.5, 1] }}
              className={styles.title}
            >
              GRAND OPENING
            </motion.h1>
            
            <motion.p 
              className={styles.welcomeText}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 1 }}
            >
              Welcome to our community, we're so glad to grow with you.
            </motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default GrandOpeningBanner;
