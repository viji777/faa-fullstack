"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import styles from './page.module.css';

export default function ProductsClient({ 
  products = [], 
  categories = [], 
  currentCategory = null,
  searchParams = {} 
}) {
  const router = useRouter();
  
  const categoryId = searchParams.category;
  const searchQuery = searchParams.search || searchParams.keyword;
  const isSpecialParam = searchParams.isSpecial;
  const isFeaturedParam = searchParams.isFeatured;

  const [minPrice, setMinPrice] = useState(searchParams.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.maxPrice || '');

  const handlePriceFilter = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    
    // Preserve existing params
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== 'minPrice' && key !== 'maxPrice') {
        params.set(key, value);
      }
    });
    
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    
    router.push(`/products?${params.toString()}`);
  };

  let displayTitle = 'Products';
  if (currentCategory) displayTitle = currentCategory.name;
  else if (searchQuery) displayTitle = 'Search Results';
  else if (isSpecialParam) displayTitle = "Faa's Special Products";
  else if (isFeaturedParam) displayTitle = "Featured Products";

  return (
    <div className={styles.main}>
      {/* Category Banner */}
      {currentCategory && currentCategory.image ? (
        <div 
          className={styles.categoryBanner}
          style={{ backgroundImage: `url(${currentCategory.image})` }}
        >
          <div className={styles.bannerOverlay}></div>
          <h1 className={styles.bannerTitle}>{currentCategory.name}</h1>
        </div>
      ) : (
        <div className={styles.bannerFallback}>
          <h1 className={styles.bannerTitle}>
            {displayTitle}
          </h1>
        </div>
      )}

      <div className={styles.container}>
        {/* Sidebar */}
        {!isSpecialParam && !isFeaturedParam && (
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>Categories</h2>
            <div className={styles.categoryList}>
              <Link 
                href="/products" 
                className={`${styles.categoryLink} ${!categoryId ? styles.activeCategory : ''}`}
              >
                All Products
              </Link>
              {categories.map(cat => (
                <Link 
                  key={cat._id}
                  href={`/products?category=${cat._id}`}
                  className={`${styles.categoryLink} ${categoryId === cat._id ? styles.activeCategory : ''}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className={styles.filterSection}>
              <h2 className={styles.sidebarTitle}>Filter by Price</h2>
              <form onSubmit={handlePriceFilter} className={styles.priceFilterForm}>
                <div className={styles.priceInputs}>
                  <input 
                    type="number" 
                    placeholder="Min" 
                    value={minPrice} 
                    onChange={e => setMinPrice(e.target.value)} 
                    className={styles.priceInput}
                  />
                  <span className={styles.priceSeparator}>-</span>
                  <input 
                    type="number" 
                    placeholder="Max" 
                    value={maxPrice} 
                    onChange={e => setMaxPrice(e.target.value)} 
                    className={styles.priceInput}
                  />
                </div>
                <button type="submit" className={styles.applyBtn}>Apply</button>
              </form>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <div className={styles.content}>
          <div className={styles.productsHeader}>
            <h2 className={styles.productsTitle}>
              {displayTitle}
            </h2>
            <span className={styles.productCount}>
              {products.length} {products.length === 1 ? 'Product' : 'Products'} found
            </span>
          </div>

          {products.length > 0 ? (
            <div className={styles.productsGrid}>
              {products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateIcon}>🌱</div>
              <h3>Products coming soon</h3>
              <p>We're currently restocking our premium selection for this category. Check back shortly!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
