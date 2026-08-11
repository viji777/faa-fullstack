"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import styles from './page.module.css';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryId = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const isSpecialParam = searchParams.get('isSpecial');
  const isFeaturedParam = searchParams.get('isFeatured');

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [minPrice, setMinPrice] = useState(minPriceParam || '');
  const [maxPrice, setMaxPrice] = useState(maxPriceParam || '');

  const handlePriceFilter = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');
    
    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');
    
    router.push(`/products?${params.toString()}`);
  };

  useEffect(() => {
    // Fetch categories for sidebar
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`)
      .then(res => res.json())
      .then(data => {
        setCategories(data);
        if (categoryId) {
          const found = data.find(c => c._id === categoryId);
          if (found) setCurrentCategory(found);
        } else {
          setCurrentCategory(null);
        }
      })
      .catch(err => console.error(err));
  }, [categoryId]);

  useEffect(() => {
    setLoading(true);
    let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`;
    const params = new URLSearchParams();
    
    if (categoryId) params.append('category', categoryId);
    if (searchQuery) params.append('keyword', searchQuery);
    if (minPriceParam) params.append('minPrice', minPriceParam);
    if (maxPriceParam) params.append('maxPrice', maxPriceParam);
    if (isSpecialParam) params.append('isSpecial', isSpecialParam);
    if (isFeaturedParam) params.append('isFeatured', isFeaturedParam);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [categoryId, searchQuery, minPriceParam, maxPriceParam, isSpecialParam, isFeaturedParam]);

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

          {loading ? (
            <Loader fullScreen={false} />
          ) : products.length > 0 ? (
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

export default function ProductsPage() {
  return (
    <Suspense fallback={<Loader fullScreen={true} />}>
      <ProductsContent />
    </Suspense>
  );
}
