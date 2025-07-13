document.addEventListener('DOMContentLoaded', function () {
    const usedListingsBtn = document.getElementById('usedVehicleListingsBtn');
    const soldListingsBtn = document.getElementById('soldVehicleListingsBtn');
    const sortListingsBtn = document.getElementById('sortVehicleListingsBtn');
    const usedListings = document.getElementById('usedVehicleListings');
    const soldListings = document.getElementById('soldVehicleListings');
    const numberOfVehicles = document.getElementById('numberOfVehicles');
    const numberOfSoldVehicles = document.getElementById('numberOfSoldVehicles');

    if (soldListings) {
        // Initialize button states
        usedListingsBtn.classList.add('active');
        soldListingsBtn.classList.remove('active');

        usedListingsBtn.addEventListener('click', function () {
            // Toggle button active states
            usedListingsBtn.classList.add('active');
            soldListingsBtn.classList.remove('active');
            
            // Show used listings and sort controls
            usedListings.style.display = 'flex';
            sortListingsBtn.style.display = 'flex';
            numberOfVehicles.style.display = 'block';
            soldListings.style.display = 'none';
            numberOfSoldVehicles.style.display = 'none';
        });

        soldListingsBtn.addEventListener('click', function () {
            // Toggle button active states
            soldListingsBtn.classList.add('active');
            usedListingsBtn.classList.remove('active');
            
            // Show sold listings and hide sort controls
            usedListings.style.display = 'none';
            sortListingsBtn.style.display = 'none';
            numberOfVehicles.style.display = 'none';
            soldListings.style.display = 'flex';
            numberOfSoldVehicles.style.display = 'block';
        });
    }
});