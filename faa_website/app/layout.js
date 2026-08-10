import { Manrope, Fraunces, Dancing_Script, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing" });
const poppins = Poppins({ subsets: ["latin"], weight: ['400', '600', '700'], variable: "--font-poppins" });

export const metadata = {
  title: "Faa Nuts & Dates | Premium Quality Nuts, Dates & Dry Fruits",
  description: "Discover the finest selection of premium nuts, dates, and dry fruits at Faa. Enjoy health benefits, freshness, and quality guaranteed.",
  keywords: "nuts, dates, dry fruits, premium, healthy snacks, Faa",
};

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import ScrollToTop from './components/ScrollToTop';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} ${fraunces.variable} ${dancingScript.variable} ${poppins.variable}`} style={{ fontFamily: 'var(--font-manrope), sans-serif' }} suppressHydrationWarning>
        <GoogleOAuthProvider clientId="1003768437028-e0td9m9fo65qakgcuetkt860ghqut3s0.apps.googleusercontent.com">
          <AuthProvider>
            <CartProvider>
              <Toaster position="bottom-right" containerStyle={{ zIndex: 99999 }} />
              <Navbar />
              <main>{children}</main>
              <Footer />
              <AuthModal />
              <CartDrawer />
              <ScrollToTop />
            </CartProvider>
          </AuthProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
