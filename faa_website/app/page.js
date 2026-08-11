import HomePageClient from './components/HomePageClient';

export default async function Page() {
  // Fetch data on the server with Next.js ISR cache
  // This will cache the API responses and revalidate every 60 seconds
  const fetchConfig = { next: { revalidate: 60 } };
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  
  try {
    const [bannersRes, categoriesRes, featuredRes, specialRes] = await Promise.all([
      fetch(`${API_URL}/api/banners`, fetchConfig),
      fetch(`${API_URL}/api/categories`, fetchConfig),
      fetch(`${API_URL}/api/products?isFeatured=true`, fetchConfig),
      fetch(`${API_URL}/api/products?isSpecial=true`, fetchConfig)
    ]);

    const banners = await bannersRes.json();
    const categories = await categoriesRes.json();
    const featuredProducts = await featuredRes.json();
    const specialProducts = await specialRes.json();

    return (
      <HomePageClient 
        initialBanners={banners.slice(0, 5)} 
        initialCategories={categories}
        initialFeatured={featuredProducts}
        initialSpecial={specialProducts}
      />
    );
  } catch (error) {
    console.error("Error fetching homepage data:", error);
    // Return empty arrays as fallback if fetch fails
    return (
      <HomePageClient 
        initialBanners={[]} 
        initialCategories={[]}
        initialFeatured={[]}
        initialSpecial={[]}
      />
    );
  }
}
