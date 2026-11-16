import React, { useState } from 'react';
import { ArrowRight, Check, Edit3, RotateCcw } from 'lucide-react';
import { EditableBrandStory, PageRoute } from '../types';
import { BRAND_IMAGES } from '../data/products';
import { ResilientImage } from '../components/ResilientImage';

interface AboutPageProps {
  brandStory: EditableBrandStory;
  onUpdateBrandStory: (updated: EditableBrandStory) => void;
  onResetBrandStory: () => void;
  onNavigate: (page: PageRoute, productSlug?: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({
  brandStory,
  onUpdateBrandStory,
  onResetBrandStory,
  onNavigate,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: keyof EditableBrandStory, value: string) => {
    onUpdateBrandStory({
      ...brandStory,
      [field]: value,
    });
  };

  return (
    <div className="bg-[#F8F6ED]">
      {/* Editorial Hero */}
      <section className="py-14 md:py-24 border-b border-[#123D27]/12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#123D27]/12">
            <div className="max-w-3xl space-y-3">
              <p className="text-xs tracking-[0.2em] text-[#123D27]/75 font-medium">
                ABOUT PRAKRUTAM AYURVEDA
              </p>
              <h1
                className="font-serif-display font-semibold text-[#123D27] leading-tight text-balance"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.75rem)' }}
              >
                {brandStory.heading}
              </h1>
            </div>

            <div className="flex items-center gap-3 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setIsEditing((prev) => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#123D27]/30 text-xs font-medium text-[#123D27] hover:bg-[#123D27]/5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {isEditing ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Story Changes</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Customize Brand Story</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editable Mode Drawer */}
          {isEditing && (
            <div className="mt-8 p-6 bg-[#F1EDE0] border border-[#123D27]/20 space-y-4">
              <div className="flex items-center justify-between border-b border-[#123D27]/12 pb-3">
                <div>
                  <h2 className="font-serif-display text-xl font-semibold text-[#123D27]">
                    Editable Brand Narrative
                  </h2>
                  <p className="text-xs text-[#17211B]/75">
                    Tailor the About Us page copy directly. Changes persist automatically in your browser.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onResetBrandStory}
                  className="inline-flex items-center gap-1.5 text-xs text-[#123D27] hover:text-[#C9A34A] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Default Copy</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label
                    htmlFor="about-heading-input"
                    className="block text-xs font-semibold text-[#123D27] mb-1"
                  >
                    Main Heading
                  </label>
                  <input
                    id="about-heading-input"
                    type="text"
                    value={brandStory.heading}
                    onChange={(e) => handleChange('heading', e.target.value)}
                    className="w-full p-2.5 bg-[#F8F6ED] border border-[#123D27]/25 text-sm text-[#17211B]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="about-lead-input"
                    className="block text-xs font-semibold text-[#123D27] mb-1"
                  >
                    Lead Introduction Paragraph
                  </label>
                  <textarea
                    id="about-lead-input"
                    rows={2}
                    value={brandStory.leadParagraph}
                    onChange={(e) =>
                      handleChange('leadParagraph', e.target.value)
                    }
                    className="w-full p-2.5 bg-[#F8F6ED] border border-[#123D27]/25 text-sm text-[#17211B]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="about-philosophy-input"
                      className="block text-xs font-semibold text-[#123D27] mb-1"
                    >
                      Philosophy Narrative
                    </label>
                    <textarea
                      id="about-philosophy-input"
                      rows={3}
                      value={brandStory.philosophyBody}
                      onChange={(e) =>
                        handleChange('philosophyBody', e.target.value)
                      }
                      className="w-full p-2.5 bg-[#F8F6ED] border border-[#123D27]/25 text-sm text-[#17211B]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="about-craft-input"
                      className="block text-xs font-semibold text-[#123D27] mb-1"
                    >
                      Daily Rituals Narrative
                    </label>
                    <textarea
                      id="about-craft-input"
                      rows={3}
                      value={brandStory.craftsmanshipBody}
                      onChange={(e) =>
                        handleChange('craftsmanshipBody', e.target.value)
                      }
                      className="w-full p-2.5 bg-[#F8F6ED] border border-[#123D27]/25 text-sm text-[#17211B]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Editorial Split Story */}
          <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="font-serif-display text-2xl sm:text-3xl text-[#123D27] leading-snug">
                {brandStory.leadParagraph}
              </p>
              <p className="text-base text-[#17211B]/85 leading-relaxed">
                {brandStory.philosophyBody}
              </p>
              <p className="text-base text-[#17211B]/80 leading-relaxed">
                {brandStory.craftsmanshipBody}
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('shop')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#123D27] text-[#F8F6ED] text-sm font-medium hover:bg-[#092719] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Explore Our Formulations</span>
                  <ArrowRight className="w-4 h-4 text-[#C9A34A]" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('contact')}
                  className="inline-flex items-center gap-2 px-6 py-3 border border-[#123D27]/30 text-[#123D27] text-sm font-medium hover:border-[#123D27] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Get in Touch</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="aspect-[4/3] w-full overflow-hidden border border-[#123D27]/15 bg-[#EAE4D3]">
                <ResilientImage
                  src={BRAND_IMAGES.editorialRitual}
                  alt="Traditional Ayurvedic botanical ingredients and brass vessel"
                  fallbackTitle="Prakrutam Ayurveda Philosophy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 md:py-24 bg-[#F1EDE0] border-b border-[#123D27]/12">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 space-y-12">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.18em] text-[#123D27]/70 font-medium">
              OUR GUIDING ETHOS
            </p>
            <h2 className="mt-2 font-serif-display text-3xl sm:text-4xl font-semibold text-[#123D27]">
              Simplicity, Honesty & Botanical Care
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-7 bg-[#F8F6ED] border border-[#123D27]/12 space-y-3">
              <span className="font-mono-tabular text-xs text-[#C9A34A] font-semibold">
                01. TRADITIONAL INSPIRATION
              </span>
              <h3 className="font-serif-display text-2xl font-semibold text-[#123D27]">
                Time-Honoured Ingredients
              </h3>
              <p className="text-sm text-[#17211B]/80 leading-relaxed">
                Our products draw inspiration from familiar Ayurvedic botanicals
                and traditional skincare preparations appreciated across Indian
                households.
              </p>
            </div>

            <div className="p-7 bg-[#F8F6ED] border border-[#123D27]/12 space-y-3">
              <span className="font-mono-tabular text-xs text-[#C9A34A] font-semibold">
                02. MINDFUL PRESENTATION
              </span>
              <h3 className="font-serif-display text-2xl font-semibold text-[#123D27]">
                Uncomplicated Daily Rituals
              </h3>
              <p className="text-sm text-[#17211B]/80 leading-relaxed">
                We focus on essential formats—a soothing topical ointment and a
                gentle botanical bathing bar—making daily skincare calm and
                effortless.
              </p>
            </div>

            <div className="p-7 bg-[#F8F6ED] border border-[#123D27]/12 space-y-3">
              <span className="font-mono-tabular text-xs text-[#C9A34A] font-semibold">
                03. DIRECT CONNECTION
              </span>
              <h3 className="font-serif-display text-2xl font-semibold text-[#123D27]">
                Personal Order Care
              </h3>
              <p className="text-sm text-[#17211B]/80 leading-relaxed">
                Every order placed through our website connects you directly
                with Prakrutam Ayurveda on WhatsApp for transparent, personal
                confirmation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
