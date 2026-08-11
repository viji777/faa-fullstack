"use client";
import React from 'react';
import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <User size={64} color="#a4b3a9" style={{ margin: '0 auto 1rem auto' }} />
      <h2 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '1rem' }}>My Profile</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        This section is coming soon. You will be able to update your name, email, and phone number here.
      </p>
    </div>
  );
}
