import { Product, EditableBrandStory } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-gandhak-malam',
    slug: 'gandhak-malam',
    name: 'Gandhak Malam',
    price: 199,
    size: '25g',
    category: 'Topical Care',
    shortSubtitle: 'Traditional Ayurvedic Topical Skincare Preparation',
    description:
      'An Ayurvedic-inspired topical skincare product presented by Prakrutam Ayurveda.',
    usageRitual:
      'Cleanse and gently dry the skin area before application. Apply a thin, even layer as part of your daily or evening topical skincare routine, or as directed on the product packaging.',
    storageCare:
      'Store in a cool, dry place away from direct sunlight. Keep the container tightly closed after each use.',
    packagingNote:
      'Presented in a 25g protective apothecary jar and outer carton clearly displaying Prakrutam Ayurveda labeling.',
    image: '/src/assets/images/product_gandhak_malam_1794823861347.jpg',
    featured: true,
    bestSeller: true,
  },
  {
    id: 'prod-neem-sabun',
    slug: 'neem-sabun',
    name: 'Neem Sabun',
    price: 50,
    size: '100g',
    category: 'Bathing Rituals',
    shortSubtitle: 'Botanical Neem Bathing Bar for Daily Cleansing',
    description:
      'A neem-based bathing soap from Prakrutam Ayurveda.',
    usageRitual:
      'Wet skin with lukewarm water, work the bar into a gentle lather between your palms, massage across the skin during your daily bath, and rinse thoroughly.',
    storageCare:
      'Place on a well-drained soap dish between uses to preserve the bar texture and longevity.',
    packagingNote:
      'Presented as a 100g solid bathing bar housed in Prakrutam Ayurveda botanical paperboard packaging.',
    image: '/src/assets/images/product_neem_sabun_1794823863275.jpg',
    featured: true,
    bestSeller: true,
  },
];

export const INITIAL_BRAND_STORY: EditableBrandStory = {
  heading: 'Rooted in Nature, Inspired by Ayurveda.',
  leadParagraph:
    'Prakrutam Ayurveda was conceived with a singular devotion: to bring the quiet clarity of traditional Ayurvedic skincare into simple, honest daily rituals.',
  philosophyBody:
    'We believe skincare does not require overly complex routines. Instead, our approach focuses on nature-inspired formulations presented with transparency, calm simplicity, and respect for time-honoured botanical traditions.',
  craftsmanshipBody:
    'Every Prakrutam Ayurveda presentation—from our topical Gandhak Malam to our daily Neem Sabun bathing bar—is created for individuals and families seeking straightforward, grounded personal care.',
};

export const BRAND_IMAGES = {
  heroBotanical: '/src/assets/images/hero_ayurveda_botanical_1794823860619.jpg',
  gandhakMalam: '/src/assets/images/product_gandhak_malam_1794823861347.jpg',
  neemSabun: '/src/assets/images/product_neem_sabun_1794823863275.jpg',
  editorialRitual: '/src/assets/images/editorial_ayurveda_ritual_1794823863884.jpg',
};

export const WHATSAPP_CONFIG = {
  displayNumber: '+91 9714369430',
  rawNumber: '9714369430',
  internationalNumber: '919714369430',
  instagramUrl: 'https://www.instagram.com/prakrutam_ayurveda/',
  instagramHandle: '@prakrutam_ayurveda',
};
