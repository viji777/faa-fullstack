"use client";
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { LayoutGrid, ClipboardList, MapPin, User } from 'lucide-react';
import styles from '../profile/page.module.css';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className={styles.container} style={{ maxWidth: '800px' }}>
      <div className={styles.header}>
        <div className={styles.iconWrap}>
          <LayoutGrid size={32} />
        </div>
        <div>
          <h2 className={styles.title}>Hello, {user.name?.split(' ')[0]}!</h2>
          <p className={styles.subtitle}>Welcome to your account dashboard</p>
        </div>
      </div>

      <div style={{ marginBottom: '2rem', color: '#555', lineHeight: '1.6' }}>
        From your account dashboard you can easily check &amp; view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        <Link href="/account/orders" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '2rem', backgroundColor: '#fcfcfb', border: '1px solid #eaeaea', borderRadius: '12px', textAlign: 'center', transition: 'all 0.2s ease', cursor: 'pointer' }}
               onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary-dark)'}
               onMouseOut={e => e.currentTarget.style.borderColor = '#eaeaea'}
          >
            <ClipboardList size={40} color="var(--color-primary-dark)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>My Orders</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#777' }}>Track, return, or buy things again</p>
          </div>
        </Link>

        <Link href="/account/addresses" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '2rem', backgroundColor: '#fcfcfb', border: '1px solid #eaeaea', borderRadius: '12px', textAlign: 'center', transition: 'all 0.2s ease', cursor: 'pointer' }}
               onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary-dark)'}
               onMouseOut={e => e.currentTarget.style.borderColor = '#eaeaea'}
          >
            <MapPin size={40} color="var(--color-primary-dark)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>My Address</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#777' }}>Edit addresses for orders</p>
          </div>
        </Link>

        <Link href="/account/profile" style={{ textDecoration: 'none' }}>
          <div style={{ padding: '2rem', backgroundColor: '#fcfcfb', border: '1px solid #eaeaea', borderRadius: '12px', textAlign: 'center', transition: 'all 0.2s ease', cursor: 'pointer' }}
               onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary-dark)'}
               onMouseOut={e => e.currentTarget.style.borderColor = '#eaeaea'}
          >
            <User size={40} color="var(--color-primary-dark)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>My Profile</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#777' }}>Edit login, name, and mobile number</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
