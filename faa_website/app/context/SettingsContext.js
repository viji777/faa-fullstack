"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    phone: '917200407943',
    email: 'faabusinessgroup@gmail.com',
    logoUrl: '/faa_logo.png'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setSettings({
              phone: data.phone || '917200407943',
              email: data.email || 'faabusinessgroup@gmail.com',
              logoUrl: data.logoUrl || '/faa_logo.png'
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
