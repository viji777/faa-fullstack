"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, User, Phone, MapPin, MessageSquare, Send, Leaf, LeafyGreen, HeartPulse, Brain, Zap, ShieldCheck, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProductCard from './ProductCard';
import GoogleReviewSlider from './GoogleReviewSlider';
import styles from '../page.module.css';
import shopByCategoryBg from '../src/Shop by category bg.png';
import aboutFaaWebp from '../src/About Faa.webp';
import aboutFaaBg from '../src/About me faa bg.png';
import faaPng from '../src/Faa.png';
import pickfaa1 from '../src/pickfaa1.png';
import pickfaa2 from '../src/pickfaa2.png';
import pickfaa3 from '../src/pickfaa3.png';
import pickfaa4 from '../src/pickfaa4.png';
import pickfaa5 from '../src/pickfaa5.png';

export default function HomePageClient({ initialBanners = [], initialCategories = [], initialFeatured = [], initialSpecial = [] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactAddress, setContactAddress] = useState('');
  const [contactDescription, setContactDescription] = useState('');
  const [contactStatus, setContactStatus] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const router = useRouter();

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactPhone || !contactAddress || !contactDescription) {
      setContactStatus('Please fill all fields.');
      return;
    }
    setIsSubmittingContact(true);
    setContactStatus('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: contactName, phone: contactPhone, address: contactAddress, description: contactDescription })
      });
      const data = await res.json();
      if (data.success) {
        setContactStatus('Message sent successfully!');
        setContactName('');
        setContactPhone('');
        setContactAddress('');
        setContactDescription('');
      } else {
        setContactStatus(data.message || 'Failed to send message.');
      }
    } catch (err) {
      console.error(err);
      setContactStatus('An error occurred. Please try again.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleBannerClick = (banner) => {
    if (banner.linkType === 'Category' && banner.linkCategory) {
      const categoryId = typeof banner.linkCategory === 'object' ? banner.linkCategory._id : banner.linkCategory;
      router.push(`/products?category=${categoryId}`);
    } else if (banner.linkType === 'Product' && banner.linkProduct) {
      const productId = typeof banner.linkProduct === 'object' ? banner.linkProduct._id : banner.linkProduct;
      router.push(`/product/${productId}`);
    }
  };

  // Auto-advance hero carousel
  useEffect(() => {
    if (initialBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === initialBanners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [initialBanners.length]);

  // Soft pastel colors: green, red, blue, orange, pink
  const pastelColors = ['#c8e6c9', '#ffcdd2', '#bbdefb', '#ffe0b2', '#f8bbd0'];
  // Theme colors for the value prop cards (from design)
  const cardColors = ['#1a432b', '#ff7b7b', '#609946', '#f39c12', '#8e7cc3'];

  return (
    <div className={styles.main}>
      {/* 1. HERO BANNER CAROUSEL */}
      <section className={styles.heroSection}>
        {initialBanners.length > 0 ? (
          <div className={styles.carouselContainer}>
            <div 
              className={styles.carouselTrack} 
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {initialBanners.map((banner, index) => (
                  <div 
                    key={banner._id} 
                    className={styles.slide}
                    style={{ cursor: banner.linkType !== 'None' ? 'pointer' : 'default' }}
                    onClick={() => handleBannerClick(banner)}
                  >
                    <picture>
                      <source media="(max-width: 768px)" srcSet={banner.mobileImage || banner.tabletImage || banner.image} />
                      <source media="(max-width: 1024px)" srcSet={banner.tabletImage || banner.image} />
                      <img 
                        src={banner.image} 
                        alt="Faa Nuts Hero Banner" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        fetchPriority={index === 0 ? "high" : "auto"}
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </picture>
                  </div>
              ))}
            </div>
            
            <div className={styles.carouselDots}>
              {initialBanners.map((_, index) => (
                <button 
                  key={index} 
                  className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.heroFallback} />
        )}
      </section>

      {/* 2. CATEGORIES */}
      {initialCategories.length > 0 && (
        <section 
          className={styles.section}
          style={{
            backgroundImage: `url('${shopByCategoryBg.src}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            paddingBottom: '5rem' /* Added a little space before the wave */
          }}
        >
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2>Shop by Category</h2>
            </div>
            
            <div className={styles.categoriesGrid}>
              {initialCategories.map((cat, index) => (
                <motion.div 
                  key={cat._id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/products?category=${cat._id}`} className={styles.categoryCard}>
                  <div 
                    className={styles.categoryIconWrapper}
                    style={{ '--pastel-bg': pastelColors[index % pastelColors.length] }}
                  >
                    {cat.icon ? (
                      <img src={cat.icon} alt={cat.name} className={styles.categoryIconImg} />
                    ) : cat.image ? (
                      <img src={cat.image} alt={cat.name} className={styles.categoryIconImg} style={{ borderRadius: '12px', objectFit: 'cover' }} />
                    ) : (
                      <div className={styles.categoryPlaceholder}>{cat.name.charAt(0)}</div>
                    )}
                  </div>
                  <h3 className={styles.categoryName}>{cat.name}</h3>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
          <div className={styles.waveDivider}>
            <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
              <path d="M0,60 C140,130 280,0 420,60 C560,120 700,10 840,60 C980,110 1120,0 1260,60 C1320,90 1380,105 1440,60 L1440,120 L0,120 Z" fill="var(--color-primary-dark)"></path>
            </svg>
          </div>
        </section>
      )}

      {/* 3. FAA'S SPECIAL */}
      {initialSpecial.length > 0 && (
        <section className={`${styles.section} ${styles.bgDark}`} style={{ paddingTop: '2rem' }}>
          <div className={styles.container}>
            <div className={styles.sectionHeaderDark}>
              <h2>Faa's Special</h2>
              <p>Exclusive special from our products.</p>
              <Link href="/products?isSpecial=true" className={styles.linkBtn}>View All</Link>
            </div>
            <div className={styles.productsGrid}>
              {initialSpecial.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: -40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. THE STORY OF FAA */}
      <section 
        id="about" 
        className={styles.section}
        style={{
          backgroundImage: `url('${aboutFaaBg.src}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className={styles.container}>
          <div className={styles.aboutGrid}>
            <motion.div 
              className={styles.aboutContent}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <span className={styles.subtitle}>Our Heritage</span>
              <h2>The Story of Faa</h2>
              <p>
                Founded on the principles of purity and premium quality, Faa brings you the finest selection of nuts, dates, and dry fruits. Our journey began with a simple desire: to source the most nutritious and delicious natural treats from the best farms globally.
              </p>
              <p>
                Every product that bears the Faa name goes through rigorous quality checks to ensure you receive nothing but perfection. Experience luxury in every bite.
              </p>
            </motion.div>
            <motion.div 
              className={styles.aboutImageWrapper}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            >
              <img src={aboutFaaWebp.src} alt="The Story of Faa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED PRODUCTS */}
      {initialFeatured.length > 0 && (
        <section className={`${styles.section} ${styles.bgDark}`}>
          <div className={styles.container}>
            <div className={styles.sectionHeaderDark}>
              <h2>Featured Products</h2>
              <p>Hand-picked premium quality products just for you.</p>
              <Link href="/products?isFeatured=true" className={styles.linkBtn}>View All</Link>
            </div>
            <div className={styles.productsGrid}>
              {initialFeatured.slice(0, 4).map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. WHY PICK FROM FAA (MERGED BANNER + CARDS) */}
      <section 
        className={styles.whyPickSection}
        style={{ backgroundImage: `url('${faaPng.src}')` }}
      >
        <div className={styles.container}>
          <div className={styles.valuePropsWrapper}>
            <motion.div 
              className={styles.valueProp} 
              style={{ borderBottomColor: cardColors[0] }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className={styles.cardNumberBg} style={{ backgroundColor: cardColors[0] }}>01<div className={styles.cardNumberTail} style={{ borderTopColor: cardColors[0] }} /></div>
              <img src={pickfaa1.src} alt="Premium Quality" className={styles.cardImage} />
              <h3 className={styles.cardTitle}>Premium Quality</h3>
              <div className={styles.cardHeart} style={{ color: cardColors[0] }}>♥</div>
              <p className={styles.cardDesc}>Only the finest nuts, dry fruits, and seeds are carefully selected to meet our quality standards.</p>
            </motion.div>
            
            <motion.div 
              className={styles.valueProp} 
              style={{ borderBottomColor: cardColors[1] }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className={styles.cardNumberBg} style={{ backgroundColor: cardColors[1] }}>02<div className={styles.cardNumberTail} style={{ borderTopColor: cardColors[1] }} /></div>
              <img src={pickfaa2.src} alt="100% Natural" className={styles.cardImage} />
              <h3 className={styles.cardTitle}>100% Natural</h3>
              <div className={styles.cardHeart} style={{ color: cardColors[1] }}>♥</div>
              <p className={styles.cardDesc}>Pure and wholesome goodness with naturally delicious flavors and no unnecessary additives.</p>
            </motion.div>

            <motion.div 
              className={styles.valueProp} 
              style={{ borderBottomColor: cardColors[2] }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className={styles.cardNumberBg} style={{ backgroundColor: cardColors[2] }}>03<div className={styles.cardNumberTail} style={{ borderTopColor: cardColors[2] }} /></div>
              <img src={pickfaa3.src} alt="Fresh & Hygienically Packed" className={styles.cardImage} />
              <h3 className={styles.cardTitle}>Fresh & Hygienically<br/>Packed</h3>
              <div className={styles.cardHeart} style={{ color: cardColors[2] }}>♥</div>
              <p className={styles.cardDesc}>Packed with care in a clean and hygienic environment to preserve freshness, quality, and taste.</p>
            </motion.div>

            <motion.div 
              className={styles.valueProp} 
              style={{ borderBottomColor: cardColors[3] }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className={styles.cardNumberBg} style={{ backgroundColor: cardColors[3] }}>04<div className={styles.cardNumberTail} style={{ borderTopColor: cardColors[3] }} /></div>
              <img src={pickfaa4.src} alt="Nourishing & Delicious" className={styles.cardImage} />
              <h3 className={styles.cardTitle}>Nourishing &<br/>Delicious</h3>
              <div className={styles.cardHeart} style={{ color: cardColors[3] }}>♥</div>
              <p className={styles.cardDesc}>A perfect balance of nutrition and irresistible taste, making healthy snacking truly enjoyable.</p>
            </motion.div>

            <motion.div 
              className={styles.valueProp} 
              style={{ borderBottomColor: cardColors[4] }}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <div className={styles.cardNumberBg} style={{ backgroundColor: cardColors[4] }}>05<div className={styles.cardNumberTail} style={{ borderTopColor: cardColors[4] }} /></div>
              <img src={pickfaa5.src} alt="Perfect for Every Occasion" className={styles.cardImage} />
              <h3 className={styles.cardTitle}>Perfect for Every<br/>Occasion</h3>
              <div className={styles.cardHeart} style={{ color: cardColors[4] }}>♥</div>
              <p className={styles.cardDesc}>Perfect for everyday snacking, celebrations, thoughtful gifting, and sharing special moments.</p>
            </motion.div>
          </div>
        </div>
      </section>


      {/* 7. WHAT OUR CUSTOMERS SAY */}
      <section className={`${styles.section} ${styles.bgLightGreen}`}>
        <div className={styles.container} style={{ maxWidth: '100%' }}>
          <div className={styles.sectionHeader}>
            <h2 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <svg viewBox="0 0 24 24" style={{ width: '32px', height: '32px' }}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              What Our Customers Say
            </h2>
          </div>
          <GoogleReviewSlider />
        </div>
      </section>

      {/* 8. BENEFITS OF NUTS & DRY FRUITS (New Design) */}
      <section id="benefits" className={styles.benefitsSection}>
        <div className={styles.container}>
          
          <div className={styles.benefitsPreHeader}>
            <LeafyGreen size={16} /> NATURE'S GOODNESS <LeafyGreen size={16} />
          </div>
          <h2 className={styles.benefitsTitle}>
            Benefits of <br/> Nuts & <span className={styles.benefitsTitleGold}>Dry Fruits</span>
          </h2>
          <p className={styles.benefitsSubtitle}>Nature's ultimate superfoods for a healthy lifestyle.</p>
          
          <div className={styles.benefitsGrid}>
            
            {/* Card 1 */}
            <motion.div 
              className={styles.benefitCard}
              initial={{ opacity: 0, rotate: -5, scale: 0.9 }}
              whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className={styles.benefitGlowIcon}>
                <HeartPulse size={28} />
              </div>
              <h3>Heart Healthy</h3>
              <div className={styles.benefitHeart}>♥</div>
              <p>Rich in healthy fats that support cardiovascular health and help maintain healthy cholesterol levels.</p>
              <div className={styles.benefitFooter}>
                <span className={styles.benefitNumber}>01</span>
                <span className={styles.benefitLeaf}><Leaf size={16} /></span>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div 
              className={styles.benefitCard}
              initial={{ opacity: 0, rotate: -5, scale: 0.9 }}
              whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className={styles.benefitGlowIcon}>
                <Brain size={28} />
              </div>
              <h3>Brain Power</h3>
              <div className={styles.benefitHeart}>♥</div>
              <p>Packed with Omega-3s and antioxidants that help support brain health and improve focus.</p>
              <div className={styles.benefitFooter}>
                <span className={styles.benefitNumber}>02</span>
                <span className={styles.benefitLeaf}><Leaf size={16} /></span>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div 
              className={styles.benefitCard}
              initial={{ opacity: 0, rotate: -5, scale: 0.9 }}
              whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className={styles.benefitGlowIcon}>
                <Zap size={28} />
              </div>
              <h3>Energy Boost</h3>
              <div className={styles.benefitHeart}>♥</div>
              <p>Natural sugars in dates provide an instant and sustained energy release.</p>
              <div className={styles.benefitFooter}>
                <span className={styles.benefitNumber}>03</span>
                <span className={styles.benefitLeaf}><Leaf size={16} /></span>
              </div>
            </motion.div>

            {/* Card 4 */}
            <motion.div 
              className={styles.benefitCard}
              initial={{ opacity: 0, rotate: -5, scale: 0.9 }}
              whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className={styles.benefitGlowIcon}>
                <ShieldCheck size={28} />
              </div>
              <h3>Immunity</h3>
              <div className={styles.benefitHeart}>♥</div>
              <p>High in essential vitamins and minerals like Zinc and Vitamin E to help support your immune system.</p>
              <div className={styles.benefitFooter}>
                <span className={styles.benefitNumber}>04</span>
                <span className={styles.benefitLeaf}><Leaf size={16} /></span>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* 8.5 CONTACT FORM REDESIGN */}
      <section id="contact" className={styles.contactSection}>
        <div className={styles.contactContainer}>
          
          {/* LEFT SIDE: Text and Contact Cards */}
          <motion.div 
            className={styles.contactLeft}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className={styles.contactPreHeader}>
              <span className={styles.preHeaderLine}></span>
              <Leaf size={14} className={styles.preHeaderIcon} /> GET IN TOUCH
              <span className={styles.preHeaderLine}></span>
            </div>
            
            <h2 className={styles.contactTitle}>
              Contact <span>Us</span>
            </h2>
            
            <div className={styles.titleSeparator}>
              <span className={styles.separatorLine}></span>
              <div className={styles.separatorDiamond}></div>
              <span className={styles.separatorLine}></span>
            </div>
            
            <p className={styles.contactDescriptionText}>
              We help you get the best quality products through online order. Easily place your orders and reach out to us for any queries.
            </p>

            <div className={styles.contactCardsWrapper}>
              <a href="https://wa.me/917200407943" target="_blank" rel="noopener noreferrer" className={styles.contactCard}>
                <div className={styles.contactCardIconWrap}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.658-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                </div>
                <div className={styles.contactCardTextWrap}>
                  <span className={styles.contactCardTitle}>WhatsApp Us</span>
                  <span className={styles.contactCardDesc}>Chat with us on WhatsApp</span>
                </div>
                <ChevronRight className={styles.contactCardArrow} />
              </a>

              <a href="tel:+917200407943" className={styles.contactCard}>
                <div className={styles.contactCardIconWrap}>
                  <Phone size={24} />
                </div>
                <div className={styles.contactCardTextWrap}>
                  <span className={styles.contactCardTitle}>+91 72004 07943</span>
                  <span className={styles.contactCardDesc}>Call us directly</span>
                </div>
                <ChevronRight className={styles.contactCardArrow} />
              </a>

              <a href="mailto:faabusinessgroup@gmail.com" className={styles.contactCard}>
                <div className={styles.contactCardIconWrap}>
                  <Mail size={24} />
                </div>
                <div className={styles.contactCardTextWrap}>
                  <span className={styles.contactCardTitle}>faabusinessgroup@gmail.com</span>
                  <span className={styles.contactCardDesc}>Send us an email</span>
                </div>
                <ChevronRight className={styles.contactCardArrow} />
              </a>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Form Card */}
          <motion.div 
            className={styles.contactRight}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={styles.formCard}>
              
              <div className={styles.formBadge}>
                <Mail size={28} className={styles.formBadgeIcon} />
              </div>

              <form onSubmit={handleContactSubmit} className={styles.contactForm}>
                <div className={styles.inputGroup}>
                  <label><User size={16} className={styles.labelIcon} /> Name</label>
                  <input 
                    type="text" 
                    className={styles.contactInput} 
                    placeholder="Your Full Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    required 
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label><Phone size={16} className={styles.labelIcon} /> Phone Number</label>
                  <input 
                    type="tel" 
                    className={styles.contactInput} 
                    placeholder="Your Phone Number"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    required 
                  />
                </div>
                
                <div className={styles.inputGroup}>
                  <label><MapPin size={16} className={styles.labelIcon} /> Address</label>
                  <textarea 
                    className={styles.contactTextarea} 
                    placeholder="Your Delivery Address"
                    value={contactAddress}
                    onChange={(e) => setContactAddress(e.target.value)}
                    required 
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label><MessageSquare size={16} className={styles.labelIcon} /> Description</label>
                  <textarea 
                    className={styles.contactTextarea} 
                    placeholder="How can we help you?"
                    value={contactDescription}
                    onChange={(e) => setContactDescription(e.target.value)}
                    required 
                  />
                </div>

                {contactStatus && (
                  <p className={`${styles.contactStatus} ${contactStatus.includes('success') ? styles.statusSuccess : styles.statusError}`}>
                    {contactStatus}
                  </p>
                )}

                <button 
                  type="submit" 
                  className={styles.contactSubmitBtn}
                  disabled={isSubmittingContact}
                >
                  {isSubmittingContact ? 'Sending...' : 'Send Message'} <Send size={18} className={styles.submitIcon} />
                </button>
              </form>
            </div>
          </motion.div>
          
        </div>
      </section>

    </div>
  );
}
