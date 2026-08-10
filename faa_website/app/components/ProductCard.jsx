import React from 'react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import styles from './ProductCard.module.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
  const minPrice = product.variants?.length ? Math.min(...product.variants.map(v => v.price)) : 0;

  return (
    <div className={styles.card}>
      <Link href={`/products/${product.slug}`} className={styles.imageWrapper}>
        {primaryImage ? (
          <img src={primaryImage.url} alt={product.name} className={styles.image} />
        ) : (
          <div className={styles.placeholderImage}>Faa</div>
        )}
        
        <div className={styles.overlay}>
          <span className={styles.viewBtn}>Quick View</span>
        </div>
        
      </Link>
      
      <div className={styles.content}>
        <p className={styles.category}>{product.category?.name || 'Premium'}</p>
        <h3 className={styles.title}>
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <p className={styles.price}>₹{minPrice}</p>
        <button className={styles.addToCartBtn} onClick={(e) => {
          e.preventDefault();
          addToCart(product);
        }}>Add to Cart</button>
      </div>
    </div>
  );
};

export default ProductCard;
