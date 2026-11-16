import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, MessageCircle, Phone, Send } from 'lucide-react';
import { ContactFormData, ContactValidationErrors } from '../types';
import { WHATSAPP_CONFIG } from '../data/products';
import {
  buildWhatsAppContactUrl,
  validateContactForm,
} from '../utils/commerce';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    mobile: '',
    message: '',
  });
  const [errors, setErrors] = useState<ContactValidationErrors>({});
  const [generatedWhatsAppUrl, setGeneratedWhatsAppUrl] = useState<string | null>(
    null
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const handleChange = (
    field: keyof ContactFormData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateContactForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const url = buildWhatsAppContactUrl(formData);
    setGeneratedWhatsAppUrl(url);

    // Attempt to open WhatsApp in a new tab using a dynamic anchor click
    try {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Fallback UI is displayed below automatically
    }
  };

  const handleCopyMessage = async () => {
    const text = `Hello Prakrutam Ayurveda!\n\nName: ${formData.name.trim()}\nMobile: ${formData.mobile.trim()}\nMessage: ${formData.message.trim()}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(false);
    }
  };

  const directChatUrl = `https://wa.me/${WHATSAPP_CONFIG.internationalNumber}?text=${encodeURIComponent(
    'Hello Prakrutam Ayurveda! I have a question about your skincare products.'
  )}`;

  return (
    <div className="py-12 md:py-20 bg-[#F8F6ED]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
        {/* Header */}
        <div className="max-w-2xl space-y-3 border-b border-[#123D27]/12 pb-8">
          <p className="text-xs tracking-[0.2em] text-[#123D27]/75 font-medium">
            CONNECT WITH US
          </p>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-semibold text-[#123D27]">
            We Would Love to Hear From You
          </h1>
          <p className="text-sm sm:text-base text-[#17211B]/80 leading-relaxed">
            For product inquiries, order assistance, or retail partnerships,
            reach out to Prakrutam Ayurveda directly via WhatsApp or Instagram.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Column: Direct Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-7 bg-[#123D27] text-[#F8F6ED] space-y-4">
              <span className="text-xs tracking-[0.18em] text-[#C9A34A] block">
                DIRECT WHATSAPP SUPPORT
              </span>
              <h2 className="font-serif-display text-2xl font-semibold text-[#F8F6ED]">
                Order & Customer Care
              </h2>
              <p className="text-sm text-[#F8F6ED]/80 leading-relaxed">
                Message us directly on WhatsApp for quick answers regarding
                Gandhak Malam, Neem Sabun, or your order dispatch.
              </p>

              <div className="pt-2 space-y-2">
                <div className="flex items-center gap-2.5 font-mono-tabular text-lg font-semibold text-[#C9A34A]">
                  <Phone className="w-4 h-4" />
                  <span>{WHATSAPP_CONFIG.displayNumber}</span>
                </div>
                <a
                  href={directChatUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-2 w-full py-3 px-5 bg-[#C9A34A] text-[#092719] text-xs sm:text-sm font-semibold hover:bg-[#d8b45c] transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp ({WHATSAPP_CONFIG.displayNumber})</span>
                </a>
              </div>
            </div>

            <div className="p-7 bg-[#F1EDE0] border border-[#123D27]/15 space-y-4">
              <span className="text-xs tracking-[0.18em] text-[#123D27]/70 block">
                OFFICIAL INSTAGRAM
              </span>
              <h2 className="font-serif-display text-2xl font-semibold text-[#123D27]">
                Follow Our Botanical Journey
              </h2>
              <p className="text-sm text-[#17211B]/80 leading-relaxed">
                Stay updated with product showcases, skincare rituals, and
                community updates on our official Instagram page.
              </p>
              <a
                href={WHATSAPP_CONFIG.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#123D27] hover:text-[#C9A34A] transition-colors"
              >
                <span>{WHATSAPP_CONFIG.instagramHandle}</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Contact Form with Functional WhatsApp Submission */}
          <div className="lg:col-span-7 bg-[#F4F0E4] border border-[#123D27]/15 p-6 sm:p-10 space-y-6">
            <div>
              <h2 className="font-serif-display text-2xl sm:text-3xl font-semibold text-[#123D27]">
                Send an Inquiry via WhatsApp
              </h2>
              <p className="mt-1 text-sm text-[#17211B]/75">
                Fill in your details below to open a pre-filled WhatsApp message
                addressed to Prakrutam Ayurveda ({WHATSAPP_CONFIG.displayNumber}).
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="contact-name"
                  className="block text-xs font-semibold tracking-wider text-[#123D27] mb-1.5"
                >
                  YOUR NAME *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Rahul Patel"
                  className="w-full px-4 py-3 bg-[#F8F6ED] border border-[#123D27]/25 text-sm text-[#17211B] focus:outline-none focus:border-[#123D27]"
                />
                {errors.name && (
                  <p role="alert" className="mt-1.5 text-xs text-red-700 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-mobile"
                  className="block text-xs font-semibold tracking-wider text-[#123D27] mb-1.5"
                >
                  MOBILE NUMBER *
                </label>
                <input
                  id="contact-mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => handleChange('mobile', e.target.value)}
                  placeholder="10-digit mobile number (e.g. 9876543210)"
                  className="w-full px-4 py-3 bg-[#F8F6ED] border border-[#123D27]/25 text-sm font-mono-tabular text-[#17211B] focus:outline-none focus:border-[#123D27]"
                />
                {errors.mobile && (
                  <p role="alert" className="mt-1.5 text-xs text-red-700 font-medium">
                    {errors.mobile}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold tracking-wider text-[#123D27] mb-1.5"
                >
                  MESSAGE *
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="How can Prakrutam Ayurveda help you today?"
                  className="w-full px-4 py-3 bg-[#F8F6ED] border border-[#123D27]/25 text-sm text-[#17211B] focus:outline-none focus:border-[#123D27]"
                />
                {errors.message && (
                  <p role="alert" className="mt-1.5 text-xs text-red-700 font-medium">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 bg-[#123D27] text-[#F8F6ED] text-sm font-semibold hover:bg-[#092719] transition-colors inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#C9A34A]" />
                <span>Send Message on WhatsApp</span>
              </button>
            </form>

            {/* Helpful Fallback if WhatsApp did not open automatically */}
            {generatedWhatsAppUrl && (
              <div
                role="status"
                className="p-5 bg-[#F8F6ED] border border-[#123D27]/30 space-y-3"
              >
                <p className="text-xs font-semibold text-[#123D27]">
                  Your WhatsApp Inquiry Link is Ready
                </p>
                <p className="text-xs text-[#17211B]/80 leading-relaxed">
                  If your browser blocked the new window, click the direct link
                  below to open WhatsApp or copy the message text:
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={generatedWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#123D27] text-[#F8F6ED] text-xs font-medium hover:bg-[#092719]"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#C9A34A]" />
                    <span>Open WhatsApp Now</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#123D27]/30 text-xs font-medium text-[#123D27] hover:bg-[#123D27]/5 cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied Message</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Inquiry Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
