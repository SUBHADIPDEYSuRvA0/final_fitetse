// Show toast message
function showToast(message, type = 'primary') {
  const toastEl = document.getElementById('userPanelToast');
  const toastMsg = document.getElementById('toastMessage');
  if (toastEl && toastMsg) {
    toastMsg.textContent = message;
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    const toast = new bootstrap.Toast(toastEl);
    toast.show();
  }
}

// Example usage: showToast('Welcome to the user panel!'); 