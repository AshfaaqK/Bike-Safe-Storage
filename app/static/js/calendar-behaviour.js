document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    let currentBookingId = null;

    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        firstDay: 1, // Monday
        slotMinTime: "07:00:00",
        slotMaxTime: "21:00:00",
        slotDuration: '00:30:00',
        slotLabelInterval: '01:00:00',
        allDaySlot: false,
        nowIndicator: true,
        height: 'auto',
        eventTimeFormat: {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        },
        events: {
            url: '/api/bookings/calendar',
            method: 'GET',
            failure: function () {
                alert('Failed to load bookings!');
            }
        },
        eventClick: function (info) {
            currentBookingId = info.event.id;
            document.getElementById('modalTitle').textContent = info.event.title;
            document.getElementById('modalCustomer').textContent = info.event.extendedProps.customer;
            document.getElementById('modalPhone').textContent = info.event.extendedProps.phone;
            document.getElementById('modalEmail').textContent = info.event.extendedProps.email;
            document.getElementById('modalVehicle').textContent = info.event.extendedProps.vehicle;
            document.getElementById('modalTime').textContent =
                `${info.event.start.toLocaleDateString()} • ${info.event.start.toLocaleTimeString()} - ${info.event.end.toLocaleTimeString()}`;
            document.getElementById('modalMessage').textContent = info.event.extendedProps.message || 'No message';
            document.getElementById('statusSelect').value = info.event.extendedProps.status;
            document.getElementById('adminNotes').value = info.event.extendedProps.notes || '';

            // Update status badge
            const statusBadge = document.getElementById('modalStatusBadge');
            statusBadge.textContent = info.event.extendedProps.status;
            statusBadge.className = 'badge ' + getStatusBadgeClass(info.event.extendedProps.status);

            bookingModal.show();
        },
        eventContent: function (arg) {
            return {
                html: `
                    <div class="fc-event-content p-1">
                        <div class="fw-bold">${arg.timeText}</div>
                        <div>${arg.event.title}</div>
                        <small>${arg.event.extendedProps.customer.split(' ')[0]}</small>
                    </div>
                `
            };
        }
    });

    calendar.render();

    // Save changes handler
    document.getElementById('saveChangesBtn').addEventListener('click', function () {
        const status = document.getElementById('statusSelect').value;
        const notes = document.getElementById('adminNotes').value;

        fetch(`/api/bookings/${currentBookingId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status,
                notes: notes
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    calendar.refetchEvents();
                    bookingModal.hide();
                } else {
                    alert('Failed to update booking');
                }
            });
    });

    function getStatusBadgeClass(status) {
        switch (status) {
            case 'New': return 'bg-info';
            case 'Confirmed': return 'bg-success';
            case 'Completed': return 'bg-primary';
            case 'Cancelled': return 'bg-danger';
            default: return 'bg-secondary';
        }
    }
});