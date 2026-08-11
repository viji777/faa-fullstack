"use client";
import React from 'react';
import Link from 'next/link';
import { LayoutGrid } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <LayoutGrid size={64} color="#a4b3a9" style={{ margin: '0 auto 1rem auto' }} />
      <h2 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '1rem' }}>Welcome to your Dashboard</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
      </p>
      <Link href="/account/orders" style={{ display: 'inline-block', backgroundColor: 'var(--color-primary-dark, #1a3c2a)', color: 'white', padding: '0.75rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '500' }}>
        View Recent Orders
      </Link>
    </div>
  );
}
