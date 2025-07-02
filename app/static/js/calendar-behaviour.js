document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('bookingModal')) {
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

            const toast = document.getElementById('liveToast');
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast)
            const toastHeaderText = document.getElementById('toastHeaderText');
            const toastBodyText = document.getElementById('toastBodyText');

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
                    liveToast.classList.remove('bg-success', 'bg-danger');
                    if (data.success) {
                        calendar.refetchEvents();
                        bookingModal.hide();

                        toastHeader.style.backgroundColor = '#7dbb73';
                        liveToast.classList.add('bg-success');
                        toastHeaderText.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-database-check" viewBox="0 0 16 16">
                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514"/>
                            <path d="M12.096 6.223A5 5 0 0 0 13 5.698V7c0 .289-.213.654-.753 1.007a4.5 4.5 0 0 1 1.753.25V4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.5 4.5 0 0 1-.813-.927Q8.378 15 8 15c-1.464 0-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13h.027a4.6 4.6 0 0 1 0-1H8c-1.464 0-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10q.393 0 .774-.024a4.5 4.5 0 0 1 1.102-1.132C9.298 8.944 8.666 9 8 9c-1.464 0-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777M3 4c0-.374.356-.875 1.318-1.313C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4"/>
                        </svg> Successful change`;
                        toastBodyText.textContent = `Booking #${currentBookingId} has been successfully updated.`;

                    } else {
                        toastHeader.style.backgroundColor = '#944f4e';
                        liveToast.classList.add('bg-danger');
                        toastHeaderText.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-database-exclamation" viewBox="0 0 16 16">
                            <path d="M12.096 6.223A5 5 0 0 0 13 5.698V7c0 .289-.213.654-.753 1.007a4.5 4.5 0 0 1 1.753.25V4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.5 4.5 0 0 1-.813-.927Q8.378 15 8 15c-1.464 0-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13h.027a4.6 4.6 0 0 1 0-1H8c-1.464 0-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10q.393 0 .774-.024a4.5 4.5 0 0 1 1.102-1.132C9.298 8.944 8.666 9 8 9c-1.464 0-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777M3 4c0-.374.356-.875 1.318-1.313C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4"/>
                            <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-3.5-2a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V11a.5.5 0 0 0-.5-.5m0 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
                        </svg> Error updating booking #${currentBookingId}`;
                        toastBodyText.textContent = `${data.error || 'Unknown error'}`;
                    }

                    toastBootstrap.show()
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

            return `${ day }${ suffix } ${ month } ${ year } ${ hours }:${ minutes }:${ seconds } `;
        }

        function updateLiveClock() {
            const clockElement = document.getElementById('currentDateTime');
            if (clockElement) {
                clockElement.textContent = formatCurrentDateTime();
            }
        }

        updateLiveClock();
        setInterval(updateLiveClock, 1000);
    }
});