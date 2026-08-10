"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedCart = localStorage.getItem('faa_cart');
    if (storedCart) {
      try {
        setCartItems(JSON.parse(storedCart));
      } catch (e) {
        console.error("Failed to parse cart data", e);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('faa_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, mounted]);

  const addToCart = (product, variant = null, quantity = 1) => {
    // Check if it exists in current state to show the right toast
    const exists = cartItems.some(item => 
      item.product._id === product._id && 
      item.variant?._id === variant?._id
    );

    if (exists) {
      toast.success(`Updated ${product.name} quantity in cart!`);
    } else {
      toast.success(`Added ${product.name} to cart!`);
    }

    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(item => 
        item.product._id === product._id && 
        item.variant?._id === variant?._id
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prev];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        return [...prev, {
          id: `${product._id}-${variant?._id || 'default'}`,
          product,
          variant,
          quantity
        }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    toast.success("Item removed from cart");
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => {
    const price = item.variant ? item.variant.price : (item.product.variants?.[0]?.price || 0);
    return total + (price * item.quantity);
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
