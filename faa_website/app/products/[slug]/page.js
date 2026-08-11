"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/ProductCard';
import Loader from '../../components/Loader';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { addToCart } = useCart();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/slug/${params.slug}`);
        if (!res.ok) {
          throw new Error('Product not found');
        }
        const data = await res.json();
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
        }
        const primaryImg = data.images?.find(img => img.isPrimary) || data.images?.[0];
        if (primaryImg) {
          setMainImage(primaryImg.url);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  useEffect(() => {
    if (product?.category?._id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products?category=${product.category._id}`)
        .then(res => res.json())
        .then(data => {
          // Filter out the current product and take up to 10
          const filtered = data.filter(p => p._id !== product._id).slice(0, 10);
          setRelatedProducts(filtered);
        })
        .catch(err => console.error("Error fetching related products:", err));
    }
  }, [product]);

  if (loading) return <Loader fullScreen={true} />;
  if (error || !product) return <div style={{ padding: '4rem', textAlign: 'center' }}>Product not found.</div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
      {/* Left side: Gallery */}
      <div className={styles.gallery}>
        <div className={styles.mainImageWrapper}>
          {mainImage ? (
            <img src={mainImage} alt={product.name} className={styles.mainImage} />
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
