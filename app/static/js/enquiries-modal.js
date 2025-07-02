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
                                        <i class="bi bi-database-check"></i> Successful change`;
                                    toastBodyText.textContent = `Enquiry #${currentEnquiryId} has been successfully updated.`;
                                } else {
                                    // Show error toast for displaying updated enquiry
                                    document.getElementById('enquiryToastHeader').style.backgroundColor = '#944f4e';
                                    document.getElementById('enquiryLiveToast').classList.add('bg-danger');
                                    toastHeaderText.innerHTML = `
                                    <i class="bi bi-cloud-arrow-down"></i> Error displaying updates #${currentEnquiryId}`;
                                    toastBodyText.textContent = `${data.error || 'Error fetching updated data. Refresh the page.'}`;
                                }
                            });
                        
                    } else {
                        // Show error toast
                        document.getElementById('enquiryToastHeader').style.backgroundColor = '#944f4e';
                        document.getElementById('enquiryLiveToast').classList.add('bg-danger');
                        toastHeaderText.innerHTML = `
                        <i class="bi bi-database-exclamation"></i> Error updating enquiry #${currentEnquiryId}`;
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