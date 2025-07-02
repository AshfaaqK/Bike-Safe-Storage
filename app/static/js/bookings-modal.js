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
                                            <i class="bi bi-database-check"></i> Successful change`;
                                        toastBodyText.textContent = `Booking #${currentBookingId} has been successfully updated.`;
                                    } else {
                                        // Show error toast for displaying updated booking
                                        document.getElementById('bookingToastHeader').style.backgroundColor = '#944f4e';
                                        document.getElementById('bookingLiveToast').classList.add('bg-danger');
                                        toastHeaderText.innerHTML = `
                                        <i class="bi bi-cloud-arrow-down"></i> Error displaying updates for #${currentBookingId}`;
                                        toastBodyText.textContent = `${data.error || 'Error fetching updated data. Refresh the page.'}`;
                                    }
                                });
                        } else {
                            // Show error toast
                            document.getElementById('bookingToastHeader').style.backgroundColor = '#944f4e';
                            document.getElementById('bookingLiveToast').classList.add('bg-danger');
                            toastHeaderText.innerHTML = `
                            <i class="bi bi-database-exclamation"></i> Error updating booking #${currentBookingId}`;
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