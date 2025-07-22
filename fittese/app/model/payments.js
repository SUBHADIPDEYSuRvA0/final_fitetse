const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  plan: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Plans", 
    required: true 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  originalAmount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  currency: { 
    type: String, 
    required: true,
    default: 'INR'
  },
  currencySymbol: {
    type: String,
    default: '₹'
  },
  status: { 
    type: String, 
    enum: ["pending", "created", "paid", "failed", "refunded", "cancelled"], 
    default: "pending" 
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'netbanking', 'wallet', 'upi', 'emi'],
    default: 'card'
  },
  razorpayOrderId: { 
    type: String,
    unique: true
  },
  razorpayPaymentId: { 
    type: String,
    unique: true,
    sparse: true
  },
  razorpaySignature: { 
    type: String 
  },
  razorpayRefundId: {
    type: String
  },
  description: {
    type: String
  },
  notes: {
    type: String
  },
  billingDetails: {
    name: String,
    email: String,
    phone: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String
    }
  },
  metadata: {
    type: Map,
    of: String
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: {
    type: String
  },
  refundedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency,
    minimumFractionDigits: 2
  }).format(this.amount / 100);
});

// Virtual field for formatted original amount
paymentSchema.virtual('formattedOriginalAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency,
    minimumFractionDigits: 2
  }).format(this.originalAmount / 100);
});

// Virtual field for formatted refund amount
paymentSchema.virtual('formattedRefundAmount').get(function() {
  if (this.refundAmount > 0) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2
    }).format(this.refundAmount / 100);
  }
  return null;
});

// Virtual field for payment status badge
paymentSchema.virtual('statusBadge').get(function() {
  const statusClasses = {
    pending: 'badge bg-warning',
    created: 'badge bg-info',
    paid: 'badge bg-success',
    failed: 'badge bg-danger',
    refunded: 'badge bg-secondary',
    cancelled: 'badge bg-dark'
  };
  return statusClasses[this.status] || 'badge bg-secondary';
});

// Indexes for better query performance
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });
paymentSchema.index({ plan: 1, status: 1 });

// Pre-save middleware to set defaults
paymentSchema.pre('save', function(next) {
  // Set original amount if not set
  if (!this.originalAmount) {
    this.originalAmount = this.amount;
  }
  
  // Set expiry time (24 hours from creation)
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
  
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
