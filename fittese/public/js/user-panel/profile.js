document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('profileForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    fetch('/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('Profile updated!', 'success');
        } else {
          showToast(data.message || 'Update failed', 'danger');
        }
      })
      .catch(() => showToast('Update failed', 'danger'));
  });
}); 