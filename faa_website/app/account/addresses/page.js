"use client";
import React from 'react';
import { MapPin } from 'lucide-react';

export default function AddressesPage() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <MapPin size={64} color="#a4b3a9" style={{ margin: '0 auto 1rem auto' }} />
      <h2 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '1rem' }}>My Addresses</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        This section is coming soon. You will be able to manage your shipping and billing addresses here.
      </p>
    </div>
  );
}
