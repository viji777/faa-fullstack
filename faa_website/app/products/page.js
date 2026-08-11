import ProductsClient from './ProductsClient';

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const fetchConfig = { cache: 'no-store' }; // Dynamic fetch based on URL params

  let products = [];
  let categories = [];
  let currentCategory = null;

  try {
    // 1. Fetch all categories for sidebar
    const categoriesRes = await fetch(`${API_URL}/api/categories`, { next: { revalidate: 60 } });
    if (categoriesRes.ok) {
      categories = await categoriesRes.json();
    }

    // 2. Determine current category based on searchParams
    if (resolvedSearchParams.category && categories.length > 0) {
      currentCategory = categories.find(c => c._id === resolvedSearchParams.category) || null;
    }

    // 3. Build product fetch URL based on params
    const params = new URLSearchParams();
    if (resolvedSearchParams.category) params.append('category', resolvedSearchParams.category);
    if (resolvedSearchParams.search || resolvedSearchParams.keyword) params.append('keyword', resolvedSearchParams.search || resolvedSearchParams.keyword);
    if (resolvedSearchParams.minPrice) params.append('minPrice', resolvedSearchParams.minPrice);
    if (resolvedSearchParams.maxPrice) params.append('maxPrice', resolvedSearchParams.maxPrice);
    if (resolvedSearchParams.isSpecial) params.append('isSpecial', resolvedSearchParams.isSpecial);
    if (resolvedSearchParams.isFeatured) params.append('isFeatured', resolvedSearchParams.isFeatured);

    const url = `${API_URL}/api/products${params.toString() ? `?${params.toString()}` : ''}`;
    
    const productsRes = await fetch(url, fetchConfig);
    if (productsRes.ok) {
      products = await productsRes.json();
    }
  } catch (error) {
    console.error("Error fetching products data:", error);
  }

  return (
    <ProductsClient 
      products={products}
      categories={categories}
      currentCategory={currentCategory}
      searchParams={resolvedSearchParams}
    />
  );
}
