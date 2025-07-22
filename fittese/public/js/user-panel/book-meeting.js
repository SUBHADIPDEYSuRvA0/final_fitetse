document.addEventListener('DOMContentLoaded', function () {
  // Fetch employees
  fetch('/user/employees')
    .then(res => res.json())
    .then(data => {
      const select = document.getElementById('employee');
      if (data && data.employees) {
        data.employees.forEach(emp => {
          const opt = document.createElement('option');
          opt.value = emp._id;
          opt.textContent = emp.name;
          select.appendChild(opt);
        });
      }
    });

  // Fetch slots when employee or date changes
  function fetchSlots() {
    const empId = document.getElementById('employee').value;
    const date = document.getElementById('date').value;
    if (!empId || !date) return;
    fetch(`/user/slots?employeeId=${empId}&date=${date}`)
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById('availableSlots');
        container.innerHTML = '';
        if (data && data.slots && data.slots.length > 0) {
          data.slots.forEach(slot => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-outline-success m-1';
            btn.textContent = `${new Date(slot.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(slot.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            btn.onclick = () => {
              document.querySelectorAll('#availableSlots button').forEach(b => b.classList.remove('active'));
              btn.classList.add('active');
              btn.dataset.selected = slot._id;
              container.dataset.selectedSlot = slot._id;
            };
            container.appendChild(btn);
          });
        } else {
          container.innerHTML = '<span class="text-muted">No slots available.</span>';
        }
      });
  }
  document.getElementById('employee').addEventListener('change', fetchSlots);
  document.getElementById('date').addEventListener('change', fetchSlots);

  // Handle form submit
  document.getElementById('bookMeetingForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const empId = document.getElementById('employee').value;
    const slotId = document.getElementById('availableSlots').dataset.selectedSlot;
    const description = document.getElementById('description').value;
    if (!empId || !slotId || !description) {
      showToast('Please select employee, slot, and enter description.', 'danger');
      return;
    }
    fetch('/user/meetings/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: empId, slotId, description })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('Meeting booked successfully!', 'success');
          setTimeout(() => window.location.href = '/user/panel/meetings', 1500);
        } else {
          showToast(data.message || 'Booking failed', 'danger');
        }
      })
      .catch(() => showToast('Booking failed', 'danger'));
  });
}); 