import React, { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  ShoppingBag,
} from 'lucide-react';
import {
  CheckoutFormData,
  CheckoutValidationErrors,
  EnrichedCartItem,
  PageRoute,
} from '../types';
import { WHATSAPP_CONFIG } from '../data/products';
import {
  buildWhatsAppOrderUrl,
  formatWhatsAppOrderMessage,
  validateCheckoutForm,
} from '../utils/commerce';

interface CheckoutPageProps {
  items: EnrichedCartItem[];
  subtotalAmount: number;
  totalAmount: number;
  onNavigate: (page: PageRoute, productSlug?: string) => void;
  onClearCart: () => void;
}

const INITIAL_FORM: CheckoutFormData = {
  fullName: '',
  mobile: '',
  streetAddress: '',
  locality: '',
  city: '',
  state: 'Gujarat',
  pinCode: '',
  orderNotes: '',
};

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  items,
  subtotalAmount,
  totalAmount,
  onNavigate,
  onClearCart,
}) => {
  const [formData, setFormData] = useState<CheckoutFormData>(() => {
    try {
      const saved = localStorage.getItem('prakrutam_checkout_customer');
      return saved ? { ...INITIAL_FORM, ...JSON.parse(saved) } : INITIAL_FORM;
    } catch {
      return INITIAL_FORM;
    }
  });

  const [errors, setErrors] = useState<CheckoutValidationErrors>({});
  const [submittedOrder, setSubmittedOrder] = useState<{
    whatsappUrl: string;
    messageText: string;
  } | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

  const handleFieldChange = (field: keyof CheckoutFormData, value: string) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
    try {
      localStorage.setItem('prakrutam_checkout_customer', JSON.stringify(next));
    } catch {
      // Ignore storage quota issues
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateCheckoutForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmittedOrder(null);
      return;
    }

    setErrors({});
    const messageText = formatWhatsAppOrderMessage(
      items,
      totalAmount,
      formData
    );
    const whatsappUrl = buildWhatsAppOrderUrl(items, totalAmount, formData);

    setSubmittedOrder({
      whatsappUrl,
      messageText,
    });

    // Open WhatsApp with pre-filled message (customer manually presses Send)
    try {
      const anchor = document.createElement('a');
      anchor.href = whatsappUrl;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      // Fallback box with direct link and copy button is always shown below
    }
  };

  const handleCopyOrderText = async () => {
    if (!submittedOrder) return;
    try {
      await navigator.clipboard.writeText(submittedOrder.messageText);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch {
      setCopiedMessage(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="py-20 md:py-28 bg-[#F8F6ED] min-h-[70vh] flex items-center">
        <div className="max-w-lg mx-auto px-4 text-center space-y-6">
          <div className="w-16 h-16 mx-auto bg-[#F1EDE0] border border-[#123D27]/15 flex items-center justify-center text-[#123D27]">
            <ShoppingBag className="w-7 h-7 text-[#C9A34A]" />
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-semibold text-[#123D27]">
            Your Cart is Empty
          </h1>
          <p className="text-sm text-[#17211B]/75 leading-relaxed">
            Please add Gandhak Malam or Neem Sabun to your cart before
            proceeding to WhatsApp checkout.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className="px-7 py-3.5 bg-[#123D27] text-[#F8F6ED] text-sm font-semibold hover:bg-[#092719] transition-colors cursor-pointer"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  const liveMessagePreview = formatWhatsAppOrderMessage(
    items,
    totalAmount,
    {
      fullName: formData.fullName || 'Your Name',
      mobile: formData.mobile || '9876543210',
      streetAddress: formData.streetAddress || 'Street Address',
      locality: formData.locality || 'Locality',
      city: formData.city || 'City',
      state: formData.state || 'State',
      pinCode: formData.pinCode || '388001',
      orderNotes: formData.orderNotes,
    }
  );

  return (
    <div className="py-10 md:py-16 bg-[#F8F6ED]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-10">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#123D27]/12 pb-6">
          <div>
            <p className="text-xs tracking-[0.18em] text-[#123D27]/70 font-medium">
              WHATSAPP DIRECT CHECKOUT
            </p>
            <h1 className="mt-1 font-serif-display text-3xl sm:text-4xl font-semibold text-[#123D27]">
              Delivery Details & Order Confirmation
            </h1>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('cart')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-[#123D27] hover:text-[#C9A34A] transition-colors self-start sm:self-auto cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Cart</span>
          </button>
        </div>

        {/* Main Checkout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Customer Delivery Form */}
          <div className="lg:col-span-7 bg-[#F4F0E4] border border-[#123D27]/15 p-6 sm:p-9 space-y-6">
            {/* Helpful Confirmation & Fallback Panel once Place Order is clicked */}
            {submittedOrder && (
              <div
                role="region"
                aria-label="WhatsApp Order Ready"
                data-testid="whatsapp-order-ready-panel"
                className="p-6 bg-[#123D27] text-[#F8F6ED] border border-[#C9A34A]/50 space-y-4"
              >
                <div className="space-y-1">
                  <span className="text-xs font-mono-tabular text-[#C9A34A] block">
                    STEP 8 · WHATSAPP MESSAGE READY
                  </span>
                  <h3 className="font-serif-display text-2xl font-semibold text-[#F8F6ED]">
                    Complete Your Order in WhatsApp
                  </h3>
                  <p className="text-xs sm:text-sm text-[#F8F6ED]/85 leading-relaxed">
                    We have prepared your pre-filled order addressed to{' '}
                    <strong className="font-mono-tabular">
                      +{WHATSAPP_CONFIG.internationalNumber}
                    </strong>
                    . Please press <strong>Send</strong> inside WhatsApp to
                    submit your order.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={submittedOrder.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid="whatsapp-direct-link"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A34A] text-[#092719] text-xs sm:text-sm font-semibold hover:bg-[#d8b45c] transition-colors"
                  >
                    <span>Open WhatsApp ({WHATSAPP_CONFIG.displayNumber})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyOrderText}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 border border-[#F8F6ED]/35 text-[#F8F6ED] text-xs font-medium hover:border-[#C9A34A] hover:text-[#C9A34A] transition-colors cursor-pointer"
                  >
                    {copiedMessage ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#C9A34A]" />
                        <span>Order Text Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Order Message</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onClearCart();
                      onNavigate('home');
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs text-[#F8F6ED]/75 underline underline-offset-4 hover:text-[#C9A34A] cursor-pointer"
                  >
                    I&apos;ve Sent My Order (Clear Cart)
                  </button>
                </div>

                <p className="text-[11px] text-[#F8F6ED]/70">
                  Helpful Note: If WhatsApp did not open automatically on your
                  device, tap &ldquo;Open WhatsApp&rdquo; above or copy the
                  message and send it to {WHATSAPP_CONFIG.displayNumber}. Your
                  cart remains saved until you clear it.
                </p>
              </div>
            )}

            <div className="border-b border-[#123D27]/12 pb-4">
              <h2 className="font-serif-display text-2xl font-semibold text-[#123D27]">
                1. Customer & Delivery Information
              </h2>
              <p className="text-xs text-[#17211B]/75 mt-1">
                Complete all required fields (*). Your details will be formatted
                into a ready-to-send WhatsApp order message to{' '}
                <span className="font-mono-tabular font-medium">
                  {WHATSAPP_CONFIG.displayNumber}
                </span>
                .
              </p>
            </div>

            <form
              id="whatsapp-checkout-form"
              onSubmit={handlePlaceOrder}
              noValidate
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="checkout-fullName"
                    className="block text-xs font-semibold tracking-wider text-[#123D27] mb-1.5"
                  >
                    FULL NAME *
                  </label>
                  <input
                    id="checkout-fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      handleFieldChange('fullName', e.target.value)
                    }
                    placeholder="e.g. Rahul Patel"
                    className="w-full px-3.5 py-2.5 bg-[#F8F6ED] border border-[#123D27]/25 text-sm text-[#17211B] focus:outline-none focus:border-[#123D27]"
                  />
                  {errors.fullName && (
                    <p
                      role="alert"
                      className="mt-1 text-xs text-red-700 font-medium"
                    >
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-mobile"
                    className="block text-xs font-semibold tracking-wider text-[#123D27] mb-1.5"
                  >
                    MOBILE NUMBER *
                  </label>
                  <input
                    id="checkout-mobile"
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) =>
                      handleFieldChange('mobile', e.target.value)
                    }
                    placeholder="10-digit number (e.g. 9876543210)"
                    className="w-full px-3.5 py-2.5 bg-[#F8F6ED] border border-[#123D27]/25 text-sm font-mono-tabular text-[#17211B] focus:outline-none focus:border-[#123D27]"
                  />
                  {errors.mobile && (
                    <p
                      role="alert"
                      className="mt-1 text-xs text-red-700 font-medium"
                    >
                      {errors.mobile}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-streetAddress"
                  className="block text-xs font-semibold tracking-wider text-[#123D27] mb-1.5"
                >
                  HOUSE / BUILDING / STREET *
                </label>
                <input
                  id="checkout-streetAddress"
                  type="text"
                  value={formData.streetAddress}
                  onChange={(e) =>
                    handleFieldChange('streetAddress', e.target.value)
                  }
                  placeholder="House no., building name, street"
                  className="w-full px-3.5 py-2.5 bg-[#F8F6ED] border border-[#123D27]/25 text-sm text-[#17211B] focus:outline-none focus:border-[#123D27]"
                />
                {errors.streetAddress && (
                  <p
                    role="alert"
                    className="mt-1 text-xs text-red-700 font-medium"
                  >
                    {errors.streetAddress}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="checkout-locality"
                    className="block text-xs font-semibold tracking-wider text-[#123D27] mb-1.5"
                  >
                    AREA / LOCALITY *
                  </label>
                  <input
                    id="checkout-locality"
                    type="text"
                    value={formData.locality}
                    onChange={(e) =>
                      handleFieldChange('locality', e.target.value)
                    }
                    placeholder="Area, locality, or landmark"
                    className="w-full px-3.5 py-2.5 bg-[#F8F6ED] border border-[#123D27]/25 text-sm text-[#17211B] focus:outline-none focus:border-[#123D27]"
                  />
                  {errors.locality && (
                    <p
                      role="alert"
                      className="mt-1 text-xs text-red-700 font-medium"
                    >
                      {errors.locality}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-city"
                    className="block text-xs font-semibold tracking-wider text-[#123D27] mb-1.5"
                  >
                    CITY *
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleFieldChange('city', e.target.value)}
                    placeholder="e.g. Anand"
                    className="w-full px-3.5 py-2.5 bg-[#F8F6ED] border border-[#123D27]/25 text-sm text-[#17211B] focus:outline-none focus:border-[#123D27]"
                  />
                  {errors.city && (
                    <p
                      role="alert"
                      className="mt-1 text-xs text-red-700 font-medium"
                    >
                      {errors.city}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="checkout-state"
                    className="block text-xs font-semibold tracking-wider text-[#123D27] mb-1.5"
                  >
                    STATE *
                  </label>
                  <input
                    id="checkout-state"
                    type="text"
                    value={formData.state}
                    onChange={(e) => handleFieldChange('state', e.target.value)}
                    placeholder="e.g. Gujarat"
                    className="w-full px-3.5 py-2.5 bg-[#F8F6ED] border border-[#123D27]/25 text-sm text-[#17211B] focus:outline-none focus:border-[#123D27]"
                  />
                  {errors.state && (
                    <p
                      role="alert"
                      className="mt-1 text-xs text-red-700 font-medium"
                    >
                      {errors.state}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="checkout-pinCode"
                    className="block text-xs font-semibold tracking-wider text-[#123D27] mb-1.5"
                  >
                    PIN CODE *
                  </label>
                  <input
                    id="checkout-pinCode"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={formData.pinCode}
                    onChange={(e) =>
                      handleFieldChange('pinCode', e.target.value)
                    }
                    placeholder="6-digit PIN (e.g. 388001)"
                    className="w-full px-3.5 py-2.5 bg-[#F8F6ED] border border-[#123D27]/25 text-sm font-mono-tabular text-[#17211B] focus:outline-none focus:border-[#123D27]"
                  />
                  {errors.pinCode && (
                    <p
                      role="alert"
                      className="mt-1 text-xs text-red-700 font-medium"
                    >
                      {errors.pinCode}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="checkout-orderNotes"
                  className="block text-xs font-semibold tracking-wider text-[#123D27] mb-1.5"
                >
                  ORDER NOTES (OPTIONAL)
                </label>
                <textarea
                  id="checkout-orderNotes"
                  rows={2}
                  value={formData.orderNotes}
                  onChange={(e) =>
                    handleFieldChange('orderNotes', e.target.value)
                  }
                  placeholder="Preferred delivery timing or special instructions"
                  className="w-full px-3.5 py-2.5 bg-[#F8F6ED] border border-[#123D27]/25 text-sm text-[#17211B] focus:outline-none focus:border-[#123D27]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-[#123D27] text-[#F8F6ED] text-sm font-semibold tracking-wide hover:bg-[#092719] transition-colors inline-flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-[#C9A34A]" />
                  <span>PLACE ORDER ON WHATSAPP</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Complete Order Summary & Live Message Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#F4F0E4] border border-[#123D27]/15 p-6 sm:p-8 space-y-5">
              <h2 className="font-serif-display text-2xl font-semibold text-[#123D27] border-b border-[#123D27]/12 pb-3">
                2. Complete Order Summary
              </h2>

              <div className="divide-y divide-[#123D27]/10">
                {items.map(({ product, quantity, subtotal }) => (
                  <div
                    key={product.id}
                    className="py-3.5 flex items-start justify-between gap-4"
                  >
                    <div>
                      <h3 className="font-serif-display text-lg font-semibold text-[#123D27]">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#17211B]/70 font-mono-tabular">
                        Qty: {quantity} × ₹{product.price} ({product.size})
                      </p>
                    </div>
                    <span className="font-mono-tabular text-sm font-semibold text-[#123D27]">
                      ₹{subtotal}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#123D27]/15 pt-4 space-y-2 text-sm">
                <div className="flex items-center justify-between text-[#17211B]/80">
                  <span>Subtotal</span>
                  <span className="font-mono-tabular">₹{subtotalAmount}</span>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-[#123D27]/12">
                  <span className="font-serif-display text-xl font-semibold text-[#123D27]">
                    Total Payable
                  </span>
                  <span
                    data-testid="checkout-total-amount"
                    className="font-mono-tabular text-2xl font-semibold text-[#092719]"
                  >
                    ₹{totalAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Pre-filled WhatsApp Message Preview */}
            <div className="bg-[#F1EDE0] border border-[#123D27]/15 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-[#123D27]">
                  WHATSAPP MESSAGE PREVIEW
                </span>
                <span className="font-mono-tabular text-[11px] text-[#123D27]/75">
                  wa.me/{WHATSAPP_CONFIG.internationalNumber}
                </span>
              </div>
              <pre
                data-testid="whatsapp-message-preview"
                className="p-4 bg-[#F8F6ED] border border-[#123D27]/12 text-xs font-mono-tabular text-[#17211B]/85 whitespace-pre-wrap leading-relaxed overflow-x-auto"
              >
                {liveMessagePreview}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
