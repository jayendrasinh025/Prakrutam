import React, { useState } from 'react';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { PageRoute } from '../types';

interface NavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute, productSlug?: string) => void;
  cartCount: number;
  cartTotal: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  cartCount,
  cartTotal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { label: string; route: PageRoute }[] = [
    { label: 'Home', route: 'home' },
    { label: 'Shop', route: 'shop' },
    { label: 'About Us', route: 'about' },
    { label: 'Contact', route: 'contact' },
    { label: 'Checkout', route: 'checkout' },
  ];

  const handleNavClick = (route: PageRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F6ED] border-b border-[#123D27]/12">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 md:h-20 flex items-center justify-between gap-2 sm:gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => handleNavClick('home')}
          className="text-left font-serif-display text-xl sm:text-2xl md:text-[28px] font-semibold tracking-tight text-[#123D27] hover:text-[#092719] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C9A34A]"
        >
          Prakrutam Ayurveda
        </button>

        {/* Zone 2: 5 clean single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#17211B]/80"
        >
          {navItems.map((item) => {
            const isActive =
              currentPage === item.route ||
              (item.route === 'shop' && currentPage === 'product');
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNavClick(item.route)}
                className={`relative py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-[#123D27] font-semibold after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#C9A34A]'
                    : 'hover:text-[#123D27]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action (Cart button + Mobile menu button on small viewports) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNavClick('cart')}
            aria-label={`Shopping Cart with ${cartCount} items`}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 bg-[#123D27] text-[#F8F6ED] text-xs sm:text-sm font-medium rounded-none hover:bg-[#092719] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A34A]"
          >
            <ShoppingBag className="w-4 h-4 text-[#C9A34A] shrink-0" />
            <span>Cart</span>
            <span className="font-mono-tabular text-xs text-[#C9A34A]">
              ({cartCount})
            </span>
            {cartTotal > 0 && (
              <span className="hidden sm:inline font-mono-tabular text-xs text-[#F8F6ED]/85 border-l border-[#F8F6ED]/20 pl-2">
                ₹{cartTotal}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-[#123D27] border border-[#123D27]/20 hover:bg-[#123D27]/5 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden bg-[#F8F6ED] border-b border-[#123D27]/15 px-4 pt-2 pb-5 space-y-1"
        >
          {navItems.map((item) => {
            const isActive =
              currentPage === item.route ||
              (item.route === 'shop' && currentPage === 'product');
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNavClick(item.route)}
                className={`w-full text-left px-3 py-3 text-base font-medium transition-colors flex items-center justify-between ${
                  isActive
                    ? 'bg-[#123D27]/8 text-[#123D27] font-semibold'
                    : 'text-[#17211B]/80 hover:bg-[#123D27]/5 hover:text-[#123D27]'
                }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <span className="text-xs font-mono-tabular text-[#C9A34A]">Active</span>
                )}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => handleNavClick('cart')}
            className="w-full text-left px-3 py-3 text-base font-medium text-[#123D27] hover:bg-[#123D27]/5 flex items-center justify-between border-t border-[#123D27]/10 mt-2 pt-3"
          >
            <span>Shopping Cart</span>
            <span className="font-mono-tabular text-sm font-semibold text-[#123D27]">
              {cartCount} {cartCount === 1 ? 'item' : 'items'} · ₹{cartTotal}
            </span>
          </button>
        </nav>
      )}
    </header>
  );
};
