"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Loader from '../components/Loader';
import { LayoutGrid, ClipboardList, MapPin, User, Lock, LogOut } from 'lucide-react';
import styles from './layout.module.css';

export default function AccountLayoutClient({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  if (!mounted || !user) {
    return <Loader fullScreen={true} />;
  }

  const navItems = [
    { name: 'My Orders', path: '/account/orders', icon: ClipboardList },
    { name: 'My Addresses', path: '/account/addresses', icon: MapPin },
    { name: 'My Profile', path: '/account/profile', icon: User },
    { name: 'Change Password', path: '/account/security', icon: Lock },
  ];

  // Helper to get initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getPageTitle = () => {
    const activeItem = navItems.find(item => pathname.includes(item.path));
    return activeItem ? activeItem.name : 'Account';
  };

  return (
    <div className={styles.layoutWrapper}>
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <h1 className={styles.pageTitle}>{getPageTitle()}</h1>
          <div className={styles.breadcrumbs}>
            <Link href="/">Home</Link>
            <span className={styles.separator}>&gt;</span>
            <span className={styles.currentCrumb}>{getPageTitle()}</span>
          </div>
        </div>
      </div>

      <div className={styles.mainContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.userProfile}>
            <div className={styles.avatar}>
              {getInitials(user.name)}
            </div>
            <div className={styles.userInfo}>
              <h3 className={styles.userName}>{user.name}</h3>
              <p className={styles.userEmail}>{user.email}</p>
            </div>
          </div>

          <nav className={styles.navMenu}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.includes(item.path);
              return (
                <Link 
                  key={item.name} 
                  href={item.path} 
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <Icon size={20} className={styles.navIcon} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <div className={styles.divider}></div>
            
            <button onClick={() => { logout(); router.push('/'); }} className={styles.navItem}>
              <LogOut size={20} className={styles.navIcon} />
              <span>Logout</span>
            </button>
          </nav>
        </aside>

        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
      
      <div className={styles.featuresBar}>
        <div className={styles.featureItem}>
          <div className={styles.featureIconWrap}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
          </div>
          <div>
            <h4>Premium Quality</h4>
            <p>Finest & handpicked products</p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.featureIconWrap}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path></svg>
          </div>
          <div>
            <h4>100% Natural</h4>
            <p>Pure, healthy & nutritious</p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.featureIconWrap}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="12" x="2" y="6" rx="2" ry="2"></rect><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle><path d="M18 6V4a2 2 0 0 0-2-2h-3.5"></path></svg>
          </div>
          <div>
            <h4>Fast Delivery</h4>
            <p>On-time, every time</p>
          </div>
        </div>
        <div className={styles.featureItem}>
          <div className={styles.featureIconWrap}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
          </div>
          <div>
            <h4>Secure Packaging</h4>
            <p>Safe & hygienic delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
}
