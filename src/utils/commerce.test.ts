import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addToCartItems,
  updateCartItemQuantity,
  removeFromCartItems,
  calculateCartSummary,
  validateCheckoutForm,
  formatWhatsAppOrderMessage,
  buildWhatsAppOrderUrl,
  validateContactForm,
} from './commerce';
import { INITIAL_PRODUCTS } from '../data/products';

test('cart operations: add, increment, update, remove, and calculate totals accurately', () => {
  let cart = addToCartItems([], 'prod-gandhak-malam', 2);
  cart = addToCartItems(cart, 'prod-neem-sabun', 3);

  const summary = calculateCartSummary(cart, INITIAL_PRODUCTS);
  assert.equal(summary.items.length, 2);
  assert.equal(summary.totalItemsCount, 5);
  // 2 * 199 = 398, 3 * 50 = 150 => total = 548
  assert.equal(summary.items[0].subtotal, 398);
  assert.equal(summary.items[1].subtotal, 150);
  assert.equal(summary.subtotalAmount, 548);
  assert.equal(summary.totalAmount, 548);

  // Updating quantity to 0 removes item
  const updated = updateCartItemQuantity(cart, 'prod-neem-sabun', 0);
  assert.equal(updated.length, 1);

  const removed = removeFromCartItems(updated, 'prod-gandhak-malam');
  assert.equal(removed.length, 0);
});

test('checkout validation catches invalid phone numbers, PIN codes, and empty fields', () => {
  const invalidErrors = validateCheckoutForm({
    fullName: '',
    mobile: '12345',
    streetAddress: '',
    locality: '',
    city: '',
    state: '',
    pinCode: '0123',
    orderNotes: '',
  });

  assert.ok(invalidErrors.fullName);
  assert.ok(invalidErrors.mobile);
  assert.ok(invalidErrors.streetAddress);
  assert.ok(invalidErrors.locality);
  assert.ok(invalidErrors.city);
  assert.ok(invalidErrors.state);
  assert.ok(invalidErrors.pinCode);

  const validErrors = validateCheckoutForm({
    fullName: 'Rahul Patel',
    mobile: '9876543210',
    streetAddress: '12 Heritage Villa',
    locality: 'Vallabh Vidyanagar',
    city: 'Anand',
    state: 'Gujarat',
    pinCode: '388001',
    orderNotes: 'Deliver in morning',
  });

  assert.equal(Object.keys(validErrors).length, 0);
});

test('WhatsApp order message and URL match exact specification for 919714369430', () => {
  let cart = addToCartItems([], 'prod-gandhak-malam', 2);
  cart = addToCartItems(cart, 'prod-neem-sabun', 3);
  const summary = calculateCartSummary(cart, INITIAL_PRODUCTS);

  const customer = {
    fullName: 'Rahul Patel',
    mobile: '9876543210',
    streetAddress: 'Station Road',
    locality: 'Civil Lines',
    city: 'Anand',
    state: 'Gujarat',
    pinCode: '388001',
    orderNotes: '',
  };

  const message = formatWhatsAppOrderMessage(
    summary.items,
    summary.totalAmount,
    customer
  );

  assert.ok(message.includes('Hello Prakrutam Ayurveda!'));
  assert.ok(message.includes('1. Gandhak Malam\n   Quantity: 2\n   Price: ₹199\n   Subtotal: ₹398'));
  assert.ok(message.includes('2. Neem Sabun\n   Quantity: 3\n   Price: ₹50\n   Subtotal: ₹150'));
  assert.ok(message.includes('TOTAL: ₹548'));
  assert.ok(message.includes('Name: Rahul Patel'));
  assert.ok(message.includes('Mobile: 9876543210'));
  assert.ok(message.includes('PIN Code: 388001'));
  assert.ok(message.includes('Please confirm my order.'));

  const url = buildWhatsAppOrderUrl(summary.items, summary.totalAmount, customer);
  assert.ok(url.startsWith('https://wa.me/919714369430?text='));
});

test('contact form validation enforces required fields and valid mobile', () => {
  const err = validateContactForm({ name: 'A', mobile: '555', message: 'Hi' });
  assert.ok(err.name);
  assert.ok(err.mobile);
  assert.ok(err.message);

  const ok = validateContactForm({
    name: 'Meera Shah',
    mobile: '+91 9876543210',
    message: 'I would like to inquire about bulk orders of Neem Sabun.',
  });
  assert.equal(Object.keys(ok).length, 0);
});
