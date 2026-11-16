import React, { useState } from 'react';
import { ArrowUpRight, Check, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { ResilientImage } from './ResilientImage';

interface ProductCardProps {
  product: Product;
  onViewDetails: (slug: string) => void;
  onAddToCart: (productId: string, quantity?: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onAddToCart,
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product.id, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <article className="group bg-[#F4F0E4] border border-[#123D27]/12 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
      <div>
        {/* Product Image Container — 4:3 natural proportions, never stretched */}
        <div
          onClick={() => onViewDetails(product.slug)}
          className="relative aspect-[4/3] w-full overflow-hidden bg-[#EAE4D3] cursor-pointer"
        >
          <ResilientImage
            src={product.image}
            alt={`${product.name} (${product.size}) packaging by Prakrutam Ayurveda`}
            fallbackTitle={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>

        {/* Clean Unboxed Metadata & Product Details */}
        <div className="p-6 sm:p-7">
          <div className="flex items-center justify-between gap-2 text-xs text-[#123D27]/75 tracking-wide">
            <span>
              {product.category} <span aria-hidden="true">·</span> Net Wt. {product.size}
            </span>
            <span className="font-mono-tabular text-[#123D27]/80">In Stock</span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between gap-4">
            <h3 className="font-serif-display text-2xl sm:text-[26px] font-semibold text-[#123D27] leading-tight">
              <button
                type="button"
                onClick={() => onViewDetails(product.slug)}
                className="text-left hover:text-[#C9A34A] transition-colors cursor-pointer"
              >
                {product.name}
              </button>
            </h3>
            <span className="font-mono-tabular text-lg sm:text-xl font-semibold text-[#092719] shrink-0">
              ₹{product.price}
            </span>
          </div>

          <p className="mt-2.5 text-sm text-[#17211B]/80 leading-relaxed line-clamp-2">
            {product.description}
          </p>
        </div>
      </div>

      {/* Contiguous Card Actions */}
      <div className="px-6 sm:px-7 pb-6 sm:pb-7 pt-2 grid grid-cols-2 gap-3 border-t border-[#123D27]/8">
        <button
          type="button"
          onClick={() => onViewDetails(product.slug)}
          aria-label={`View Details for ${product.name}`}
          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 border border-[#123D27]/30 text-[#123D27] text-xs sm:text-sm font-medium hover:border-[#123D27] hover:bg-[#123D27]/5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <span>View Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={`Add ${product.name} to Cart`}
          className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            justAdded
              ? 'bg-[#092719] text-[#C9A34A]'
              : 'bg-[#123D27] text-[#F8F6ED] hover:bg-[#092719]'
          }`}
        >
          {justAdded ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#C9A34A]" />
              <span>Added to Cart</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-3.5 h-3.5 text-[#C9A34A]" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
};
