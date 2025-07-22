"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "./Invoice.css"

const Invoice = () => {
  // Sample invoice data - this would come from Razorpay payment success
  const [invoiceData] = useState({
    invoiceNumber: "INV-2025-001",
    invoiceDate: "2025-01-16",
    dueDate: "2025-01-16", // Immediate for subscription
    status: "Paid",

    // Company details
    company: {
      name: "FITETSE",
      address: "123 Fitness Street",
      city: "New York, NY 10001",
      country: "United States",
      phone: "+1 (555) 123-4567",
      email: "billing@fitetse.com",
      website: "www.fitetse.com",
      taxId: "TAX-123456789",
    },

    // Customer details
    customer: {
      name: "John Doe",
      email: "john.doe@email.com",
      address: "456 Customer Avenue",
      city: "Los Angeles, CA 90210",
      country: "United States",
      phone: "+1 (555) 987-6543",
    },

    // Subscription items only
    items: [
      {
        id: 1,
        description: "Premium Plan - 3 Month Subscription",
        details:
          "Comprehensive program for health and fitness transformation including personalized diet plan, live online fitness classes, progress tracking, recipe database, email support, online coaching sessions, and advanced fitness assessments",
        quantity: 1,
        unitPrice: 1500.0,
        total: 1500.0,
      },
    ],

    // Pricing breakdown (no tax)
    subtotal: 1500.0,
    discount: 0.0,
    total: 1500.0,

    // Payment confirmation (no sensitive details)
    paymentStatus: "Completed",
    paymentDate: "2025-01-16",
    paymentGateway: "Razorpay",
    razorpayOrderId: "order_ABC123XYZ789",
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real application, this would generate and download a PDF
    alert("PDF download functionality would be implemented here")
  }

  return (
    <div className="invoice-container">
      <div className="invoice-wrapper">
        {/* Header Actions with Back Button */}
        <div className="invoice-actions no-print">
          <Link to="/" className="back-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Back to Homepage
          </Link>
          <div className="action-buttons">
            <button onClick={handlePrint} className="action-btn print-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Print
            </button>
            <button onClick={handleDownload} className="action-btn download-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Download PDF
            </button>
          </div>
        </div>

        {/* Success Message */}
        <div className="success-banner">
          <div className="success-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22 11.08V12a10 10 0 11-5.93-9.14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 4L12 14.01l-3-3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="success-text">
            <strong>Payment Successful!</strong> Thank you for your subscription.
          </div>
        </div>

        {/* Invoice Header */}
        <div className="invoice-header">
          <div className="company-info">
            <h1 className="company-name">{invoiceData.company.name}</h1>
            <div className="company-details">
              <p>{invoiceData.company.address}</p>
              <p>{invoiceData.company.city}</p>
              <p>{invoiceData.company.country}</p>
              <p>Phone: {invoiceData.company.phone}</p>
              <p>Email: {invoiceData.company.email}</p>
              <p>Tax ID: {invoiceData.company.taxId}</p>
            </div>
          </div>

          <div className="invoice-info">
            <h2 className="invoice-title">INVOICE</h2>
            <div className="invoice-details">
              <div className="detail-row">
                <span className="label">Invoice #:</span>
                <span className="value">{invoiceData.invoiceNumber}</span>
              </div>
              <div className="detail-row">
                <span className="label">Date:</span>
                <span className="value">{formatDate(invoiceData.invoiceDate)}</span>
              </div>
              <div className="detail-row">
                <span className="label">Status:</span>
                <span className={`status ${invoiceData.status.toLowerCase()}`}>{invoiceData.status}</span>
              </div>
              <div className="detail-row">
                <span className="label">Order ID:</span>
                <span className="value">{invoiceData.razorpayOrderId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bill To Section */}
        <div className="billing-section">
          <div className="bill-to">
            <h3>Bill To:</h3>
            <div className="customer-details">
              <p className="customer-name">{invoiceData.customer.name}</p>
              <p>{invoiceData.customer.address}</p>
              <p>{invoiceData.customer.city}</p>
              <p>{invoiceData.customer.country}</p>
              <p>Email: {invoiceData.customer.email}</p>
              <p>Phone: {invoiceData.customer.phone}</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="items-section">
          <table className="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className="item-description">
                      <strong>{item.description}</strong>
                      <p className="item-details">{item.details}</p>
                    </div>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td>{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section (No Tax) */}
        <div className="totals-section">
          <div className="totals-table">
            <div className="total-row">
              <span className="total-label">Subtotal:</span>
              <span className="total-value">{formatCurrency(invoiceData.subtotal)}</span>
            </div>
            {invoiceData.discount > 0 && (
              <div className="total-row">
                <span className="total-label">Discount:</span>
                <span className="total-value">-{formatCurrency(invoiceData.discount)}</span>
              </div>
            )}
            <div className="total-row grand-total">
              <span className="total-label">Total Amount:</span>
              <span className="total-value">{formatCurrency(invoiceData.total)}</span>
            </div>
          </div>
        </div>

        {/* Payment Information (No Sensitive Details) */}
        <div className="payment-section">
          <h3>Payment Information</h3>
          <div className="payment-details">
            <div className="payment-row">
              <span className="payment-label">Payment Status:</span>
              <span className="payment-value status-completed">{invoiceData.paymentStatus}</span>
            </div>
            <div className="payment-row">
              <span className="payment-label">Payment Date:</span>
              <span className="payment-value">{formatDate(invoiceData.paymentDate)}</span>
            </div>
            <div className="payment-row">
              <span className="payment-label">Payment Gateway:</span>
              <span className="payment-value">{invoiceData.paymentGateway}</span>
            </div>
            <div className="payment-row">
              <span className="payment-label">Order ID:</span>
              <span className="payment-value">{invoiceData.razorpayOrderId}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="invoice-footer">
          <div className="footer-section">
            <h4>What's Included in Your Subscription</h4>
            <ul className="features-list">
              <li>✅ Personalized diet plan from certified dietitians</li>
              <li>✅ 3 live online fitness classes per week</li>
              <li>✅ Weekly progress tracking</li>
              <li>✅ Access to recipe database</li>
              <li>✅ Email support</li>
              <li>✅ Online coaching sessions</li>
              <li>✅ Advanced fitness assessments</li>
            </ul>
          </div>

          <div className="footer-section-in">
            <h4>Thank You!</h4>
            <p>Thank you for choosing {invoiceData.company.name} for your fitness journey.</p>
            <p>Your subscription is now active and you'll receive access credentials via email shortly.</p>
            <p>
              For questions about this invoice or your subscription, please contact us at {invoiceData.company.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invoice
