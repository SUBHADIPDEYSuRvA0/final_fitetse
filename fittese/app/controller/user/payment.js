const { 
  createOrder, 
  verifySignature, 
  getPaymentDetails, 
  getOrderDetails,
  createRefund,
  getRefundDetails,
  createPaymentLink,
  verifyWebhookSignature,
  getSupportedPaymentMethods,
  formatAmount,
  getCurrencySymbol
} = require('../../utils/razorpay');
const Payment = require('../../model/payments');
const Plan = require('../../model/plans');
const User = require('../../model/user');
const sendEmail = require('../../utils/email');
const Slot = require('../../model/slots');
const Meeting = require('../../model/meetings');

/**
 * Create a new payment order
 */
exports.createOrder = async (req, res) => {
  try {
    const { planId, slotType, billingDetails, currency, amount } = req.body;
    const userId = req.user && req.user._id ? req.user._id : req.body.userId;
    
    // Validate inputs
    if (!planId || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Plan ID and User ID are required' 
      });
    }

    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ 
        success: false, 
        message: 'Plan not found' 
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Use amount and currency from frontend (already in smallest unit)
    const shortReceipt = `o_${Date.now()}_${userId}`.slice(0, 40);
    // Debug log
    console.log('Creating Razorpay order with:', { amount, currency, userId, planId });
    // Razorpay max per order (as of 2024):
    const maxAmounts = {
      INR: 50000000, // ₹5,00,000 in paise
      USD: 700000,   // $7,000 in cents
      EUR: 700000,   // €7,000 in cents
      GBP: 700000,   // £7,000 in pence
      SGD: 700000,   // S$7,000 in cents
      AUD: 700000,   // A$7,000 in cents
      CAD: 700000,   // C$7,000 in cents
      AED: 700000,   // د.إ7,000 in fils
      JPY: 100000000 // ¥1,000,000 in sen (Razorpay may have different for JPY)
    };
    const max = maxAmounts[currency] || 700000; // Default to $7,000 equivalent
    if (amount > max) {
      return res.status(400).json({
        success: false,
        message: `Amount exceeds Razorpay's maximum for ${currency}. Please select a lower-priced plan or currency.`
      });
    }
    const order = await createOrder(
      amount, // Already in smallest unit
      currency,
      shortReceipt,
      {
        userId: userId,
        planName: plan.planname
      }
    );

    // Create payment record
    const payment = new Payment({
      user: userId,
      plan: planId,
      amount: amount, // Already in smallest unit
      originalAmount: Math.round(plan.setprice.price * 100),
      discount: plan.setprice.discount || 0,
      currency: currency,
      currencySymbol: plan.setprice.currencySymbol,
      status: 'created',
      razorpayOrderId: order.id,
      description: `Payment for ${plan.planname}`,
      billingDetails: billingDetails || {
        name: user.name,
        email: user.email,
        phone: user.phone || ''
      },
      metadata: {
        planName: plan.planname,
        planDuration: `${plan.duration} ${plan.durationUnit}`,
        totalSessions: plan.totalsessions.toString(),
        slotType: slotType || ''
      }
    });

    await payment.save();

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt
      },
      payment: {
        id: payment._id,
        amount: formatAmount(payment.amount, payment.currency),
        originalAmount: formatAmount(payment.originalAmount, payment.currency),
        discount: payment.discount,
        currency: payment.currency,
        currencySymbol: payment.currencySymbol,
        userId: payment.user,
        planId: payment.plan,
        slotType: slotType || ''
      },
      plan: {
        name: plan.planname,
        description: plan.description,
        duration: `${plan.duration} ${plan.durationUnit}`,
        sessions: plan.totalsessions
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Order creation failed', 
      error: error.message 
    });
  }
};

