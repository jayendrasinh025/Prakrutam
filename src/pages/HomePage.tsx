import React from 'react';
import { ArrowRight, Check, Leaf, Sparkles, Sun, Droplets, MessageCircle } from 'lucide-react';
import { PageRoute, Product } from '../types';
import { BRAND_IMAGES, WHATSAPP_CONFIG } from '../data/products';
import { ProductCard } from '../components/ProductCard';
import { ResilientImage } from '../components/ResilientImage';
import { BotanicalValleyHero } from '../components/BotanicalValleyHero';

interface HomePageProps {
  products: Product[];
  onNavigate: (page: PageRoute, productSlug?: string) => void;
  onAddToCart: (productId: string, quantity?: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  products,
  onNavigate,
  onAddToCart,
}) => {
  const [quickAddedId, setQuickAddedId] = React.useState<string | null>(null);

  const handleBestSellerAdd = (productId: string) => {
    onAddToCart(productId, 1);
    setQuickAddedId(productId);
    setTimeout(() => setQuickAddedId(null), 1400);
  };

  const scrollToPhilosophy = () => {
    const el = document.getElementById('our-philosophy');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      onNavigate('about');
    }
  };

  const whyPrakrutamFeatures = [
    {
      number: '01.',
      title: 'Nature-inspired ingredients',
      description:
        'Rooted in time-honoured botanical and mineral traditions selected for straightforward everyday care.',
      icon: Leaf,
    },
    {
      number: '02.',
      title: 'Ayurvedic-inspired formulation',
      description:
        'Prepared with respect for classical Indian personal care wisdom and traditional preparation methods.',
      icon: Sparkles,
    },
    {
      number: '03.',
      title: 'Thoughtful skincare',
      description:
        'Focused essentials created with clarity and restraint, free from unnecessary complexity.',
      icon: Droplets,
    },
    {
      number: '04.',
      title: 'Simple daily rituals',
      description:
        'Designed to integrate effortlessly into your morning cleansing and evening topical care routine.',
      icon: Sun,
    },
  ];

  const shareExperienceWhatsAppUrl = `https://wa.me/${WHATSAPP_CONFIG.internationalNumber}?text=${encodeURIComponent(
    'Hello Prakrutam Ayurveda! I would like to share my experience with your skincare products:'
  )}`;

  return (
    <div className="space-y-0">
      {/* 1. IMMERSIVE INTERACTIVE 3D BOTANICAL HERO */}
      <BotanicalValleyHero
        onNavigate={onNavigate}
        onScrollToPhilosophy={scrollToPhilosophy}
      />

      {/* A. FEATURED COLLECTION */}
      <section className="py-16 md:py-24 bg-[#F8F6ED] border-b border-[#123D27]/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs tracking-[0.18em] text-[#123D27]/70 font-medium">
                01. CURATED FORMULATIONS
              </p>
              <h2 className="mt-2 font-serif-display text-3xl sm:text-4xl font-semibold text-[#123D27] text-balance">
                Featured Collection
              </h2>
            </div>
            <p className="text-sm text-[#17211B]/75 max-w-md">
              Explore our signature Ayurvedic-inspired topical and bathing
              preparations, presented in their authentic packaging.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={(slug) => onNavigate('product', slug)}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* B. OUR PHILOSOPHY & C. WHY PRAKRUTAM */}
      <section
        id="our-philosophy"
        className="py-16 md:py-24 bg-[#F1EDE0] border-b border-[#123D27]/10"
      >
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-16">
          <div className="max-w-3xl space-y-5">
            <p className="text-xs tracking-[0.18em] text-[#123D27]/70 font-medium">
              02. OUR PHILOSOPHY
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl md:text-[42px] font-semibold text-[#123D27] leading-tight text-balance">
              A Calm Return to Traditional Botanical Skincare
            </h2>
            <p className="text-base text-[#17211B]/85 leading-relaxed">
              At Prakrutam Ayurveda, our philosophy begins with respect for
              nature and traditional Indian skincare practices. Rather than
              overwhelming the skin with elaborate multi-step routines, we focus
              on foundational preparations inspired by classical Ayurvedic
              households.
            </p>
            <p className="text-base text-[#17211B]/80 leading-relaxed">
              Each product is thoughtfully presented for everyday rituals—whether
              cleansing with the cooling botanical lather of Neem Sabun or
              tending to skin with Gandhak Malam.
            </p>
          </div>

          {/* C. Why Prakrutam — 4 Minimal Visual Features */}
          <div>
            <div className="pb-6 border-b border-[#123D27]/15 flex items-center justify-between">
              <h3 className="font-serif-display text-2xl font-semibold text-[#123D27]">
                Why Prakrutam
              </h3>
              <span className="text-xs text-[#123D27]/70">
                Four Guiding Principles
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pt-8">
              {whyPrakrutamFeatures.map((feat) => {
                const IconComponent = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="space-y-3 border-t-2 border-[#C9A34A]/60 pt-5"
                  >
                    <div className="flex items-center justify-between text-xs font-mono-tabular text-[#123D27]/70">
                      <span>{feat.number}</span>
                      <IconComponent className="w-4 h-4 text-[#123D27]" />
                    </div>
                    <h4 className="font-serif-display text-xl font-semibold text-[#123D27]">
                      {feat.title}
                    </h4>
                    <p className="text-sm text-[#17211B]/75 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* D. BEST SELLERS */}
      <section className="py-16 md:py-24 bg-[#F8F6ED] border-b border-[#123D27]/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs tracking-[0.18em] text-[#123D27]/70 font-medium">
                03. ESSENTIAL RITUALS
              </p>
              <h2 className="mt-2 font-serif-display text-3xl sm:text-4xl font-semibold text-[#123D27]">
                Best Sellers
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#123D27] hover:text-[#C9A34A] transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>View Complete Catalog</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-[#123D27]/12 border-y border-[#123D27]/12">
            {products.map((product, index) => {
              const isAdded = quickAddedId === product.id;
              return (
                <div
                  key={product.id}
                  className="py-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
                >
                  <div className="md:col-span-1 font-mono-tabular text-sm text-[#123D27]/60">
                    0{index + 1}
                  </div>

                  <div
                    onClick={() => onNavigate('product', product.slug)}
                    className="md:col-span-3 aspect-[4/3] bg-[#EAE4D3] overflow-hidden cursor-pointer border border-[#123D27]/10"
                  >
                    <ResilientImage
                      src={product.image}
                      alt={product.name}
                      fallbackTitle={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="md:col-span-5 space-y-2">
                    <div className="text-xs text-[#123D27]/75">
                      {product.category} <span aria-hidden="true">·</span> Size: {product.size}
                    </div>
                    <h3 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#123D27]">
                      <button
                        type="button"
                        onClick={() => onNavigate('product', product.slug)}
                        className="hover:text-[#C9A34A] transition-colors text-left cursor-pointer"
                      >
                        {product.name}
                      </button>
                    </h3>
                    <p className="text-sm text-[#17211B]/80 leading-relaxed max-w-lg">
                      {product.description}
                    </p>
                  </div>

                  <div className="md:col-span-3 flex flex-row md:flex-col items-center md:items-end justify-between gap-3">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-[#17211B]/60 block">MRP</span>
                      <span className="font-mono-tabular text-2xl font-semibold text-[#123D27]">
                        ₹{product.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onNavigate('product', product.slug)}
                        className="px-4 py-2.5 border border-[#123D27]/30 text-xs font-medium text-[#123D27] hover:border-[#123D27] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBestSellerAdd(product.id)}
                        className="px-5 py-2.5 bg-[#123D27] text-[#F8F6ED] text-xs font-medium hover:bg-[#092719] transition-colors whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5"
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#C9A34A]" />
                            <span>Added</span>
                          </>
                        ) : (
                          <span>Add to Cart</span>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* E. BRAND STORY EDITORIAL */}
      <section className="py-16 md:py-24 bg-[#F1EDE0] border-b border-[#123D27]/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6">
              <div className="aspect-[4/3] w-full overflow-hidden border border-[#123D27]/15 bg-[#EAE4D3]">
                <ResilientImage
                  src={BRAND_IMAGES.editorialRitual}
                  alt="Traditional Ayurvedic botanical ingredients in a brass vessel"
                  fallbackTitle="Prakrutam Botanical Story"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <p className="text-xs tracking-[0.18em] text-[#123D27]/70 font-medium">
                04. BRAND STORY
              </p>
              <h2 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#123D27] leading-tight text-balance">
                Rooted in Nature, Backed by Ayurveda.
              </h2>
              <p className="text-base text-[#17211B]/85 leading-relaxed">
                Prakrutam Ayurveda celebrates the enduring simplicity of
                traditional Indian botanical care. Our formulations bring
                familiar, time-tested ingredients into clean, accessible formats
                for daily personal care.
              </p>
              <p className="text-sm text-[#17211B]/75 leading-relaxed">
                Whether you are selecting our 25g Gandhak Malam for targeted
                topical care or our 100g Neem Sabun for refreshing daily
                cleansing, each product reflects our dedication to honest,
                uncomplicated skincare.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#123D27] text-[#F8F6ED] text-xs sm:text-sm font-medium hover:bg-[#092719] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Read Our Full Story</span>
                  <ArrowRight className="w-4 h-4 text-[#C9A34A]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* F. CUSTOMER EXPERIENCES (No Fake Reviews — Ready for Real Customer Voices) */}
      <section className="py-16 md:py-24 bg-[#F8F6ED] border-b border-[#123D27]/10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.18em] text-[#123D27]/70 font-medium">
              05. COMMUNITY JOURNAL
            </p>
            <h2 className="mt-2 font-serif-display text-3xl sm:text-4xl font-semibold text-[#123D27]">
              Customer Experiences
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#17211B]/80 leading-relaxed">
              We value authentic feedback from individuals who incorporate
              Prakrutam Ayurveda into their daily skincare rituals. Verified
              customer reflections are curated directly from our community.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 bg-[#F4F0E4] border border-[#123D27]/12 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-mono-tabular text-[#123D27]/70">
                  Gandhak Malam · 25g
                </span>
                <h3 className="font-serif-display text-xl font-semibold text-[#123D27]">
                  Reserved for Verified Customer Reflection
                </h3>
                <p className="text-sm text-[#17211B]/75 leading-relaxed">
                  Have you tried Gandhak Malam as part of your skincare
                  routine? Share your genuine thoughts with us on WhatsApp to be
                  featured here.
                </p>
              </div>
              <span className="text-xs text-[#123D27]/70">
                Authentic Community Slot · 01
              </span>
            </div>

            <div className="p-7 bg-[#F4F0E4] border border-[#123D27]/12 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-xs font-mono-tabular text-[#123D27]/70">
                  Neem Sabun · 100g
                </span>
                <h3 className="font-serif-display text-xl font-semibold text-[#123D27]">
                  Reserved for Verified Customer Reflection
                </h3>
                <p className="text-sm text-[#17211B]/75 leading-relaxed">
                  Experience the daily bathing ritual of Neem Sabun and send us
                  your honest feedback directly via WhatsApp or Instagram.
                </p>
              </div>
              <span className="text-xs text-[#123D27]/70">
                Authentic Community Slot · 02
              </span>
            </div>

            <div className="p-7 bg-[#123D27] text-[#F8F6ED] border border-[#123D27] flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <span className="text-xs text-[#C9A34A] tracking-wider">
                  SHARE YOUR RITUAL
                </span>
                <h3 className="font-serif-display text-2xl font-semibold text-[#F8F6ED]">
                  Used Prakrutam Ayurveda Products?
                </h3>
                <p className="text-sm text-[#F8F6ED]/80 leading-relaxed">
                  We never publish fabricated ratings or synthetic reviews. Send
                  your real experience directly to our team on WhatsApp.
                </p>
              </div>
              <a
                href={shareExperienceWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3 px-5 bg-[#C9A34A] text-[#092719] text-xs font-semibold hover:bg-[#d8b45c] transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Share Feedback on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* G. FINAL CTA */}
      <section className="py-16 md:py-24 bg-[#123D27] text-[#F8F6ED]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 text-center max-w-3xl space-y-6">
          <p className="text-xs tracking-[0.2em] text-[#C9A34A]">
            BEGIN YOUR DAILY RITUAL
          </p>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-semibold text-[#F8F6ED] text-balance">
            Explore the Prakrutam Collection
          </h2>
          <p className="text-base text-[#F8F6ED]/80 leading-relaxed max-w-xl mx-auto">
            Select your essentials, enter your delivery address, and place your
            order seamlessly via WhatsApp with personal order confirmation.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className="px-8 py-3.5 bg-[#C9A34A] text-[#092719] text-sm font-semibold hover:bg-[#d8b45c] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Shop All Products
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="px-8 py-3.5 border border-[#F8F6ED]/35 text-[#F8F6ED] text-sm font-medium hover:border-[#C9A34A] hover:text-[#C9A34A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Contact on WhatsApp
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
