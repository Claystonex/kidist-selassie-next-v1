'use client';

import styles from '@/styles/GrandOpeningBanner.module.css';

const GrandOpeningTwoBanner = () => {
  // Bible verses to scroll
  const verses = [
    {
      reference: 'John 13:34-35',
      text: '"A new commandment I give to you, that you love one another; as I have loved you, that you also love one another. By this all will know that you are My disciples, if you have love for one another."'
    },
    {
      reference: '1 John 4:7',
      text: '"Beloved, let us love one another, for love is of God, and everyone who loves is born of God and knows God."'
    },
    {
      reference: 'Isaiah 41:10',
      text: '"Do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand."'
    }
  ];

  return (
    <div className={styles.bannerContainer}>
      {/* Bible verses ticker with slower animation */}
      <div className={styles.marquee}>
        <div className={`${styles.marqueeInner} ${styles.marqueeSlower}`}>
          {/* Multiple instances for continuous scrolling */}
          {Array.from({ length: 4 }).map((_, i) => (
            verses.map((verse, verseIndex) => (
              <div key={`${i}-${verseIndex}`} className={styles.verseItem}>
                <span className={styles.verseReference}>{verse.reference}:</span>
                <span className={styles.verseText}>{verse.text}</span>
              </div>
            ))
          ))}
        </div>
      </div>
    </div>
  );
};

export default GrandOpeningTwoBanner;
