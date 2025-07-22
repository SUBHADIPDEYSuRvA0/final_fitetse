// Helper: fetch exchange rate and update price for a specific plan
async function updateDisplayedPrice(planId, baseAmountUSD) {
  const currency = document.getElementById('currency-select').value;
  let convertedAmount = baseAmountUSD;
  if (currency !== 'USD') {
    try {
      const res = await fetch(`https://api.exchangerate.host/convert?from=USD&to=${currency}`);
      const data = await res.json();
      if (data.success) {
        convertedAmount = baseAmountUSD * data.result;
      }
    } catch (e) {
      alert('Could not fetch exchange rate. Showing USD price.');
    }
  }
  document.getElementById(`displayed-price-${planId}`).textContent = `${currency} ${convertedAmount.toFixed(2)}`;
  // Store the converted amount in the smallest unit (integer)
  window[`convertedAmount_${planId}`] = Math.round(convertedAmount * 100);
}

// Supported currencies by Razorpay (update as needed)
const supportedCurrencies = [
  'INR', 'USD', 'EUR', 'GBP', 'SGD', 'AUD', 'CAD', 'AED', 'JPY'
];

function updateBuyButtons() {
  const currency = document.getElementById('currency-select').value;
  const isSupported = supportedCurrencies.includes(currency);
  document.querySelectorAll('.plan-card').forEach(card => {
    const buyBtn = card.querySelector('button');
    if (!isSupported) {
      buyBtn.disabled = true;
      buyBtn.textContent = 'Not Supported';
    } else {
      buyBtn.disabled = false;
      buyBtn.textContent = 'Buy';
    }
  });
  const msgId = 'currency-support-msg';
  let msg = document.getElementById(msgId);
  if (!isSupported) {
    if (!msg) {
      msg = document.createElement('div');
      msg.id = msgId;
      msg.className = 'alert alert-warning';
      msg.textContent = 'Selected currency is not supported for payments. Please choose another.';
      document.querySelector('.container-fluid').prepend(msg);
    }
  } else if (msg) {
    msg.remove();
  }
}

// On currency change, update all plan prices
const currencySelect = document.getElementById('currency-select');
currencySelect.addEventListener('change', function() {
  document.querySelectorAll('.plan-card').forEach(card => {
    const planId = card.getAttribute('data-plan-id');
    const baseAmountUSD = parseFloat(card.getAttribute('data-plan-usd'));
    updateDisplayedPrice(planId, baseAmountUSD);
  });
  updateBuyButtons();
});

// On page load, update all plan prices to default currency
window.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.plan-card').forEach(card => {
    const planId = card.getAttribute('data-plan-id');
    const baseAmountUSD = parseFloat(card.getAttribute('data-plan-usd'));
    updateDisplayedPrice(planId, baseAmountUSD);
  });
  updateBuyButtons();
});

// Helper to safely parse JSON or detect HTML error
function handleFetchJSON(res) {
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return res.json();
  } else {
    return res.text().then(text => {
      throw new Error("Server returned HTML instead of JSON: " + text.slice(0, 100));
    });
  }
}

function buyPlan(planId) {
  const slotType = document.getElementById('slot-type-' + planId).value;
  const currency = document.getElementById('currency-select').value || 'USD';
  const amount = window[`convertedAmount_${planId}`] || 0;

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
  console.log('Sending to backend:', { planId, slotType, currency, amount });
  if (amount > max) {
    alert(`Amount exceeds Razorpay's maximum for ${currency}. Please select a lower-priced plan or currency.`);
    return;
  }

  fetch('/user/payment/key')
    .then(handleFetchJSON)
    .then(({ key }) => {
      fetch('/user/payment/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, slotType, currency, amount }),
      })
        .then(handleFetchJSON)
        .then(data => {
          if (data.success) {
            // Set payment methods based on currency
            let paymentMethods = ["card"];
            if (currency === "INR") {
              paymentMethods = ["card", "upi", "netbanking", "wallet", "emi"];
            }
            const options = {
              key: key,
              amount: data.order.amount,
              currency: data.order.currency,
              name: data.plan.name,
              description: data.plan.description,
              order_id: data.order.id,
              handler: function (response) {
                // Send payment verification to backend
                fetch('/user/payment/verify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    orderId: data.order.id,
                    paymentId: response.razorpay_payment_id,
                    signature: response.razorpay_signature,
                    planId: planId,
                    slotType: slotType
                  })
                })
                  .then(handleFetchJSON)
                  .then(result => {
                    if (result.success) {
                      alert('Payment successful! Plan activated.');
                      window.location.reload();
                    } else {
                      alert('Payment verification failed: ' + (result.message || 'Unknown error'));
                    }
                  })
                  .catch(err => {
                    alert('Verification error: ' + err.message);
                  });
              },
              prefill: {},
              theme: { color: '#0d6efd' },
              method: paymentMethods
            };
            const rzp = new Razorpay(options);
            rzp.open();
          } else {
            alert('Error: ' + (data.message || 'Could not create order.'));
          }
        })
        .catch(err => {
          alert('Order error: ' + err.message);
        });
    })
    .catch(err => {
      alert('Key error: ' + err.message);
    });
} 