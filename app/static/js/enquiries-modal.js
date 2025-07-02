document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('enquiryModal')) {
        const enquiryModal = new bootstrap.Modal(document.getElementById('enquiryModal'));
        let currentEnquiryId = null;

        // Handle manage button clicks
        document.querySelectorAll('.manage-enquiry-btn').forEach(button => {
            button.addEventListener('click', function () {
                const enquiryId = this.getAttribute('data-enquiry-id');
                currentEnquiryId = enquiryId;

                // Fetch enquiry data
                fetch(`/api/get-enquiry/${enquiryId}`)
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            const enquiry = data.enquiry;

                            document.getElementById('enquiryModalTitle').textContent = `#${enquiryId} - Enquiry`;
                            document.getElementById('enquiryFirstName').value = enquiry.first_name || '';
                            document.getElementById('enquiryLastName').value = enquiry.last_name || '';
                            document.getElementById('enquiryPhone').value = enquiry.phone || '';
                            document.getElementById('enquiryEmail').value = enquiry.email || '';
                            document.getElementById('enquiryMessage').value = enquiry.message || '';
                            document.getElementById('enquiryStatusSelect').value = enquiry.status || 'Lead';
                            document.getElementById('enquiryNotes').value = enquiry.notes || '';

                            const statusBadge = document.getElementById('enquiryModalStatusBadge');
                            statusBadge.textContent = enquiry.status || 'Lead';
                            statusBadge.className = 'badge ' + getEnquiryStatusBadgeClass(enquiry.status || 'Lead');

                            enquiryModal.show();
                        } else {
                            alert('Failed to load enquiry data!');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Failed to load enquiry data!');
                    });
            });
        });

        // Save changes handler
        document.getElementById('saveEnquiryChangesBtn').addEventListener('click', function () {
            const status = document.getElementById('enquiryStatusSelect').value;
            const notes = document.getElementById('enquiryNotes').value;
            const firstName = document.getElementById('enquiryFirstName').value;
            const lastName = document.getElementById('enquiryLastName').value;
            const phone = document.getElementById('enquiryPhone').value;
            const email = document.getElementById('enquiryEmail').value;
            const message = document.getElementById('enquiryMessage').value;

            const toast = document.getElementById('enquiryLiveToast');
            const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toast);
            const toastHeaderText = document.getElementById('enquiryToastHeaderText');
            const toastBodyText = document.getElementById('enquiryToastBodyText');

            // Save changes via API
            fetch(`/api/enquiries/${currentEnquiryId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    status: status,
                    notes: notes,
                    first_name: firstName,
                    last_name: lastName,
                    phone: phone,
                    email: email,
                    message: message
                })
            })
                // Handle response
                .then(response => response.json())
                .then(data => {
                    toast.classList.remove('bg-success', 'bg-danger');
                    if (data.success) {
                        // Refetch updated enquiry data
                        fetch(`/api/get-enquiry/${currentEnquiryId}`)
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    const enquiry = data.enquiry;

                                    const row = document.getElementById(`enquiry-row-${currentEnquiryId}`);
                                    if (row) {
                                        // Update fields in the row
                                        row.children[1].textContent = enquiry.first_name;
                                        row.children[2].textContent = enquiry.last_name;
                                        row.children[3].textContent = enquiry.email;
                                        row.children[4].textContent = enquiry.phone;

                                        // Message
                                        const messageTd = row.children[5];
                                        if (enquiry.message.length > 58) {
                                            messageTd.innerHTML = `
                                                <span class="message-preview">${enquiry.message.slice(0, 58)}<span class="dots">...</span></span>
                                                <span class="message-full" style="display:none;">${enquiry.message}</span>
                                                <button class="read-more-btn btn btn-link btn-sm">Read More</button>
                                            `;

                                        } else {
                                            messageTd.textContent = enquiry.message;
                                        }

                                        // Notes
                                        const notesTd = row.children[6];
                                        if (enquiry.notes && enquiry.notes.length > 40) {
                                            notesTd.innerHTML = `
                                                <span class="message-preview">${enquiry.notes.slice(0, 40)}<span class="dots">...</span></span>
                                                <span class="message-full" style="display:none;">${enquiry.notes}</span>
                                                <button class="read-more-btn btn btn-link btn-sm">Read More</button>
                                            `;

                                        } else {
                                            notesTd.textContent = enquiry.notes || 'No notes added';
                                        }

                                        // Status badge
                                        const statusTd = row.children[8];
                                        let badgeClass = getEnquiryStatusBadgeClass(enquiry.status || 'Lead');
                                        statusTd.innerHTML = `<span class="badge rounded-pill ${badgeClass} text-black">${enquiry.status}</span>`;
                                    }

                                    enquiryModal.hide();

                                    // Show success toast
                                    document.getElementById('enquiryToastHeader').style.backgroundColor = '#7dbb73';
                                    document.getElementById('enquiryLiveToast').classList.add('bg-success');
                                    toastHeaderText.innerHTML = `
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-database-check" viewBox="0 0 16 16">
                                            <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m1.679-4.493-1.335 2.226a.75.75 0 0 1-1.174.144l-.774-.773a.5.5 0 0 1 .708-.708l.547.548 1.17-1.951a.5.5 0 1 1 .858.514"/>
                                            <path d="M12.096 6.223A5 5 0 0 0 13 5.698V7c0 .289-.213.654-.753 1.007a4.5 4.5 0 0 1 1.753.25V4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.5 4.5 0 0 1-.813-.927Q8.378 15 8 15c-1.464 0-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13h.027a4.6 4.6 0 0 1 0-1H8c-1.464 0-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10q.393 0 .774-.024a4.5 4.5 0 0 1 1.102-1.132C9.298 8.944 8.666 9 8 9c-1.464 0-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777M3 4c0-.374.356-.875 1.318-1.313C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4"/>
                                        </svg> Successful change`;
                                    toastBodyText.textContent = `Enquiry #${currentEnquiryId} has been successfully updated.`;
                                    }
                                });
                        
                            } else {
                                // Show error toast
                                document.getElementById('enquiryToastHeader').style.backgroundColor = '#944f4e';
                                document.getElementById('enquiryLiveToast').classList.add('bg-danger');
                                toastHeaderText.innerHTML = `
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-database-exclamation" viewBox="0 0 16 16">
                                    <path d="M12.096 6.223A5 5 0 0 0 13 5.698V7c0 .289-.213.654-.753 1.007a4.5 4.5 0 0 1 1.753.25V4c0-1.007-.875-1.755-1.904-2.223C11.022 1.289 9.573 1 8 1s-3.022.289-4.096.777C2.875 2.245 2 2.993 2 4v9c0 1.007.875 1.755 1.904 2.223C4.978 15.71 6.427 16 8 16c.536 0 1.058-.034 1.555-.097a4.5 4.5 0 0 1-.813-.927Q8.378 15 8 15c-1.464 0-2.766-.27-3.682-.687C3.356 13.875 3 13.373 3 13v-1.302c.271.202.58.378.904.525C4.978 12.71 6.427 13 8 13h.027a4.6 4.6 0 0 1 0-1H8c-1.464 0-2.766-.27-3.682-.687C3.356 10.875 3 10.373 3 10V8.698c.271.202.58.378.904.525C4.978 9.71 6.427 10 8 10q.393 0 .774-.024a4.5 4.5 0 0 1 1.102-1.132C9.298 8.944 8.666 9 8 9c-1.464 0-2.766-.27-3.682-.687C3.356 7.875 3 7.373 3 7V5.698c.271.202.58.378.904.525C4.978 6.711 6.427 7 8 7s3.022-.289 4.096-.777M3 4c0-.374.356-.875 1.318-1.313C5.234 2.271 6.536 2 8 2s2.766.27 3.682.687C12.644 3.125 13 3.627 13 4c0 .374-.356.875-1.318 1.313C10.766 5.729 9.464 6 8 6s-2.766-.27-3.682-.687C3.356 4.875 3 4.373 3 4"/>
                                    <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-3.5-2a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 1 0V11a.5.5 0 0 0-.5-.5m0 4a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1"/>
                                </svg> Error updating enquiry #${currentEnquiryId}`;
                                toastBodyText.textContent = `${data.error || 'Unknown error'}`;
                            }

                    toastBootstrap.show();
                });
        });

        function getEnquiryStatusBadgeClass(status) {
            switch (status) {
                case 'Lead': return 'bg-info';
                case 'Unable to Contact': return 'bg-warning';
                case 'In Progress': return 'bg-primary';
                case 'Sold': return 'bg-success';
                case 'Delivered': return 'bg-success';
                case 'Lost': return 'bg-danger';
                default: return 'bg-secondary';
            }
        }
    }
});