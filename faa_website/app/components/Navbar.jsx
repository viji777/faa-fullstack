"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, User, X, Phone, Mail, Leaf, ChevronDown, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from './Navbar.module.css';

const FacebookIcon = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const InstagramIcon = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const WhatsappIcon = ({ size = 24, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  
  const { user, setAuthModalOpen, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/categories`)
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <div className={styles.topBarContainer}>
          <div className={styles.topLeft}>
            <Leaf className={styles.topIcon} size={14} /> 
            <span>Premium Quality Nuts & Dates, Handpicked for You</span>
          </div>
          <a href="tel:+917200407943" className={styles.topContact} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Phone size={14} className={styles.topIcon} />
            <span>+91 72004 07943</span>
          </a>
          <div className={styles.topSocials}>
            <span className={styles.followText}>Follow us :</span>
            <a href="#" aria-label="Facebook"><FacebookIcon size={16} /></a>
            <a href="https://www.instagram.com/faa_nuts_and_hampers/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon size={16} /></a>
            <a href="https://wa.me/917200407943" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><WhatsappIcon size={16} /></a>
          </div>
        </div>
      </div>
      <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <img src="/faa_logo.png" alt="Faa Nuts & Dates" className={styles.logoImg} />
          <span className={styles.logoText}>Faa Nuts &amp; Hampers</span>
        </Link>
        
        <div className={styles.navLinks}>
          <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
            Home
          </Link>
          <Link href="#about" className={styles.navLink}>About Us</Link>
          
          <div 
            className={styles.dropdownContainer} 
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <Link href="/products" className={`${styles.navLink} ${pathname === '/products' ? styles.active : ''}`}>
              Products <ChevronDown size={16} className={styles.caretIcon} />
            </Link>
            {dropdownOpen && categories.length > 0 && (
              <div className={styles.dropdownMenu}>
                {categories.map(cat => (
                  <Link key={cat._id} href={`/products?category=${cat._id}`} className={styles.dropdownItem}>
                    {cat.name}
                  </Link>
                ))}
                <Link href="/products" className={styles.dropdownItemAll}>View All</Link>
              </div>
            )}
          </div>
          
          <Link href="#contact" className={styles.navLink}>Contact Us</Link>
        </div>

        <div className={styles.iconContainer}>
          <button className={styles.hamburgerBtn} aria-label="Menu" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <button className={styles.iconBtnBox} aria-label="Search" onClick={() => setIsSearchOpen(!isSearchOpen)}><Search size={20} /></button>
          
          {user ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link href="/account/orders" className={styles.iconBtnBox} aria-label="My Orders" title="My Orders">
                <User size={20} />
              </Link>
              <button className={styles.iconBtnBox} aria-label="Logout" onClick={logout} title={`Logout (${user.name})`}><LogOut size={20} /></button>
            </div>
          ) : (
            <button className={styles.iconBtnBox} aria-label="Account" onClick={() => setAuthModalOpen(true)}><User size={20} /></button>
          )}
          
          <button className={styles.cartBtn} aria-label="Cart" onClick={() => setIsCartOpen(true)}>
            <div className={styles.cartIconWrapper}>
              <ShoppingBag size={18} />
              <span className={styles.cartBadge}>{cartCount}</span>
            </div>
            <span>My Cart</span>
          </button>
        </div>
      </div>

      {/* Mega-Menu Search Overlay */}
      {isSearchOpen && (
        <div className={styles.searchOverlay}>
          <button className={styles.searchCloseBtn} onClick={() => setIsSearchOpen(false)}>
            <X size={32} strokeWidth={1.5} />
          </button>
          
          <div className={styles.searchOverlayContainer}>
            <div className={styles.searchLeft}>
              <Link href="/products" className={styles.searchCategoryLink} onClick={() => setIsSearchOpen(false)}>
                ALL PRODUCTS
              </Link>
              {categories.map(cat => (
                <Link 
                  key={cat._id} 
                  href={`/products?category=${cat._id}`} 
                  className={styles.searchCategoryLink}
                  onClick={() => setIsSearchOpen(false)}
                >
                  {cat.icon && <img src={cat.icon} alt="" className={styles.categoryIcon} />}
                  {cat.name}
                </Link>
              ))}
            </div>

            <div className={styles.searchRight}>
              <form onSubmit={handleSearchSubmit} className={styles.searchOverlayForm}>
                <input 
                  type="text" 
                  placeholder="Search" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchOverlayInput}
                  autoFocus
                />
                <button type="submit" className={styles.searchOverlaySubmit} aria-label="Search">
                  <Search size={32} strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </nav>
      {/* Mobile Menu Overlay */}
      <div className={`${styles.mobileMenuOverlay} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <span className={styles.logoText}>Faa Nuts &amp; Hampers</span>
          <button className={styles.closeBtn} onClick={() => setIsMobileMenuOpen(false)}>
            <X size={28} />
          </button>
        </div>
        <div className={styles.mobileNavLinks}>
          <Link href="/" className={`${styles.mobileNavLink} ${pathname === '/' ? styles.active : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </Link>
          <Link href="#about" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
          
          <div className={styles.mobileDropdownContainer}>
            <div className={styles.mobileDropdownHeader} onClick={() => setDropdownOpen(!dropdownOpen)}>
              <span>Products</span> <ChevronDown size={20} className={`${styles.caretIcon} ${dropdownOpen ? styles.caretUp : ''}`} />
            </div>
            <div className={`${styles.mobileDropdownMenu} ${dropdownOpen ? styles.mobileDropdownMenuOpen : ''}`}>
              {categories.map(cat => (
                <Link key={cat._id} href={`/products?category=${cat._id}`} className={styles.mobileDropdownItem} onClick={() => setIsMobileMenuOpen(false)}>
                  {cat.name}
                </Link>
              ))}
              <Link href="/products" className={styles.mobileDropdownItemAll} onClick={() => setIsMobileMenuOpen(false)}>View All</Link>
            </div>
          </div>
          
          <Link href="#contact" className={styles.mobileNavLink} onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
