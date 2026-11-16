import {
  CartItem,
  CheckoutFormData,
  CheckoutValidationErrors,
  ContactFormData,
  ContactValidationErrors,
  EnrichedCartItem,
  Product,
} from '../types';
import { WHATSAPP_CONFIG } from '../data/products';

export function addToCartItems(
  currentCart: CartItem[],
  productId: string,
  quantityToAdd: number = 1
): CartItem[] {
  const safeQty = Math.max(1, Math.floor(quantityToAdd));
  const existingIndex = currentCart.findIndex((item) => item.productId === productId);

  if (existingIndex > -1) {
    return currentCart.map((item, idx) =>
      idx === existingIndex
        ? { ...item, quantity: item.quantity + safeQty }
        : item
    );
  }

  return [...currentCart, { productId, quantity: safeQty }];
}

export function updateCartItemQuantity(
  currentCart: CartItem[],
  productId: string,
  newQuantity: number
): CartItem[] {
  const safeQty = Math.floor(newQuantity);
  if (safeQty <= 0) {
    return removeFromCartItems(currentCart, productId);
  }
  return currentCart.map((item) =>
    item.productId === productId ? { ...item, quantity: safeQty } : item
  );
}

export function removeFromCartItems(
  currentCart: CartItem[],
  productId: string
): CartItem[] {
  return currentCart.filter((item) => item.productId !== productId);
}

export function calculateCartSummary(
  cart: CartItem[],
  products: Product[]
): {
  items: EnrichedCartItem[];
  totalItemsCount: number;
  subtotalAmount: number;
  totalAmount: number;
} {
  const items: EnrichedCartItem[] = [];
  let totalItemsCount = 0;
  let subtotalAmount = 0;

  for (const cartItem of cart) {
    const product = products.find((p) => p.id === cartItem.productId);
    if (product && cartItem.quantity > 0) {
      const subtotal = product.price * cartItem.quantity;
      items.push({
        product,
        quantity: cartItem.quantity,
        subtotal,
      });
      totalItemsCount += cartItem.quantity;
      subtotalAmount += subtotal;
    }
  }

  return {
    items,
    totalItemsCount,
    subtotalAmount,
    totalAmount: subtotalAmount,
  };
}

export function normalizeIndianPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export function validateCheckoutForm(
  data: CheckoutFormData
): CheckoutValidationErrors {
  const errors: CheckoutValidationErrors = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name.';
  }

  const normalizedPhone = normalizeIndianPhone(data.mobile || '');
  if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
    errors.mobile = 'Please enter a valid 10-digit Indian mobile number.';
  }

  if (!data.streetAddress || data.streetAddress.trim().length < 3) {
    errors.streetAddress = 'Please enter your house, building, or street address.';
  }

  if (!data.locality || data.locality.trim().length < 2) {
    errors.locality = 'Please enter your area or locality.';
  }

  if (!data.city || data.city.trim().length < 2) {
    errors.city = 'Please enter your city or town.';
  }

  if (!data.state || data.state.trim().length < 2) {
    errors.state = 'Please enter your state.';
  }

  const cleanPin = (data.pinCode || '').trim();
  if (!/^[1-9]\d{5}$/.test(cleanPin)) {
    errors.pinCode = 'Please enter a valid 6-digit PIN code.';
  }

  return errors;
}

export function formatWhatsAppOrderMessage(
  items: EnrichedCartItem[],
  totalAmount: number,
  customer: CheckoutFormData
): string {
  const normalizedPhone = normalizeIndianPhone(customer.mobile);
  const orderLines = items
    .map(
      (item, index) =>
        `${index + 1}. ${item.product.name}\n   Quantity: ${item.quantity}\n   Price: ₹${item.product.price}\n   Subtotal: ₹${item.subtotal}`
    )
    .join('\n\n');

  const addressParts = [
    customer.streetAddress.trim(),
    customer.locality.trim(),
    customer.city.trim(),
    customer.state.trim(),
  ].filter(Boolean);

  const addressLine = addressParts.join(', ');
  const notesBlock =
    customer.orderNotes && customer.orderNotes.trim().length > 0
      ? `\nOrder Notes: ${customer.orderNotes.trim()}`
      : '';

  return [
    'Hello Prakrutam Ayurveda!',
    '',
    'I would like to place an order.',
    '',
    'ORDER DETAILS:',
    '',
    orderLines,
    '',
    `TOTAL: ₹${totalAmount}`,
    '',
    'CUSTOMER DETAILS:',
    '',
    `Name: ${customer.fullName.trim()}`,
    `Mobile: ${normalizedPhone}`,
    `Address: ${addressLine}`,
    `PIN Code: ${customer.pinCode.trim()}${notesBlock}`,
    '',
    'Please confirm my order.',
  ].join('\n');
}

export function buildWhatsAppOrderUrl(
  items: EnrichedCartItem[],
  totalAmount: number,
  customer: CheckoutFormData
): string {
  const message = formatWhatsAppOrderMessage(items, totalAmount, customer);
  return `https://wa.me/${WHATSAPP_CONFIG.internationalNumber}?text=${encodeURIComponent(message)}`;
}

export function validateContactForm(
  data: ContactFormData
): ContactValidationErrors {
  const errors: ContactValidationErrors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Please enter your name.';
  }

  const normalizedPhone = normalizeIndianPhone(data.mobile || '');
  if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
    errors.mobile = 'Please enter a valid 10-digit mobile number.';
  }

  if (!data.message || data.message.trim().length < 5) {
    errors.message = 'Please enter a message (at least 5 characters).';
  }

  return errors;
}

export function buildWhatsAppContactUrl(data: ContactFormData): string {
  const normalizedPhone = normalizeIndianPhone(data.mobile);
  const text = [
    'Hello Prakrutam Ayurveda!',
    '',
    'I have an inquiry from your website:',
    '',
    `Name: ${data.name.trim()}`,
    `Mobile: ${normalizedPhone}`,
    `Message: ${data.message.trim()}`,
  ].join('\n');

  return `https://wa.me/${WHATSAPP_CONFIG.internationalNumber}?text=${encodeURIComponent(text)}`;
}
