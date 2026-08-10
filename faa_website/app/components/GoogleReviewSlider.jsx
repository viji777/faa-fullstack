"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import styles from './GoogleReviewSlider.module.css';

// Using corner_image.png for the decorative nuts at the bottom corner
import decorativeNuts from '../src/corner_image.png';

const reviews = [
  {
    id: 9,
    name: 'MANISH KUMAR',
    time: '2 months ago',
    text: 'Had a really good experience with their online service. The nuts and dry fruits were fresh, good quality, and neatly packed. The hampers were beautifully arranged with great attention to detail and looked exactly as expected. The delivery was prompt and everything reached safely without any damage.\n\nReally impressed with the quality, packaging, presentation, and service. A great place for premium nuts and beautifully curated gift hampers. Highly recommended for both personal use and gifting!',
    stars: 5,
    avatar: '/male_avatar.png',
  },
  {
    id: 10,
    name: 'Sabana Basith',
    time: 'a month ago',
    text: 'Quality👌👌👌',
    stars: 5,
    avatar: '/female_avatar.png',
  },
  {
    id: 11,
    name: 'Viji Ruth',
    time: '2 months ago',
    text: 'Best quality nuts I have ever purchased. Highly recommend to everyone.',
    stars: 5,
    avatar: '/female_avatar.png',
  },
  {
    id: 12,
    name: 'bharath raj',
    time: 'Recently',
    text: 'Recently I purchased packaging was good..nuts are fresh',
    stars: 5,
    avatar: '/male_avatar.png',
  }
];

export default function GoogleReviewSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerView, setItemsPerView] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1000) setItemsPerView(3);
      else if (window.innerWidth >= 768) setItemsPerView(2);
      else setItemsPerView(1);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, reviews.length - itemsPerView);

  // Ensure currentIndex is within bounds if window resizes
  useEffect(() => {
    if (currentIndex > maxIndex) setCurrentIndex(maxIndex);
  }, [maxIndex, currentIndex]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  useEffect(() => {
    if (maxIndex <= 0) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(timer);
  }, [nextSlide, maxIndex]);

  const showControls = maxIndex > 0;

  return (
    <>
      <div className={styles.headerContainer}>
        <a 
          href="https://www.google.com/search?q=Faa+Nuts+and+Hampers+Karaikudi"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.ratingContainer}
          style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
          title="See our reviews on Google"
        >
          <div className={styles.ratingText}>4.9 Rating</div>
          <div className={styles.headerStars}>
            {'★★★★★'.split('').map((star, i) => (
              <span key={i}>{star}</span>
            ))}
          </div>
        </a>
        <a 
          href="https://share.google/oAbOFDo501pWCyiU0" 
          target="_blank" 
          rel="noopener noreferrer" 
          className={styles.writeReviewBtn}
        >
          Write a Review
        </a>
      </div>
      <div className={styles.sliderContainer}>
        {showControls && (
          <button onClick={prevSlide} className={`${styles.navButton} ${styles.prevButton}`} aria-label="Previous review">
            <ChevronLeft size={24} />
          </button>
        )}

      <div className={styles.trackWrapper}>
        <div 
          className={styles.track}
          style={{ '--current-index': currentIndex }}
        >
          {reviews.map((review, index) => {
            const isActive = index === currentIndex;
            
            return (
              <div 
                key={review.id} 
                className={`${styles.slide} ${isActive ? styles.active : ''}`}
              >
                <div className={styles.card}>
                  <div className={styles.quoteIcon}>“</div>
                  
                  <div className={styles.cardHeader}>
                    <div className={styles.userInfo}>
                      <img src={review.avatar} alt={review.name} className={styles.avatar} />
                      <div>
                        <h4 className={styles.userName}>{review.name}</h4>
                        <p className={styles.timeAgo}>{review.time}</p>
                      </div>
                    </div>
                    
                    {/* Google Logo SVG */}
                    <svg className={styles.googleLogo} viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  
                  <div className={styles.stars}>
                    {'★★★★★'.split('').map((star, i) => (
                      <span key={i}>{star}</span>
                    ))}
                  </div>
                  
                  <p className={styles.reviewText}>{review.text}</p>
                  
                  <div className={styles.cardFooter}>
                    <div className={styles.verifiedBadge}>
                      <CheckCircle2 size={14} /> Verified Buyer
                    </div>
                  </div>
                  
                  {/* Decorative nuts at bottom right */}
                  <img src={decorativeNuts.src} alt="" className={styles.decorativeNuts} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {showControls && (
        <>
          <button onClick={nextSlide} className={`${styles.navButton} ${styles.nextButton}`} aria-label="Next review">
            <ChevronRight size={24} />
          </button>

          <div className={styles.dots}>
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button 
                key={index}
                className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
    </>
  );
}
