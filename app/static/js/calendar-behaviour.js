document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');
    const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    let currentBookingId = null;

    const calendar = new window.FullCalendar.Calendar(calendarEl, {
        initialView: window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek',

        locale: 'en-GB',

        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: window.innerWidth < 768 ? '' : 'dayGridMonth,timeGridWeek,timeGridDay'
        },

        views: {
            dayGridMonth: {
                titleFormat: { year: 'numeric', month: 'long' }
            },

            timeGridWeek: {
                titleFormat: { month: 'long', day: 'numeric' }
            },

            timeGridDay: {
                titleFormat: { day: 'numeric', month: 'long' }
            }
        },

        firstDay: 1, // Monday
        slotMinTime: "07:00:00",
        slotMaxTime: "21:00:00",
        slotDuration: '00:15:00',
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

            const fullName = info.event.extendedProps.customer || '';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            document.getElementById('modalTitle').textContent = `#${currentBookingId} - ${info.event.title}`;
            document.getElementById('modalFirstName').value = firstName;
            document.getElementById('modalLastName').value = lastName;
            document.getElementById('modalPhone').value = info.event.extendedProps.phone || '';
            document.getElementById('modalEmail').value = info.event.extendedProps.email || '';
            document.getElementById('modalVehicle').value = info.event.extendedProps.vehicle || '';

            const startDateTime = info.event.end;
            const formattedDateTime = startDateTime.toISOString().slice(0, 16);
            document.getElementById('modalDateTime').value = formattedDateTime;

            document.getElementById('modalMessage').value = info.event.extendedProps.message || '';
            document.getElementById('statusSelect').value = info.event.extendedProps.status;
            document.getElementById('typeSelect').value = info.event.extendedProps.type;
            document.getElementById('adminNotes').value = info.event.extendedProps.notes || '';

            const statusBadge = document.getElementById('modalStatusBadge');
            statusBadge.textContent = info.event.extendedProps.status;
            statusBadge.className = 'badge ' + getStatusBadgeClass(info.event.extendedProps.status);

            bookingModal.show();
        },
        eventContent: function (arg) {
            return {
                html: `
                    <div class="fc-event-content p-1">
                        <div>${arg.timeText.split(' ')[0]} - ${arg.event.title.split(' ')[0]}</div>
                        <div>${arg.event.extendedProps.customer} - ${arg.event.extendedProps.vehicle}</div>
                    </div>
                `
            };
        }
    });

    calendar.render();

    document.getElementById('saveChangesBtn').addEventListener('click', function () {
        const status = document.getElementById('statusSelect').value;
        const type = document.getElementById('typeSelect').value;
        const notes = document.getElementById('adminNotes').value;

        const firstName = document.getElementById('modalFirstName').value;
        const lastName = document.getElementById('modalLastName').value;
        const phone = document.getElementById('modalPhone').value;
        const email = document.getElementById('modalEmail').value;
        const vehicle = document.getElementById('modalVehicle').value;
        const message = document.getElementById('modalMessage').value;
        const dateTime = document.getElementById('modalDateTime').value;

        fetch(`/api/bookings/${currentBookingId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                status: status,
                type: type,
                notes: notes,
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                email: email,
                vehicle: vehicle,
                message: message,
                start: dateTime
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

    window.addEventListener('resize', function () {
        if (window.innerWidth < 768) {
            calendar.changeView('timeGridDay');
            calendar.setOption('headerToolbar', {
                left: 'prev,next today',
                center: 'title',
                right: ''
            });
        } else {
            calendar.changeView('timeGridWeek');
            calendar.setOption('headerToolbar', {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
            });
        }
    });

    function formatCurrentDateTime() {
        const now = new Date();
        const day = now.getDate();
        const month = now.toLocaleString('en-GB', { month: 'long' });
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');

        const suffix =
            (day === 1 || day === 21 || day === 31) ? 'st' :
                (day === 2 || day === 22) ? 'nd' :
                    (day === 3 || day === 23) ? 'rd' : 'th';

        return `${day}${suffix} ${month} ${year} ${hours}:${minutes}:${seconds}`;
    }

    function updateLiveClock() {
        const clockElement = document.getElementById('currentDateTime');
        if (clockElement) {
            clockElement.textContent = formatCurrentDateTime();
        }
    }

    updateLiveClock();
    setInterval(updateLiveClock, 1000);
});