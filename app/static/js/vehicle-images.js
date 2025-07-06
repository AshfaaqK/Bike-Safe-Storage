document.addEventListener('DOMContentLoaded', function() {
    // Handle delete button clicks
    document.querySelectorAll('.delete-image-vehicle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const imageId = this.closest('[data-image-id]').getAttribute('data-image-id');
            if (confirm('Are you sure you want to delete this image?')) {
                fetch(`/api/delete_image/${imageId}`, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': '{{ form.csrf_token._value() }}'
                    }
                }).then(response => {
                    if (response.ok) {
                        location.reload();
                    } else {
                        alert('Error deleting image');
                    }
                });
            }
        });
    });

    // Handle set as primary button clicks
    document.querySelectorAll('.set-primary-image-vehicle-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const imageId = this.closest('[data-image-id]').getAttribute('data-image-id');
            fetch(`/api/set_primary_image/${imageId}`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': '{{ form.csrf_token._value() }}',
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok) {
                    location.reload();
                } else {
                    alert('Error setting image as primary');
                }
            });
        });
    });
});