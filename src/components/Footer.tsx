import React, { useState } from 'react';
import { ArrowUpRight, MessageCircle, X } from 'lucide-react';
import { PageRoute } from '../types';
import { WHATSAPP_CONFIG } from '../data/products';

interface FooterProps {
  onNavigate: (page: PageRoute, productSlug?: string) => void;
}

type PolicyKey = 'shipping' | 'returns' | 'privacy' | 'terms' | null;

const POLICY_CONTENT: Record<
  Exclude<PolicyKey, null>,
  { title: string; body: string[] }
> = {
  shipping: {
    title: 'Shipping & Dispatch Policy',
    body: [
      'Orders placed with Prakrutam Ayurveda via WhatsApp are personally reviewed and confirmed with you directly on WhatsApp.',
      'Once your delivery address and PIN code are confirmed on WhatsApp, dispatch details and estimated delivery timelines are shared directly to your mobile number.',
    ],
  },
  returns: {
    title: 'Return & Replacement Policy',
    body: [
      'Due to the personal care and hygiene nature of skincare and bathing products, opened or used items cannot be returned.',
      'If your parcel arrives damaged in transit, please message us on WhatsApp at +91 9714369430 with photographs of the outer package within 48 hours of delivery.',
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'Prakrutam Ayurveda respects your privacy. Customer delivery details entered during checkout are used solely to format your WhatsApp order message and fulfill your skincare order.',
      'Your shopping cart and preferences are stored locally on your device for your convenience and are never sold or shared with third-party marketers.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    body: [
      'All products presented on this website are traditional Ayurvedic-inspired personal care formulations by Prakrutam Ayurveda.',
      'Website descriptions are intended for general skincare information only and do not constitute medical advice, diagnosis, or guaranteed treatment.',
    ],
  },
};

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [activePolicy, setActivePolicy] = useState<PolicyKey>(null);

  const directWhatsAppHref = `https://wa.me/${WHATSAPP_CONFIG.internationalNumber}?text=${encodeURIComponent(
    'Hello Prakrutam Ayurveda! I would like to know more about your skincare products.'
  )}`;

  return (
    <footer className="bg-[#092719] text-[#F8F6ED] border-t border-[#C9A34A]/25">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-14 border-b border-[#F8F6ED]/12">
          {/* Column 1: Brand Identity */}
          <div className="md:col-span-5 space-y-4">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="font-serif-display text-3xl font-semibold tracking-tight text-[#F8F6ED] hover:text-[#C9A34A] transition-colors cursor-pointer text-left"
            >
              Prakrutam Ayurveda
            </button>
            <p className="text-sm text-[#C9A34A] tracking-wide">
              Rooted in Nature, Backed by Ayurveda.
            </p>
            <p className="text-sm text-[#F8F6ED]/75 leading-relaxed max-w-sm">
              Thoughtfully presented Ayurvedic skincare essentials focused on
              traditional ingredients and simple daily rituals.
            </p>
          </div>

          {/* Column 2: Navigation */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-serif-display text-lg font-semibold text-[#C9A34A]">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm text-[#F8F6ED]/80">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#C9A34A] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('shop')}
                  className="hover:text-[#C9A34A] transition-colors cursor-pointer"
                >
                  Shop Collection
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('product', 'gandhak-malam')}
                  className="hover:text-[#C9A34A] transition-colors cursor-pointer"
                >
                  Gandhak Malam
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('product', 'neem-sabun')}
                  className="hover:text-[#C9A34A] transition-colors cursor-pointer"
                >
                  Neem Sabun
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#C9A34A] transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#C9A34A] transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Policies */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="font-serif-display text-lg font-semibold text-[#C9A34A]">
              Policies
            </h3>
            <ul className="space-y-2.5 text-sm text-[#F8F6ED]/80">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('shipping')}
                  className="hover:text-[#C9A34A] transition-colors cursor-pointer text-left"
                >
                  Shipping & Dispatch
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('returns')}
                  className="hover:text-[#C9A34A] transition-colors cursor-pointer text-left"
                >
                  Return Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('privacy')}
                  className="hover:text-[#C9A34A] transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('terms')}
                  className="hover:text-[#C9A34A] transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Direct Contact & Channels */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="font-serif-display text-lg font-semibold text-[#C9A34A]">
              Connect With Us
            </h3>
            <p className="text-sm text-[#F8F6ED]/80 leading-relaxed">
              Order directly on WhatsApp or follow our botanical skincare journal
              on Instagram.
            </p>
            <div className="pt-1 space-y-2.5 text-sm">
              <div>
                <span className="text-xs text-[#F8F6ED]/60 block">WhatsApp Orders & Support</span>
                <a
                  href={directWhatsAppHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-mono-tabular text-[#F8F6ED] hover:text-[#C9A34A] transition-colors mt-0.5"
                >
                  <MessageCircle className="w-4 h-4 text-[#C9A34A]" />
                  <span>{WHATSAPP_CONFIG.displayNumber}</span>
                </a>
              </div>
              <div>
                <span className="text-xs text-[#F8F6ED]/60 block">Instagram</span>
                <a
                  href={WHATSAPP_CONFIG.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#F8F6ED] hover:text-[#C9A34A] transition-colors mt-0.5"
                >
                  <span>{WHATSAPP_CONFIG.instagramHandle}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C9A34A]" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Proposal Attribution */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#F8F6ED]/65">
          <p>© {new Date().getFullYear()} Prakrutam Ayurveda. All rights reserved.</p>
          <p>
            Digital Storefront Proposal Crafted by{' '}
            <span className="text-[#C9A34A] font-medium">Nexbot Solutions</span>
          </p>
        </div>
      </div>

      {/* Policy Modal Dialog */}
      {activePolicy && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="policy-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
        >
          <div className="bg-[#F8F6ED] text-[#17211B] max-w-lg w-full p-6 sm:p-8 border border-[#123D27]/20">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#123D27]/12">
              <h4
                id="policy-modal-title"
                className="font-serif-display text-2xl font-semibold text-[#123D27]"
              >
                {POLICY_CONTENT[activePolicy].title}
              </h4>
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                aria-label="Close policy dialog"
                className="p-1 text-[#123D27] hover:bg-[#123D27]/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-5 space-y-3 text-sm text-[#17211B]/85 leading-relaxed">
              {POLICY_CONTENT[activePolicy].body.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="pt-3 border-t border-[#123D27]/12 flex justify-end">
              <button
                type="button"
                onClick={() => setActivePolicy(null)}
                className="px-5 py-2 bg-[#123D27] text-[#F8F6ED] text-xs font-medium hover:bg-[#092719] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
