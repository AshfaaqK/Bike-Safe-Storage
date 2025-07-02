document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('bookingModal')) {
        const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
        let currentBookingId = null;

        // Handle manage button clicks
        document.querySelectorAll('.manage-booking-btn').forEach(button => {
            button.addEventListener('click', function () {
                const bookingId = this.getAttribute('data-booking-id');
                currentBookingId = bookingId;

                // Fetch booking data
                fetch(`/api/get-booking/${bookingId}`)
                    .then(response => response.json())
                    .then(data => { 
                        if (data.success) {
                            const booking = data.booking;

                            document.getElementById('modalTitle').textContent = `#${bookingId} - Booking`;
                            document.getElementById('modalFirstName').value = booking.first_name || '';
                            document.getElementById('modalLastName').value = booking.last_name || '';
                            document.getElementById('modalPhone').value = booking.phone || '';
                            document.getElementById('modalEmail').value = booking.email || '';
                            document.getElementById('modalVehicle').value = booking.reg || '';
                            document.getElementById('modalDateTime').value = booking.date_time || '';
                            document.getElementById('modalMessage').value = booking.message || '';
                            document.getElementById('statusSelect').value = booking.status || 'New';
                            document.getElementById('adminNotes').value = booking.notes || '';
                            document.getElementById('typeSelect').value = booking.booking_type || 'Storage';

                            const statusBadge = document.getElementById('modalStatusBadge');
                            statusBadge.textContent = booking.status || 'New';
                            statusBadge.className = 'badge ' + getBookingStatusBadgeClass(booking.status || 'New');

                            bookingModal.show();
                        } else {
                            alert('Failed to load booking data!');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Failed to load booking data!');
                    });
            });
        });

        if (document.getElementById('saveBookingChangesBtn')) {
            // Save changes handler
            document.getElementById('saveBookingChangesBtn').addEventListener('click', function () {
                const status = document.getElementById('statusSelect').value;
                const notes = document.getElementById('adminNotes').value;
                const firstName = document.getElementById('modalFirstName').value;
                const lastName = document.getElementById('modalLastName').value;
                const phone = document.getElementById('modalPhone').value;
                const email = document.getElementById('modalEmail').value;
                const vehicle = document.getElementById('modalVehicle').value;
                const dateTime = document.getElementById('modalDateTime').value;
                const message = document.getElementById('modalMessage').value;
                const type = document.getElementById('typeSelect').value;

                const toast = document.getElementById('bookingLiveToast');
                const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
                const toastHeaderText = document.getElementById('bookingToastHeaderText');
                const toastBodyText = document.getElementById('bookingToastBodyText');

                // Save changes via API
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
                        toast.classList.remove('bg-success', 'bg-danger');
                        if (data.success) {
                            // Refetch updated booking data
                            fetch(`/api/get-booking/${currentBookingId}`)
                                .then(response => response.json())
                                .then(data => {
                                    if (data.success) {
                                        const booking = data.booking;

                                        const row = document.getElementById(`booking-row-${currentBookingId}`);
                                        if (row) {
                                            // Update fields in the row
                                            row.children[2].textContent = booking.first_name;
                                            row.children[3].textContent = booking.last_name;
                                            row.children[4].textContent = booking.email;
                                            row.children[5].textContent = booking.phone;
                                            row.children[6].textContent = booking.reg;
                                            row.children[7].textContent = booking.date;
                                            row.children[8].textContent = booking.time;

                                            // Message
                                            const messageTd = row.children[9];
                                            if (booking.message && booking.message.length > 25) {
                                                messageTd.innerHTML = `
                                                    <span class="message-preview">${booking.message.slice(0, 25)}<span class="dots">...</span></span>
                                                    <span class="message-full" style="display:none;">${booking.message}</span>
                                                    <button class="read-more-btn btn btn-link btn-sm">Read More</button>
                                                `;
                                            } else {
                                                messageTd.textContent = booking.message || 'No message';
                                            }

                                            // Notes
                                            const notesTd = row.children[10];
                                            if (booking.notes && booking.notes.length > 13) {
                                                notesTd.innerHTML = `
                                                    <span class="message-preview">${booking.notes.slice(0, 13)}<span class="dots">...</span></span>
                                                    <span class="message-full" style="display:none;">${booking.notes}</span>
                                                    <button class="read-more-btn btn btn-link btn-sm">Read More</button>
                                                `;
                                            } else {
                                                notesTd.textContent = booking.notes || 'No notes';
                                            }

                                            // Status badge
                                            const statusTd = row.children[13];
                                            let badgeClass = getBookingStatusBadgeClass(booking.status || 'New');
                                            statusTd.innerHTML = `<span class="badge rounded-pill ${badgeClass} text-black">${booking.status}</span>`;

                                            // Booking type badge
                                            const typeTd = row.children[1];
                                            let typeBadgeClass = getBookingTypeBadgeClass(booking.booking_type || 'Storage');
                                            typeTd.innerHTML = `<span class="badge ${typeBadgeClass} text-black">${booking.booking_type}</span>`;
                                        }

                                        bookingModal.hide();

                                        // Show success toast
                                        document.getElementById('bookingToastHeader').style.backgroundColor = '#7dbb73';
                                        document.getElementById('bookingLiveToast').classList.add('bg-success');
                                        toastHeaderText.innerHTML = `
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-database-check" viewBox="0 0 16 16">
                                                <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514"/>
                                                <path d="M12.096 6.223A5 5 0 0 0 13 5.698V7c0 .289-.213.654-.753 1.007a4.5 4.5 0 0 1 1.753.25V4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.5 4.5 0 0 1-.813-.927Q8.378 15 8 15c-1.464 0-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13h.027a4.6 4.6 0 0 1 0-1H8c-1.464 0-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10q.393 0 .774-.024a4.5 4.5 0 0 1 1.102-1.132C9.298 8.944 8.666 9 8 9c-1.464 0-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777M3 4c0-.374.356-.875 1.318-1.313C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4"/>
                                            </svg> Successful change`;
                                        toastBodyText.textContent = `Booking #${currentBookingId} has been successfully updated.`;
                                    }
                                });
                        } else {
                            // Show error toast
                            document.getElementById('bookingToastHeader').style.backgroundColor = '#944f4e';
                            document.getElementById('bookingLiveToast').classList.add('bg-danger');
                            toastHeaderText.innerHTML = `
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-database-exclamation" viewBox="0 0 16 16">
                                <path d="M12.096 6.223A5 5 0 0 0 13 5.698V7c0 .289-.213.654-.753 1.007a4.5 4.5 0 0 1 1.753.25V4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.5 4.5 0 0 1-.813-.927Q8.378 15 8 15c-1.464 0-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13h.027a4.6 4.6 0 0 1 0-1H8c-1.464 0-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10q.393 0 .774-.024a4.5 4.5 0 0 1 1.102-1.132C9.298 8.944 8.666 9 8 9c-1.464 0-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777M3 4c0-.374.356-.875 1.318-1.313C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4"/>
                                <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-3.5-2a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V11a.5.5 0 0 0-.5-.5m0 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
                            </svg> Error updating booking #${currentBookingId}`;
                            toastBodyText.textContent = `${data.error || 'Unknown error'}`;
                        }

                        toastBootstrap.show();
                    });
            });
        }

        function getBookingStatusBadgeClass(status) {
            switch (status) {
                case 'New': return 'bg-info';
                case 'Confirmed': return 'bg-success';
                case 'Completed': return 'bg-primary';
                case 'Cancelled': return 'bg-danger';
                default: return 'bg-secondary';
            }
        }

        function getBookingTypeBadgeClass(type) {
            switch (type) {
                case 'Storage': return 'text-bg-primary';
                case 'Detailing': return 'text-bg-success';
                case 'Service': return 'text-bg-warning';
                case 'Repairs': return 'text-bg-danger';
                case 'Transport': return 'text-bg-info';
                case 'Other': return 'text-bg-secondary';
                default: return 'text-bg-light';
            }
        }
    }
});