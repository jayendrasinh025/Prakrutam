import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  Edit3,
  Minus,
  Plus,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { PageRoute, Product } from '../types';
import { ResilientImage } from '../components/ResilientImage';
import { ProductCard } from '../components/ProductCard';

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onNavigate: (page: PageRoute, productSlug?: string) => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onBuyNow: (productId: string, quantity: number) => void;
  onUpdateDescription: (productId: string, newDescription: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onNavigate,
  onAddToCart,
  onBuyNow,
  onUpdateDescription,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // Reset quantity when switching between products
  useEffect(() => {
    setQuantity(1);
    setAddedFeedback(false);
    setIsEditingDesc(false);
  }, [product.id]);

  const handleDecrease = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCartClick = () => {
    onAddToCart(product.id, quantity);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1800);
  };

  const handleBuyNowClick = () => {
    onBuyNow(product.id, quantity);
  };

  const relatedProducts = allProducts.filter((p) => p.id !== product.id);

  return (
    <div className="py-10 md:py-16 bg-[#F8F6ED]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-16">
        {/* Back Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#123D27] hover:text-[#C9A34A] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shop</span>
          </button>

          <div className="text-xs text-[#17211B]/65">
            <span>Shop</span> <span aria-hidden="true">/</span>{' '}
            <span>{product.category}</span> <span aria-hidden="true">/</span>{' '}
            <span className="text-[#123D27] font-medium">{product.name}</span>
          </div>
        </div>

        {/* Main Contiguous Purchase Module */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left: Large Unstretched Product Photograph */}
          <div className="lg:col-span-6 space-y-4">
            <div className="aspect-[4/3] w-full bg-[#EAE4D3] border border-[#123D27]/15 overflow-hidden">
              <ResilientImage
                src={product.image}
                alt={`${product.name} (${product.size}) by Prakrutam Ayurveda`}
                fallbackTitle={product.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <p className="text-xs text-[#17211B]/65">
              {product.packagingNote}
            </p>
          </div>

          {/* Right: Contiguous Purchase Details */}
          <div className="lg:col-span-6 bg-[#F4F0E4] border border-[#123D27]/15 p-6 sm:p-9 space-y-6">
            <div className="flex items-center justify-between text-xs text-[#123D27]/80">
              <span>
                PRAKRUTAM AYURVEDA <span aria-hidden="true">·</span>{' '}
                {product.category.toUpperCase()}
              </span>
              <span className="font-mono-tabular text-[#123D27] font-medium">
                In Stock
              </span>
            </div>

            <div className="space-y-2 border-b border-[#123D27]/12 pb-5">
              <h1 className="font-serif-display text-3xl sm:text-4xl md:text-[42px] font-semibold text-[#123D27] leading-tight">
                {product.name}
              </h1>
              <p className="text-sm text-[#17211B]/75">{product.shortSubtitle}</p>

              <div className="pt-3 flex items-baseline gap-4">
                <span className="font-mono-tabular text-3xl font-semibold text-[#092719]">
                  ₹{product.price}
                </span>
                <span className="text-xs text-[#17211B]/70">
                  Net Weight: <strong className="font-mono-tabular">{product.size}</strong> · Inclusive of all taxes
                </span>
              </div>
            </div>

            {/* Editable Product Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-[#123D27]/80">
                  PRODUCT DESCRIPTION
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingDesc((prev) => !prev)}
                  className="inline-flex items-center gap-1 text-xs text-[#123D27] hover:text-[#C9A34A] transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingDesc ? 'Save Description' : 'Edit Copy'}</span>
                </button>
              </div>

              {isEditingDesc ? (
                <textarea
                  aria-label="Edit Product Description"
                  rows={3}
                  value={product.description}
                  onChange={(e) =>
                    onUpdateDescription(product.id, e.target.value)
                  }
                  className="w-full p-3 bg-[#F8F6ED] border border-[#123D27]/30 text-sm text-[#17211B] focus:outline-none focus:border-[#123D27]"
                />
              ) : (
                <p className="text-base text-[#17211B]/85 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Size & Quantity Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 bg-[#F8F6ED] border border-[#123D27]/15">
                <span className="text-xs text-[#17211B]/65 block">Pack Size</span>
                <span className="font-mono-tabular text-sm font-semibold text-[#123D27] mt-1 block">
                  {product.size} Standard Pack
                </span>
              </div>

              <div className="p-3.5 bg-[#F8F6ED] border border-[#123D27]/15 flex items-center justify-between">
                <span className="text-xs text-[#17211B]/65">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    aria-label="Decrease quantity"
                    className="w-8 h-8 flex items-center justify-center border border-[#123D27]/25 text-[#123D27] hover:bg-[#123D27] hover:text-[#F8F6ED] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span
                    aria-live="polite"
                    data-testid="pdp-quantity-value"
                    className="font-mono-tabular text-base font-semibold text-[#123D27] w-6 text-center"
                  >
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    aria-label="Increase quantity"
                    className="w-8 h-8 flex items-center justify-center border border-[#123D27]/25 text-[#123D27] hover:bg-[#123D27] hover:text-[#F8F6ED] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Subtotal calculation preview */}
            <div className="flex items-center justify-between text-xs text-[#17211B]/75 pt-1">
              <span>Selected Quantity Subtotal:</span>
              <span className="font-mono-tabular font-semibold text-sm text-[#123D27]">
                ₹{product.price * quantity}
              </span>
            </div>

            {/* Primary Action Buttons: Add to Cart & Buy Now */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <button
                type="button"
                onClick={handleAddToCartClick}
                className={`py-3.5 px-6 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  addedFeedback
                    ? 'bg-[#092719] text-[#C9A34A]'
                    : 'bg-[#123D27] text-[#F8F6ED] hover:bg-[#092719]'
                }`}
              >
                {addedFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-[#C9A34A]" />
                    <span>Added to Cart ({quantity})</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4 text-[#C9A34A]" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNowClick}
                className="py-3.5 px-6 bg-[#C9A34A] text-[#092719] text-sm font-semibold hover:bg-[#d8b45c] transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>

            {/* Product Information Sections */}
            <div className="pt-6 border-t border-[#123D27]/12 space-y-4">
              <div>
                <h2 className="font-serif-display text-lg font-semibold text-[#123D27]">
                  Daily Ritual & Usage
                </h2>
                <p className="mt-1 text-sm text-[#17211B]/80 leading-relaxed">
                  {product.usageRitual}
                </p>
              </div>

              <div className="border-t border-[#123D27]/10 pt-4">
                <h2 className="font-serif-display text-lg font-semibold text-[#123D27]">
                  Storage & Care
                </h2>
                <p className="mt-1 text-sm text-[#17211B]/80 leading-relaxed">
                  {product.storageCare}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="pt-12 border-t border-[#123D27]/12 space-y-8">
            <div>
              <p className="text-xs tracking-[0.18em] text-[#123D27]/70 font-medium">
                COMPLETE YOUR RITUAL
              </p>
              <h2 className="mt-1 font-serif-display text-3xl font-semibold text-[#123D27]">
                Related Products
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl">
              {relatedProducts.map((rel) => (
                <ProductCard
                  key={rel.id}
                  product={rel}
                  onViewDetails={(slug) => onNavigate('product', slug)}
                  onAddToCart={(id, qty) => onAddToCart(id, qty || 1)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
