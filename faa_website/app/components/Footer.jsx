import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.curveDivider}>
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" className={styles.curveSvg}>
          <path d="M0,100 L1440,100 Q720,0 0,100 Z" fill="var(--color-primary-dark)" />
        </svg>
      </div>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <img src="/faa_logo.png" alt="Faa Nuts & Dates" className={styles.logoImg} />
            </Link>
            <p className={styles.description}>
              Discover the finest selection of premium nuts, dates, and dry fruits. Sourced globally, delivered fresh to your doorstep. Experience health and luxury in every bite.
            </p>
          </div>
          
          <div className={styles.linksColumn}>
            <h4 className={styles.heading}>Quick Links</h4>
            <ul className={styles.linkList}>
              <li><Link href="/" className={styles.link}>Home</Link></li>
              <li><Link href="/#about" className={styles.link}>About Us</Link></li>
              <li><Link href="/products" className={styles.link}>Shop All</Link></li>
              <li><Link href="/#benefits" className={styles.link}>Health Benefits</Link></li>
            </ul>
          </div>
          

          <div className={styles.contactColumn}>
            <h4 className={styles.heading}>Contact Us</h4>
            <div className={styles.contactItem}>
              <strong>Email:</strong> faabusinessgroup@gmail.com
            </div>
            <div className={styles.contactItem}>
              <strong>Phone:</strong> +91 72004 07943
            </div>
            <div className={styles.contactItem}>
              <strong>Address:</strong> 18/1, Ayyanarpuram 3rd Street, Sekkalai Road (Water Tank area), Karaikudi, Tamil Nadu
            </div>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p>&copy; {new Date().getFullYear()} Faa Nuts & Dates. All rights reserved.</p>
          <div className={styles.socialIcons}>
            <a href="#" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" aria-label="WhatsApp">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.473-.15-.673.15-.197.295-.771.966-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.3.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.21 2.095 3.18 5.077 4.469 2.982 1.29 2.982.855 3.529.81.547-.045 1.767-.72 2.016-1.426.248-.705.248-1.296.173-1.426-.074-.135-.272-.21-.57-.36zM12.002 22.195h-.01c-1.62 0-3.21-.435-4.605-1.26l-.33-.195-3.42.885.915-3.33-.21-.345A9.877 9.877 0 0 1 2.128 12.3c0-5.43 4.425-9.855 9.874-9.855 2.625 0 5.1 1.02 6.96 2.895a9.855 9.855 0 0 1 2.895 6.96c0 5.43-4.425 9.855-9.855 9.855z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