/**
 * Verify payment and update status
 */
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId, signature, planId, slotType } = req.body;
    const userId = req.user && req.user._id ? req.user._id : req.body.userId;
    
    // Validate inputs
    if (!orderId || !paymentId || !signature || !planId || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'All payment details are required' 
      });
    }

    // Verify signature
    if (!verifySignature(orderId, paymentId, signature)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid payment signature' 
      });
    }

    // Get payment details from Razorpay
    const razorpayPayment = await getPaymentDetails(paymentId);
    
    // Find existing payment record
    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment record not found' 
      });
    }

    // Update payment record
    payment.status = 'paid';
    payment.razorpayPaymentId = paymentId;
    payment.razorpaySignature = signature;
    payment.paymentMethod = razorpayPayment.method || 'card';
    payment.metadata.set('razorpayPaymentMethod', razorpayPayment.method);
    payment.metadata.set('razorpayBank', razorpayPayment.bank || '');
    payment.metadata.set('razorpayWallet', razorpayPayment.wallet || '');
    payment.metadata.set('razorpayVpa', razorpayPayment.vpa || '');
    payment.metadata.set('razorpayEmail', razorpayPayment.email || '');
    payment.metadata.set('razorpayContact', razorpayPayment.contact || '');
    if (slotType) payment.metadata.set('slotType', slotType);
    await payment.save();

    // Get plan and user details
    const plan = await Plan.findById(planId);
    const user = await User.findById(userId);

    // Add plan to user's purchased plans
    await User.findByIdAndUpdate(userId, { 
      $addToSet: { 
        purchasedPlans: {
          plan: planId,
          purchasedAt: new Date(),
          paymentId: payment._id,
          expiresAt: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000) // Based on plan duration
        }
      } 
    });

    // Send confirmation email
    if (user && user.email) {
      try {
        await sendEmail({
          to: user.email,
          subject: 'Payment Successful - Plan Activated',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #28a745;">Payment Successful! 🎉</h2>
              <p>Dear ${user.name},</p>
              <p>Your payment for <strong>${plan.planname}</strong> has been successfully processed.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3>Payment Details:</h3>
                <p><strong>Amount:</strong> ${formatAmount(payment.amount, payment.currency)}</p>
                <p><strong>Plan:</strong> ${plan.planname}</p>
                <p><strong>Duration:</strong> ${plan.duration} ${plan.durationUnit}</p>
                <p><strong>Sessions:</strong> ${plan.totalsessions}</p>
                <p><strong>Payment ID:</strong> ${paymentId}</p>
              </div>
              
              <p>Your plan is now active and you can start your fitness journey!</p>
              <p>Thank you for choosing our services.</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }
    }

    res.json({ 
      success: true, 
      message: 'Payment verified and recorded successfully',
      payment: {
        id: payment._id,
        amount: formatAmount(payment.amount, payment.currency),
        status: payment.status,
        paymentMethod: payment.paymentMethod
      }
    });

    // Auto-schedule a meeting after payment
    const slot = await Slot.findOne({ status: "available" });
    if (slot) {
      slot.status = "booked";
      await slot.save();
      const meeting = new Meeting({
        user: userId,
        slot: slot._id,
        status: "scheduled"
      });
      await meeting.save();
      // Optionally, send meeting link/email here
    }

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Payment verification failed', 
      error: error.message 
    });
  }
};

/**
 * Get payment history for a user
 */
exports.getPaymentHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('plan', 'planname description')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      payments: payments.map(payment => ({
        id: payment._id,
        amount: formatAmount(payment.amount, payment.currency),
        originalAmount: formatAmount(payment.originalAmount, payment.currency),
        discount: payment.discount,
        currency: payment.currency,
        currencySymbol: payment.currencySymbol,
        status: payment.status,
        statusBadge: payment.statusBadge,
        paymentMethod: payment.paymentMethod,
        plan: payment.plan,
        createdAt: payment.createdAt,
        paidAt: payment.status === 'paid' ? payment.updatedAt : null
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment history', 
      error: error.message 
    });
  }
};

