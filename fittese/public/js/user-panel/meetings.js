document.addEventListener('DOMContentLoaded', function () {
  function loadMeetings() {
    fetch('/user/meetings')
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById('meetingsTableBody');
        tbody.innerHTML = '';
        if (data && data.meetings && data.meetings.length > 0) {
          data.meetings.forEach(meeting => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
              <td>${meeting.title}</td>
              <td>${meeting.employee && meeting.employee.name ? meeting.employee.name : ''}</td>
              <td>${new Date(meeting.startTime).toLocaleString()}</td>
              <td>${meeting.status}</td>
              <td>
                ${meeting.status === 'scheduled' ? `<a href="${meeting.videoLink}" class="btn btn-sm btn-success" target="_blank">Join</a>` : ''}
                ${meeting.status === 'scheduled' ? `<button class="btn btn-sm btn-danger ms-1" onclick="cancelMeeting('${meeting._id}')">Cancel</button>` : ''}
              </td>
            `;
            tbody.appendChild(tr);
          });
        } else {
          tbody.innerHTML = '<tr><td colspan="5" class="text-center">No meetings found.</td></tr>';
        }
      });
  }
  window.cancelMeeting = function (meetingId) {
    if (!confirm('Cancel this meeting?')) return;
    fetch(`/user/meetings/${meetingId}/cancel`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('Meeting cancelled.', 'success');
          loadMeetings();
        } else {
          showToast(data.message || 'Cancel failed', 'danger');
        }
      });
  };
  loadMeetings();
}); 