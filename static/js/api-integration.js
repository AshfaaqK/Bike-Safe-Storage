document.addEventListener('DOMContentLoaded', function () {

    document.getElementById('registrationForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const registration = document.getElementById('registrationInput').value;
        const vehicleDetails = document.getElementById('vehicleDetails');

        fetch('/api/vehicle-lookup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ registration: registration })
        })
            .then(response => response.json())
            .then(data => {
                // Display raw JSON with syntax highlighting
                vehicleDetails.innerHTML = `
                    <h3>API Response (JSON)</h3>
                    <pre><code>${JSON.stringify(data, null, 2)}</code></pre>
                `;
            })
            .catch(error => {
                vehicleDetails.innerHTML = `<div class="error">An error occurred: ${error}</div>`;
            });
    });

});