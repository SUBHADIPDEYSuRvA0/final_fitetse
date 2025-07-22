document.addEventListener('DOMContentLoaded', function () {
  fetch('/user/payments')
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('paymentsTableBody');
      tbody.innerHTML = '';
      if (data && data.payments && data.payments.length > 0) {
        data.payments.forEach(payment => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>₹${payment.amount}</td>
            <td>${payment.status}</td>
            <td>${new Date(payment.createdAt).toLocaleDateString()}</td>
            <td>${payment.plan && payment.plan.name ? payment.plan.name : ''}</td>
          `;
          tbody.appendChild(tr);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">No payments found.</td></tr>';
      }
    });
}); 