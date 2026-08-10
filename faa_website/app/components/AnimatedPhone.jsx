"use client";

import React, { useState, useEffect, useRef } from 'react';
import { User } from 'lucide-react';
import styles from '../page.module.css';

export default function AnimatedPhone() {
  const [typedText, setTypedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const targetText = "Thank you! 😊";
  const phoneRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isTyping && typedText.length === 0) {
          setIsTyping(true);
        }
      },
      { threshold: 0.5 }
    );

    if (phoneRef.current) {
      observer.observe(phoneRef.current);
    }

    return () => {
      if (phoneRef.current) {
        observer.unobserve(phoneRef.current);
      }
    };
  }, [isTyping, typedText]);

  useEffect(() => {
    if (isTyping && typedText.length < targetText.length) {
      const timeoutId = setTimeout(() => {
        setTypedText(targetText.slice(0, typedText.length + 1));
      }, 100); // Typing speed
      return () => clearTimeout(timeoutId);
    } else if (isTyping && typedText.length === targetText.length) {
      setIsTyping(false); // Done typing
    }
  }, [isTyping, typedText]);

  return (
    <div className={styles.cssPhone} ref={phoneRef}>
      <div className={styles.phoneNotch}></div>
      <div className={styles.phoneScreen}>
        
        <div className={styles.phoneHeader}>
          <div className={styles.phoneAvatar}>
            <User size={24} />
          </div>
          <div>
            <h4>Faa Business</h4>
            <p>online</p>
          </div>
        </div>

        <div className={styles.phoneBody}>
          <div className={`${styles.chatBubble} ${styles.chatIncoming}`}>
            Hello! 👋 <br/>How can we help you today?
            <span className={styles.chatTime}>10:30 AM</span>
          </div>
          
          <div className={`${styles.chatBubble} ${styles.chatOutgoing}`}>
            Hi! I'd like to know more about your premium nuts and gift boxes.
            <span className={styles.chatTime}>10:31 AM <span className={styles.readTicks}>✓✓</span></span>
          </div>

          <div className={`${styles.chatBubble} ${styles.chatIncoming}`}>
            Sure! Our team will share all the details with you.
            <span className={styles.chatTime}>10:32 AM</span>
          </div>

          <div className={`${styles.chatBubble} ${styles.chatOutgoing}`}>
            {typedText}
            {(isTyping || typedText.length === 0) && (
              <span className={styles.typingCursor}></span>
            )}
            {typedText === targetText && (
              <span className={styles.chatTime}>10:32 AM <span className={styles.readTicks}>✓✓</span></span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
