document.addEventListener("DOMContentLoaded", function() {
    // Skip Images Functionality -----------------
    const skipImagesCheckbox = document.getElementById('skipImagesCheckbox');
    const firstImageContainer = document.getElementById('firstImageContainer');
    const allImagesContainer = document.getElementById('allImagesContainer');

    if (skipImagesCheckbox) {
        skipImagesCheckbox.addEventListener('change', function () {
            if (this.checked) {
                firstImageContainer.style.display = 'none';
                allImagesContainer.style.display = 'none';

            } else {
                firstImageContainer.style.display = 'block';
                allImagesContainer.style.display = 'block';
            }
        });
    }
});