"use client";

import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/ProductCard';
import styles from './ProductDetail.module.css';

export default function ProductDetailClient({ product, relatedProducts = [] }) {
  const { addToCart } = useCart();
  
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  
  const primaryImg = product?.images?.find(img => img.isPrimary) || product?.images?.[0];
  const [mainImage, setMainImage] = useState(primaryImg ? primaryImg.url : null);

  if (!product) return <div style={{ padding: '4rem', textAlign: 'center' }}>Product not found.</div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
      {/* Left side: Gallery */}
      <div className={styles.gallery}>
        <div className={styles.mainImageWrapper}>
          {mainImage ? (
            <img 
              src={mainImage} 
              alt={product.name} 
              className={styles.mainImage}
              fetchPriority="high"
              loading="eager"
            />
          ) : (
            <div className={styles.placeholderImage}>Faa</div>
          )}
        </div>
        {product.images && product.images.length > 1 && (
          <div className={styles.thumbnails}>
            {product.images.map((img, index) => (
              <div 
                key={index} 
                className={`${styles.thumbnailWrapper} ${mainImage === img.url ? styles.active : ''}`}
                onClick={() => setMainImage(img.url)}
              >
                <img src={img.url} alt={`${product.name} thumbnail ${index + 1}`} className={styles.thumbnailImage} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right side: Details */}
      <div className={styles.details}>
        <p className={styles.category}>{product.category?.name || 'Premium Product'}</p>
        <h1 className={styles.title}>{product.name}</h1>
        
        <div className={styles.price}>
          ₹{selectedVariant ? selectedVariant.price : (product.variants?.[0]?.price || 0)}
        </div>
        
        <p className={styles.description}>{product.description}</p>
        
        {product.variants && product.variants.length > 0 && (
          <div className={styles.variantsContainer}>
            <h3 className={styles.variantsTitle}>Select Size:</h3>
            <div className={styles.variantsList}>
              {product.variants.map((variant, index) => (
                <button
                  key={index}
                  className={`${styles.variantBtn} ${selectedVariant?._id === variant._id ? styles.active : ''}`}
                  onClick={() => setSelectedVariant(variant)}
                >
                  {variant.size}
                </button>
              ))}
            </div>
          </div>
        )}

        <button 
          className={styles.addToCartBtn}
          onClick={() => {
            addToCart(product, selectedVariant);
          }}
        >
          Add to Cart
        </button>
      </div>
      </div>
      
      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className={styles.relatedSection}>
          <h2 className={styles.relatedTitle}>Related Products</h2>
          <div className={styles.relatedSlider}>
            {relatedProducts.map(rel => (
              <div key={rel._id} className={styles.slideItem}>
                <ProductCard product={rel} />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