/**
 * Get payment details
 */
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate('user', 'name email')
      .populate('plan', 'planname description features')
      .lean();

    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    res.json({
      success: true,
      payment: {
        id: payment._id,
        amount: formatAmount(payment.amount, payment.currency),
        originalAmount: formatAmount(payment.originalAmount, payment.currency),
        discount: payment.discount,
        currency: payment.currency,
        currencySymbol: payment.currencySymbol,
        status: payment.status,
        statusBadge: payment.statusBadge,
        paymentMethod: payment.paymentMethod,
        description: payment.description,
        billingDetails: payment.billingDetails,
        metadata: Object.fromEntries(payment.metadata || new Map()),
        user: payment.user,
        plan: payment.plan,
        razorpayOrderId: payment.razorpayOrderId,
        razorpayPaymentId: payment.razorpayPaymentId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        expiresAt: payment.expiresAt
      }
    });

  } catch (error) {
    console.error('Error fetching payment details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment details', 
      error: error.message 
    });
  }
};

/**
 * Create refund for a payment
 */
exports.createRefund = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Payment not found' 
      });
    }

    if (payment.status !== 'paid') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only paid payments can be refunded' 
      });
    }

    if (!payment.razorpayPaymentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Razorpay payment ID not found' 
      });
    }

    // Create refund in Razorpay
    const refundAmount = amount ? amount * 100 : null; // Convert to paise
    const razorpayRefund = await createRefund(payment.razorpayPaymentId, refundAmount, reason);

    // Update payment record
    payment.status = 'refunded';
    payment.refundAmount = razorpayRefund.amount;
    payment.refundReason = reason;
    payment.razorpayRefundId = razorpayRefund.id;
    payment.refundedAt = new Date();

    await payment.save();

    res.json({
      success: true,
      message: 'Refund created successfully',
      refund: {
        id: razorpayRefund.id,
        amount: formatAmount(razorpayRefund.amount, payment.currency),
        status: razorpayRefund.status,
        reason: reason
      }
    });

  } catch (error) {
    console.error('Error creating refund:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create refund', 
      error: error.message 
    });
  }
};

/**
 * Handle Razorpay webhooks
 */
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid webhook signature' 
      });
    }

    const event = req.body;

    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event.payload.payment.entity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.payload.payment.entity);
        break;
      case 'refund.processed':
        await handleRefundProcessed(event.payload.refund.entity);
        break;
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    res.json({ success: true, message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Webhook processing failed', 
      error: error.message 
    });
  }
};

/**
 * Handle payment captured webhook
 */
async function handlePaymentCaptured(paymentEntity) {
  try {
    const payment = await Payment.findOne({ 
      razorpayPaymentId: paymentEntity.id 
    });

    if (payment && payment.status !== 'paid') {
      payment.status = 'paid';
      payment.paymentMethod = paymentEntity.method;
      await payment.save();

      console.log(`Payment ${paymentEntity.id} marked as paid`);
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
}

/**
 * Handle payment failed webhook
 */
async function handlePaymentFailed(paymentEntity) {
  try {
    const payment = await Payment.findOne({ 
      razorpayPaymentId: paymentEntity.id 
    });

    if (payment) {
      payment.status = 'failed';
      payment.metadata.set('failureReason', paymentEntity.error_description || 'Payment failed');
      await payment.save();

      console.log(`Payment ${paymentEntity.id} marked as failed`);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

/**
 * Handle refund processed webhook
 */
async function handleRefundProcessed(refundEntity) {
  try {
    const payment = await Payment.findOne({ 
      razorpayRefundId: refundEntity.id 
    });

    if (payment) {
      payment.status = 'refunded';
      payment.refundAmount = refundEntity.amount;
      payment.refundedAt = new Date();
      await payment.save();

      console.log(`Refund ${refundEntity.id} processed for payment ${payment.razorpayPaymentId}`);
    }
  } catch (error) {
    console.error('Error handling refund processed:', error);
  }
}

/**
 * Get supported payment methods
 */
exports.getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = getSupportedPaymentMethods();
    
    res.json({
      success: true,
      paymentMethods
    });

  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch payment methods', 
      error: error.message 
    });
  }
}; 