import React from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react';
import { EnrichedCartItem, PageRoute } from '../types';
import { ResilientImage } from '../components/ResilientImage';

interface CartPageProps {
  items: EnrichedCartItem[];
  totalItemsCount: number;
  subtotalAmount: number;
  totalAmount: number;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onNavigate: (page: PageRoute, productSlug?: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  totalItemsCount,
  subtotalAmount,
  totalAmount,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate,
}) => {
  if (items.length === 0) {
    return (
      <div className="py-20 md:py-28 bg-[#F8F6ED] min-h-[70vh] flex items-center">
        <div className="max-w-lg mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-[#F1EDE0] border border-[#123D27]/15 flex items-center justify-center text-[#123D27]">
            <ShoppingBag className="w-7 h-7 text-[#C9A34A]" />
          </div>
          <div className="space-y-2">
            <p className="text-xs tracking-[0.2em] text-[#123D27]/70 font-medium">
              YOUR SHOPPING BAG
            </p>
            <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#123D27]">
              Your Cart is Currently Empty
            </h1>
            <p className="text-sm text-[#17211B]/75 leading-relaxed">
              Explore our Ayurvedic-inspired skincare essentials—Gandhak Malam
              and Neem Sabun—to begin your daily skincare ritual.
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#123D27] text-[#F8F6ED] text-sm font-semibold hover:bg-[#092719] transition-colors cursor-pointer"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4 text-[#C9A34A]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-20 bg-[#F8F6ED] min-h-[75vh]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#123D27]/12 pb-6">
          <div>
            <p className="text-xs tracking-[0.18em] text-[#123D27]/70 font-medium">
              SHOPPING CART
            </p>
            <h1 className="mt-1 font-serif-display text-3xl sm:text-4xl font-semibold text-[#123D27]">
              Your Selected Formulations ({totalItemsCount})
            </h1>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#123D27] hover:text-[#C9A34A] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Cart Items + Summary Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Itemized List */}
          <div className="lg:col-span-8 divide-y divide-[#123D27]/12 border-y border-[#123D27]/12">
            {items.map(({ product, quantity, subtotal }) => (
              <div
                key={product.id}
                className="py-6 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center"
              >
                {/* Product Image */}
                <div
                  onClick={() => onNavigate('product', product.slug)}
                  className="sm:col-span-3 aspect-[4/3] bg-[#EAE4D3] border border-[#123D27]/12 overflow-hidden cursor-pointer"
                >
                  <ResilientImage
                    src={product.image}
                    alt={product.name}
                    fallbackTitle={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Title & Unit Price */}
                <div className="sm:col-span-5 space-y-1.5">
                  <span className="text-xs text-[#123D27]/70 block">
                    {product.category} · Net Wt. {product.size}
                  </span>
                  <h2 className="font-serif-display text-2xl font-semibold text-[#123D27]">
                    <button
                      type="button"
                      onClick={() => onNavigate('product', product.slug)}
                      className="hover:text-[#C9A34A] transition-colors text-left cursor-pointer"
                    >
                      {product.name}
                    </button>
                  </h2>
                  <p className="text-xs font-mono-tabular text-[#17211B]/80">
                    Unit Price: ₹{product.price}
                  </p>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="sm:col-span-4 flex sm:flex-col items-center sm:items-end justify-between gap-3">
                  <div className="flex items-center gap-2 bg-[#F1EDE0] border border-[#123D27]/20 p-1">
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(product.id, quantity - 1)}
                      aria-label={`Decrease quantity of ${product.name}`}
                      className="w-7 h-7 flex items-center justify-center text-[#123D27] hover:bg-[#123D27] hover:text-[#F8F6ED] transition-colors cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span
                      data-testid={`cart-qty-${product.slug}`}
                      className="font-mono-tabular text-sm font-semibold text-[#123D27] w-7 text-center"
                    >
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateQuantity(product.id, quantity + 1)}
                      aria-label={`Increase quantity of ${product.name}`}
                      className="w-7 h-7 flex items-center justify-center text-[#123D27] hover:bg-[#123D27] hover:text-[#F8F6ED] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      data-testid={`cart-subtotal-${product.slug}`}
                      className="font-mono-tabular text-lg font-semibold text-[#123D27]"
                    >
                      ₹{subtotal}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(product.id)}
                      aria-label={`Remove ${product.name} from cart`}
                      className="p-1.5 text-[#17211B]/60 hover:text-red-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right: Order Summary Box */}
          <div className="lg:col-span-4 bg-[#F4F0E4] border border-[#123D27]/15 p-6 sm:p-8 space-y-6">
            <h2 className="font-serif-display text-2xl font-semibold text-[#123D27] border-b border-[#123D27]/12 pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              {items.map(({ product, quantity, subtotal }) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between text-[#17211B]/80"
                >
                  <span>
                    {product.name} × {quantity}
                  </span>
                  <span className="font-mono-tabular font-medium">
                    ₹{subtotal}
                  </span>
                </div>
              ))}

              <div className="border-t border-[#123D27]/12 pt-3 flex items-center justify-between text-sm text-[#17211B]/80">
                <span>Subtotal</span>
                <span className="font-mono-tabular font-medium">
                  ₹{subtotalAmount}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[#17211B]/65">
                <span>Order Confirmation Method</span>
                <span>Direct via WhatsApp</span>
              </div>

              <div className="border-t border-[#123D27]/15 pt-4 flex items-baseline justify-between">
                <span className="font-serif-display text-xl font-semibold text-[#123D27]">
                  Total
                </span>
                <span
                  data-testid="cart-total-amount"
                  className="font-mono-tabular text-2xl font-semibold text-[#092719]"
                >
                  ₹{totalAmount}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('checkout')}
              className="w-full py-3.5 px-6 bg-[#123D27] text-[#F8F6ED] text-sm font-semibold hover:bg-[#092719] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#C9A34A]" />
            </button>

            <p className="text-xs text-[#17211B]/65 leading-relaxed">
              No online payment gateway required. Enter your delivery address on
              the next step to send your formatted order directly on WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
