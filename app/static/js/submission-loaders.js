document.addEventListener('DOMContentLoaded', function () {
    const makeBookingForm = document.getElementById('serviceBookingForm');
    const makeEnquiryForm = document.getElementById('enquiryForm');
    const submitBookingBtn = document.getElementById('submitBooking');
    const submitEnquiryBtn = document.getElementById('submitEnquiry');
    const spinner = document.getElementById('loadingSpinner');

    if (makeBookingForm) {
        makeBookingForm.addEventListener('submit', function (e) {
            submitBookingBtn.style.display = 'none';
            spinner.style.display = 'block';
        });
    }

    if (makeEnquiryForm) {
        makeEnquiryForm.addEventListener('submit', function (e) {
            submitEnquiryBtn.style.display = 'none';
            spinner.style.display = 'block';
        });
    }
});