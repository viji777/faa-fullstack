"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load auth state on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('customerToken');
    const storedUser = localStorage.getItem('customerData');
    if (storedToken && storedUser && storedUser !== 'undefined') {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data", e);
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        const userData = { _id: data._id, name: data.name, email: data.email, phone: data.phone, address: data.address, role: data.role };
        setToken(data.token);
        setUser(userData);
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('customerData', JSON.stringify(userData));
        toast.success("Successfully logged in!");
        return { success: true };
      } else {
        toast.error(data.message || 'Login failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
      return { success: false, message: err.message };
    }
  };

  const signup = async (name, email, password, phone) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/customer/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        const userData = { _id: data._id, name: data.name, email: data.email, phone: data.phone, address: data.address, role: data.role };
        setToken(data.token);
        setUser(userData);
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('customerData', JSON.stringify(userData));
        toast.success("Successfully signed up!");
        return { success: true };
      } else {
        toast.error(data.message || 'Signup failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      toast.error('An error occurred. Please try again.');
      return { success: false, message: err.message };
    }
  };

  const googleLogin = async (tokenId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/customer/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenId })
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        const userData = { _id: data._id, name: data.name, email: data.email, phone: data.phone, address: data.address, role: data.role };
        setToken(data.token);
        setUser(userData);
        localStorage.setItem('customerToken', data.token);
        localStorage.setItem('customerData', JSON.stringify(userData));
        toast.success("Successfully logged in with Google!");
        return { success: true };
      } else {
        toast.error(data.message || 'Google login failed');
        return { success: false, message: data.message };
      }
    } catch (err) {
      toast.error('An error occurred during Google login.');
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerData');
    toast.success("Logged out successfully");
  };

  const updateUserLocally = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    setUser(newUserData);
    localStorage.setItem('customerData', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      signup,
      googleLogin,
      logout,
      updateUserLocally,
      isAuthModalOpen,
      setAuthModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
