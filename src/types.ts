export type PageRoute =
  | 'home'
  | 'shop'
  | 'product'
  | 'about'
  | 'contact'
  | 'cart'
  | 'checkout';

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  size: string;
  category: 'Topical Care' | 'Bathing Rituals';
  shortSubtitle: string;
  description: string;
  usageRitual: string;
  storageCare: string;
  packagingNote: string;
  image: string;
  featured: boolean;
  bestSeller: boolean;
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface EnrichedCartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface CheckoutFormData {
  fullName: string;
  mobile: string;
  streetAddress: string;
  locality: string;
  city: string;
  state: string;
  pinCode: string;
  orderNotes: string;
}

export type CheckoutValidationErrors = Partial<Record<keyof CheckoutFormData, string>>;

export interface ContactFormData {
  name: string;
  mobile: string;
  message: string;
}

export type ContactValidationErrors = Partial<Record<keyof ContactFormData, string>>;

export interface EditableBrandStory {
  heading: string;
  leadParagraph: string;
  philosophyBody: string;
  craftsmanshipBody: string;
}
