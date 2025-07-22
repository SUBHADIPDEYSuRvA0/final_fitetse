require('dotenv').config();
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a new Razorpay order
 * @param {number} amount - Amount in paise
 * @param {string} currency - Currency code (INR, USD, etc.)
 * @param {string} receipt - Receipt ID
 * @param {object} notes - Additional notes
 * @returns {Promise<object>} Razorpay order object
 */
function createOrder(amount, currency = 'INR', receipt, notes = {}) {
  const options = {
    amount: Math.round(amount * 100), // Razorpay expects paise
    currency: currency.toUpperCase(),
    receipt: receipt || `receipt_${Date.now()}`,
    payment_capture: 1,
    notes: notes
  };
  
  return razorpay.orders.create(options);
}

/**
 * Verify payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} True if signature is valid
 */
function verifySignature(orderId, paymentId, signature) {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
  hmac.update(orderId + '|' + paymentId);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
}

/**
 * Get payment details from Razorpay
 * @param {string} paymentId - Razorpay payment ID
 * @returns {Promise<object>} Payment details
 */
function getPaymentDetails(paymentId) {
  return razorpay.payments.fetch(paymentId);
}

/**
 * Get order details from Razorpay
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<object>} Order details
 */
function getOrderDetails(orderId) {
  return razorpay.orders.fetch(orderId);
}

/**
 * Create a refund
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Amount to refund in paise
 * @param {string} reason - Refund reason
 * @returns {Promise<object>} Refund details
 */
function createRefund(paymentId, amount = null, reason = '') {
  const options = {
    payment_id: paymentId,
    notes: {
      reason: reason
    }
  };
  
  if (amount) {
    options.amount = Math.round(amount * 100);
  }
  
  return razorpay.payments.refund(options);
}

/**
 * Get refund details
 * @param {string} refundId - Razorpay refund ID
 * @returns {Promise<object>} Refund details
 */
function getRefundDetails(refundId) {
  return razorpay.payments.fetchRefund(refundId);
}

/**
 * Get all payments for an order
 * @param {string} orderId - Razorpay order ID
 * @returns {Promise<object>} Payments list
 */
function getOrderPayments(orderId) {
  return razorpay.orders.fetchPayments(orderId);
}

/**
 * Create a payment link
 * @param {object} options - Payment link options
 * @returns {Promise<object>} Payment link details
 */
function createPaymentLink(options) {
  const defaultOptions = {
    amount: 0,
    currency: 'INR',
    accept_partial: false,
    reference_id: `ref_${Date.now()}`,
    description: 'Payment for services',
    callback_url: process.env.RAZORPAY_CALLBACK_URL,
    callback_method: 'get'
  };
  
  const paymentLinkOptions = { ...defaultOptions, ...options };
  
  // Convert amount to paise if it's not already
  if (paymentLinkOptions.amount < 1000) {
    paymentLinkOptions.amount = Math.round(paymentLinkOptions.amount * 100);
  }
  
  return razorpay.paymentLink.create(paymentLinkOptions);
}

/**
 * Get payment link details
 * @param {string} paymentLinkId - Payment link ID
 * @returns {Promise<object>} Payment link details
 */
function getPaymentLinkDetails(paymentLinkId) {
  return razorpay.paymentLink.fetch(paymentLinkId);
}

/**
 * Cancel a payment link
 * @param {string} paymentLinkId - Payment link ID
 * @returns {Promise<object>} Cancellation details
 */
function cancelPaymentLink(paymentLinkId) {
  return razorpay.paymentLink.cancel(paymentLinkId);
}

/**
 * Verify webhook signature
 * @param {string} body - Raw request body
 * @param {string} signature - Webhook signature
 * @returns {boolean} True if signature is valid
 */
function verifyWebhookSignature(body, signature) {
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
  hmac.update(body);
  const generatedSignature = hmac.digest('hex');
  return generatedSignature === signature;
}

/**
 * Get supported payment methods
 * @returns {object} Supported payment methods
 */
function getSupportedPaymentMethods() {
  return {
    card: {
      name: 'Credit/Debit Card',
      icon: 'bi-credit-card',
      description: 'Pay with Visa, MasterCard, RuPay, etc.'
    },
    netbanking: {
      name: 'Net Banking',
      icon: 'bi-bank',
      description: 'Pay using your bank account'
    },
    wallet: {
      name: 'Digital Wallet',
      icon: 'bi-phone',
      description: 'Pay using Paytm, PhonePe, etc.'
    },
    upi: {
      name: 'UPI',
      icon: 'bi-phone',
      description: 'Pay using UPI apps'
    },
    emi: {
      name: 'EMI',
      icon: 'bi-calendar-month',
      description: 'Pay in monthly installments'
    }
  };
}

/**
 * Format amount for display
 * @param {number} amount - Amount in paise
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
function formatAmount(amount, currency = 'INR') {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2
  });
  
  // Convert from paise to rupees
  const amountInRupees = amount / 100;
  return formatter.format(amountInRupees);
}

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
function getCurrencySymbol(currency) {
  const symbols = {
    'INR': '₹',
    'USD': '$',
    'EUR': '€',
    'GBP': '£'
  };
  return symbols[currency.toUpperCase()] || currency;
}

module.exports = {
  createOrder,
  verifySignature,
  getPaymentDetails,
  getOrderDetails,
  createRefund,
  getRefundDetails,
  getOrderPayments,
  createPaymentLink,
  getPaymentLinkDetails,
  cancelPaymentLink,
  verifyWebhookSignature,
  getSupportedPaymentMethods,
  formatAmount,
  getCurrencySymbol,
  razorpay
}; 