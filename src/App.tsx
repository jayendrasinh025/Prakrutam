/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CartItem,
  EditableBrandStory,
  PageRoute,
  Product,
} from './types';
import {
  INITIAL_BRAND_STORY,
  INITIAL_PRODUCTS,
} from './data/products';
import {
  addToCartItems,
  calculateCartSummary,
  removeFromCartItems,
  updateCartItemQuantity,
} from './utils/commerce';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';

const STORAGE_KEYS = {
  CART: 'prakrutam_ayurveda_cart_v1',
  PRODUCTS: 'prakrutam_ayurveda_products_v1',
  BRAND_STORY: 'prakrutam_ayurveda_story_v1',
};

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [activeProductSlug, setActiveProductSlug] = useState<string>(
    INITIAL_PRODUCTS[0].slug
  );

  // Persistent Products (supports editable descriptions)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved) as Product[];
        if (Array.isArray(parsed) && parsed.length >= 2) {
          // Ensure latest generated image paths are always preserved
          return INITIAL_PRODUCTS.map((initProd) => {
            const match = parsed.find((p) => p.id === initProd.id);
            return match
              ? { ...initProd, description: match.description }
              : initProd;
          });
        }
      }
    } catch {
      // Fallback to initial products
    }
    return INITIAL_PRODUCTS;
  });

  // Persistent Shopping Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  // Persistent Editable Brand Story
  const [brandStory, setBrandStory] = useState<EditableBrandStory>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRAND_STORY);
      return saved
        ? { ...INITIAL_BRAND_STORY, ...JSON.parse(saved) }
        : INITIAL_BRAND_STORY;
    } catch {
      return INITIAL_BRAND_STORY;
    }
  });

  // Sync Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch {
      // Ignore storage errors
    }
  }, [cart]);

  // Sync Products to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch {
      // Ignore storage errors
    }
  }, [products]);

  // Sync Brand Story to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.BRAND_STORY,
        JSON.stringify(brandStory)
      );
    } catch {
      // Ignore storage errors
    }
  }, [brandStory]);

  // Dynamic SEO Document Title per page
  useEffect(() => {
    const activeProduct = products.find((p) => p.slug === activeProductSlug);
    const titles: Record<PageRoute, string> = {
      home: 'Prakrutam Ayurveda — Rooted in Nature, Backed by Ayurveda',
      shop: 'Shop Ayurvedic Skincare — Prakrutam Ayurveda',
      product: activeProduct
        ? `${activeProduct.name} (${activeProduct.size}) — ₹${activeProduct.price} | Prakrutam Ayurveda`
        : 'Product Details — Prakrutam Ayurveda',
      about: 'About Us & Our Philosophy — Prakrutam Ayurveda',
      contact: 'Contact & WhatsApp Support — Prakrutam Ayurveda',
      cart: 'Your Shopping Cart — Prakrutam Ayurveda',
      checkout: 'WhatsApp Order Checkout — Prakrutam Ayurveda',
    };
    document.title = titles[currentPage];
  }, [currentPage, activeProductSlug, products]);

  const handleNavigate = (page: PageRoute, productSlug?: string) => {
    if (productSlug) {
      setActiveProductSlug(productSlug);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (productId: string, quantity: number = 1) => {
    setCart((prev) => addToCartItems(prev, productId, quantity));
  };

  const handleBuyNow = (productId: string, quantity: number = 1) => {
    setCart((prev) => addToCartItems(prev, productId, quantity));
    handleNavigate('checkout');
  };

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    setCart((prev) => updateCartItemQuantity(prev, productId, newQuantity));
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => removeFromCartItems(prev, productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleUpdateProductDescription = (
    productId: string,
    newDescription: string
  ) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, description: newDescription } : p
      )
    );
  };

  const handleResetProducts = () => {
    setProducts(INITIAL_PRODUCTS);
  };

  const cartSummary = calculateCartSummary(cart, products);
  const currentProduct =
    products.find((p) => p.slug === activeProductSlug) || products[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F6ED] text-[#17211B]">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        cartCount={cartSummary.totalItemsCount}
        cartTotal={cartSummary.totalAmount}
      />

      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            products={products}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
          />
        )}

        {currentPage === 'shop' && (
          <ShopPage
            products={products}
            onViewDetails={(slug) => handleNavigate('product', slug)}
            onAddToCart={handleAddToCart}
            onUpdateProductDescription={handleUpdateProductDescription}
            onResetProducts={handleResetProducts}
          />
        )}

        {currentPage === 'product' && (
          <ProductDetailPage
            product={currentProduct}
            allProducts={products}
            onNavigate={handleNavigate}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onUpdateDescription={handleUpdateProductDescription}
          />
        )}

        {currentPage === 'about' && (
          <AboutPage
            brandStory={brandStory}
            onUpdateBrandStory={setBrandStory}
            onResetBrandStory={() => setBrandStory(INITIAL_BRAND_STORY)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'contact' && <ContactPage />}

        {currentPage === 'cart' && (
          <CartPage
            items={cartSummary.items}
            totalItemsCount={cartSummary.totalItemsCount}
            subtotalAmount={cartSummary.subtotalAmount}
            totalAmount={cartSummary.totalAmount}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveCartItem}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage
            items={cartSummary.items}
            subtotalAmount={cartSummary.subtotalAmount}
            totalAmount={cartSummary.totalAmount}
            onNavigate={handleNavigate}
            onClearCart={handleClearCart}
          />
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
