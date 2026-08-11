import ProductDetailClient from './ProductDetailClient';

export default async function ProductDetail({ params }) {
  const { slug } = params;
  const fetchConfig = { next: { revalidate: 60 } };
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  let product = null;
  let relatedProducts = [];
  let debugError = null;
  let attemptUrl = null;

  try {
    attemptUrl = `${API_URL}/api/products/slug/${slug}`;
    // 1. Fetch the product by slug
    const res = await fetch(attemptUrl, fetchConfig);
    if (res.ok) {
      product = await res.json();
    } else {
      debugError = `Failed to fetch: ${res.status} ${res.statusText}. URL: ${attemptUrl}`;
    }

    // 2. Fetch related products based on category
    if (product && product.category?._id) {
      const relatedRes = await fetch(`${API_URL}/api/products?category=${product.category._id}`, fetchConfig);
      if (relatedRes.ok) {
        const relatedData = await relatedRes.json();
        // Filter out the current product and take up to 10
        relatedProducts = relatedData.filter(p => p._id !== product._id).slice(0, 10);
      }
    }
  } catch (error) {
    debugError = `Fetch caught error: ${error.message}. URL: ${attemptUrl}`;
    console.error("Error fetching product details:", error);
  }

  return (
    <ProductDetailClient 
      product={product} 
      relatedProducts={relatedProducts} 
      debugError={debugError}
    />
  );
}
