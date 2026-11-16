import React, { useState } from 'react';
import { SlidersHorizontal, Edit3, Check, RotateCcw } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';

interface ShopPageProps {
  products: Product[];
  onViewDetails: (slug: string) => void;
  onAddToCart: (productId: string, quantity?: number) => void;
  onUpdateProductDescription: (productId: string, newDescription: string) => void;
  onResetProducts: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({
  products,
  onViewDetails,
  onAddToCart,
  onUpdateProductDescription,
  onResetProducts,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');
  const [editingCopy, setEditingCopy] = useState(false);

  const categories = ['All', 'Topical Care', 'Bathing Rituals'];

  const filteredProducts = products
    .filter((p) => selectedCategory === 'All' || p.category === selectedCategory)
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="py-12 md:py-20 bg-[#F8F6ED] min-h-[75vh]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-10">
        {/* Page Header */}
        <div className="border-b border-[#123D27]/12 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <p className="text-xs tracking-[0.18em] text-[#123D27]/70 font-medium">
              PRAKRUTAM AYURVEDA CATALOG
            </p>
            <h1 className="font-serif-display text-4xl sm:text-5xl font-semibold text-[#123D27]">
              The Skincare Collection
            </h1>
            <p className="text-sm sm:text-base text-[#17211B]/80 max-w-xl">
              Thoughtfully presented Ayurvedic-inspired formulations for daily
              cleansing and topical skin wellbeing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setEditingCopy((prev) => !prev)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#123D27]/25 text-xs font-medium text-[#123D27] hover:bg-[#123D27]/5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {editingCopy ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#123D27]" />
                  <span>Done Editing Copy</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Product Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editable Product Descriptions Panel (when toggled) */}
        {editingCopy && (
          <div className="p-6 bg-[#F1EDE0] border border-[#123D27]/20 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#123D27]/12 pb-3">
              <div>
                <h2 className="font-serif-display text-xl font-semibold text-[#123D27]">
                  Customize Product Descriptions
                </h2>
                <p className="text-xs text-[#17211B]/75">
                  Edit the product descriptions below. Changes save automatically to your browser.
                </p>
              </div>
              <button
                type="button"
                onClick={onResetProducts}
                className="inline-flex items-center gap-1.5 text-xs text-[#123D27] hover:text-[#C9A34A] transition-colors self-start sm:self-auto cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Default Copy</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((prod) => (
                <div key={prod.id} className="space-y-2">
                  <label
                    htmlFor={`desc-${prod.id}`}
                    className="block text-xs font-semibold text-[#123D27]"
                  >
                    {prod.name} ({prod.size}) — Description
                  </label>
                  <textarea
                    id={`desc-${prod.id}`}
                    rows={3}
                    value={prod.description}
                    onChange={(e) =>
                      onUpdateProductDescription(prod.id, e.target.value)
                    }
                    className="w-full p-3 bg-[#F8F6ED] border border-[#123D27]/25 text-sm text-[#17211B] focus:outline-none focus:border-[#123D27]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter & Sort Bar — Scalable for Future Products */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div
            role="group"
            aria-label="Filter products by category"
            className="flex flex-wrap items-center gap-2"
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#123D27] text-[#F8F6ED]'
                      : 'bg-[#F1EDE0] text-[#17211B]/80 hover:text-[#123D27]'
                  }`}
                >
                  {cat === 'All' ? 'All Formulations' : cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-[#123D27]/70" />
            <label htmlFor="shop-sort" className="text-xs text-[#17211B]/75">
              Sort by:
            </label>
            <select
              id="shop-sort"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc')
              }
              className="bg-[#F1EDE0] border border-[#123D27]/20 px-3 py-1.5 text-xs sm:text-sm text-[#123D27] font-medium focus:outline-none focus:border-[#123D27]"
            >
              <option value="featured">Featured Essentials</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Product Grid — Supports 2 or more products cleanly */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onViewDetails={onViewDetails}
              onAddToCart={onAddToCart}
            />
          ))}

          {/* Extensible Catalog Architecture Card */}
          <div className="bg-[#F1EDE0]/70 border border-dashed border-[#123D27]/20 p-7 flex flex-col justify-between min-h-[340px]">
            <div className="space-y-3">
              <span className="text-xs text-[#123D27]/70 font-mono-tabular">
                FUTURE RELEASES
              </span>
              <h2 className="font-serif-display text-2xl font-semibold text-[#123D27]">
                Crafted in Small Batches
              </h2>
              <p className="text-sm text-[#17211B]/75 leading-relaxed">
                Prakrutam Ayurveda introduces new formulations thoughtfully.
                Connect with us on WhatsApp or Instagram for upcoming releases
                and wholesale inquiries.
              </p>
            </div>
            <div className="pt-6 border-t border-[#123D27]/10 text-xs text-[#123D27]/80">
              Showing {filteredProducts.length} of {products.length} available
              formulations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
