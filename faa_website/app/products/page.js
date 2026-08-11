import ProductsClient from './ProductsClient';

export default async function ProductsPage({ searchParams }) {
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
    if (searchParams.category && categories.length > 0) {
      currentCategory = categories.find(c => c._id === searchParams.category) || null;
    }

    // 3. Build product fetch URL based on params
    const params = new URLSearchParams();
    if (searchParams.category) params.append('category', searchParams.category);
    if (searchParams.search || searchParams.keyword) params.append('keyword', searchParams.search || searchParams.keyword);
    if (searchParams.minPrice) params.append('minPrice', searchParams.minPrice);
    if (searchParams.maxPrice) params.append('maxPrice', searchParams.maxPrice);
    if (searchParams.isSpecial) params.append('isSpecial', searchParams.isSpecial);
    if (searchParams.isFeatured) params.append('isFeatured', searchParams.isFeatured);

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
      searchParams={searchParams}
    />
  );
}
