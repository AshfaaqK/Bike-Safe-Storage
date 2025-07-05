document.addEventListener('DOMContentLoaded', function () {
    if (document.querySelector('.filter-card')) {
        // Helper function to extract year from date string
        function extractYearFromDate(dateString) {
            if (!dateString) return 0;

            // Handle DD/MM/YYYY format
            if (dateString.includes('/')) {
                const parts = dateString.split('/');
                if (parts.length === 3 && parts[2].length === 4) {
                    return parseInt(parts[2]);
                }
            }

            // Handle YYYY-MM-DD format
            if (dateString.includes('-')) {
                const parts = dateString.split('-');
                if (parts.length === 3 && parts[0].length === 4) {
                    return parseInt(parts[0]);
                }
            }

            // Try to extract 4-digit year from any string
            const yearMatch = dateString.match(/\b\d{4}\b/);
            return yearMatch ? parseInt(yearMatch[0]) : 0;
        }

        // Get all vehicle cards and convert to array
        const vehicleCards = Array.from(document.querySelectorAll('.vehicle-card'));
        const listingsContainer = document.getElementById('vehicle-listings');
        const noResultsMessage = document.getElementById('no-results');

        // Initialize filter state
        const filters = {
            type: 'all',
            make: 'all',
            model: 'all',
            trans: 'all',
            fuel_type: 'all',
            colours: [],
            price: parseInt(document.getElementById('price-range').value),
            mileage: parseInt(document.getElementById('mileage-range').value),
            engine_size: 'all',
            year_min: 'all',
            year_max: 'all',
            sort: 'price-asc',
            category: 'all'
        };

        // Sort comparison functions
        const sortFunctions = {
            'price-asc': (a, b) => parseInt(a.dataset.price) - parseInt(b.dataset.price),
            'price-desc': (a, b) => parseInt(b.dataset.price) - parseInt(a.dataset.price),
            'mileage-asc': (a, b) => parseInt(a.dataset.mileage) - parseInt(b.dataset.mileage),
            'mileage-desc': (a, b) => parseInt(b.dataset.mileage) - parseInt(a.dataset.mileage),
            'year-asc': (a, b) => {
                const yearA = extractYearFromDate(a.dataset.first_reg);
                const yearB = extractYearFromDate(b.dataset.first_reg);
                return yearA - yearB;
            },
            'year-desc': (a, b) => {
                const yearA = extractYearFromDate(a.dataset.first_reg);
                const yearB = extractYearFromDate(b.dataset.first_reg);
                return yearB - yearA;
            }
        };

        // Color filter functionality
        function setupColorFilters() {
            function toggleColorFilter(colorButton) {
                const colorValue = colorButton.dataset.value;
                const colorFilters = document.querySelectorAll('#color-filters .color-filter');

                // Handle "All" button
                if (colorValue === 'all') {
                    colorFilters.forEach(btn => btn.classList.remove('active'));
                    colorButton.classList.add('active');
                    filters.colours = [];
                    return;
                }

                // Remove "All" active state when selecting specific colors
                document.querySelector('#color-filters [data-value="all"]').classList.remove('active');

                // Toggle the clicked color
                colorButton.classList.toggle('active');

                // Update filters.colours array
                filters.colours = Array.from(document.querySelectorAll('#color-filters .color-filter.active'))
                    .filter(btn => btn.dataset.value !== 'all')
                    .map(btn => btn.dataset.value);

                // If no colors selected, revert to "All"
                if (filters.colours.length === 0) {
                    document.querySelector('#color-filters [data-value="all"]').classList.add('active');
                }
            }

            // Set up event listeners for color buttons
            document.querySelectorAll('#color-filters .color-filter').forEach(btn => {
                btn.addEventListener('click', function () {
                    toggleColorFilter(this);
                    applyFilters();
                });
            });
        }

        // Main filter function
        function applyFilters() {
            let visibleCards = [];

            vehicleCards.forEach(card => {
                const cardData = card.dataset;
                let isVisible = true;

                // Check each filter
                if (filters.type !== 'all' && cardData.type !== filters.type) {
                    isVisible = false;
                }

                if (filters.make !== 'all' && cardData.make !== filters.make) {
                    isVisible = false;
                }

                if (filters.model !== 'all' && cardData.model !== filters.model) {
                    isVisible = false;
                }

                if (filters.trans !== 'all' && cardData.trans !== filters.trans) {
                    isVisible = false;
                }

                if (filters.fuel_type !== 'all' && cardData.fuel_type !== filters.fuel_type) {
                    isVisible = false;
                }

                if (filters.category !== 'all' && cardData.category !== filters.category) {
                    isVisible = false;
                }

                // Color filter (multiple selection)
                if (filters.colours.length > 0) {
                    const cardColor = cardData.colour;
                    if (!filters.colours.includes(cardColor)) {
                        isVisible = false;
                    }
                }

                if (parseInt(cardData.price) > filters.price) {
                    isVisible = false;
                }

                if (parseInt(cardData.mileage) > filters.mileage) {
                    isVisible = false;
                }

                // Engine size filter
                if (filters.engine_size !== 'all') {
                    const engineSize = parseInt(cardData.engine_cc);
                    const [min, max] = filters.engine_size.split('-').map(part => {
                        if (part.endsWith('+')) return parseInt(part) + 1;
                        return parseInt(part);
                    });

                    if (filters.engine_size.endsWith('+')) {
                        if (engineSize < min) isVisible = false;
                    } else {
                        if (engineSize < min || engineSize > max) isVisible = false;
                    }
                }

                // Year range filter
                const cardYear = extractYearFromDate(cardData.first_reg);
                if (filters.year_min !== 'all' && cardYear < parseInt(filters.year_min)) {
                    isVisible = false;
                }
                if (filters.year_max !== 'all' && cardYear > parseInt(filters.year_max)) {
                    isVisible = false;
                }

                // Show/hide card based on filters
                card.style.display = isVisible ? 'block' : 'none';
                if (isVisible) visibleCards.push(card);
            });

            // Sort the visible cards
            if (sortFunctions[filters.sort]) {
                visibleCards.sort(sortFunctions[filters.sort]);

                // Re-append cards in sorted order (maintains DOM order)
                visibleCards.forEach(card => {
                    listingsContainer.appendChild(card);
                });
            }

            // Update count and no results message
            document.getElementById('filtered-count').textContent = visibleCards.length;
            noResultsMessage.classList.toggle('d-none', visibleCards.length > 0);
        }

        // Setup make and model filters
        function setupMakeModelFilters() {
            const makeFilter = document.getElementById('make-filter');
            const modelFilter = document.getElementById('model-filter');

            makeFilter.addEventListener('change', function () {
                const selectedMake = this.value;
                filters.make = selectedMake;

                // Enable/disable model filter based on make selection
                if (selectedMake === 'all') {
                    modelFilter.disabled = true;
                    modelFilter.innerHTML = '<option value="all" selected>All Models</option>';
                    filters.model = 'all';
                } else {
                    modelFilter.disabled = false;

                    // Get unique models for selected make
                    const models = vehicleCards
                        .filter(card => card.dataset.make === selectedMake)
                        .map(card => card.dataset.model)
                        .filter((value, index, self) => self.indexOf(value) === index)
                        .sort();

                    // Populate model dropdown
                    modelFilter.innerHTML = '<option value="all" selected>All Models</option>';
                    models.forEach(model => {
                        modelFilter.innerHTML += `<option value="${model}">${model}</option>`;
                    });
                }

                applyFilters();
            });

            modelFilter.addEventListener('change', function () {
                filters.model = this.value;
                applyFilters();
            });
        }

        // Setup other filter controls
        function setupFilterControls() {
            // Year range filters
            document.getElementById('year-min').addEventListener('change', function () {
                filters.year_min = this.value;
                applyFilters();
            });

            document.getElementById('year-max').addEventListener('change', function () {
                filters.year_max = this.value;
                applyFilters();
            });

            // Button group filters (transmission, fuel type, type, category)
            document.querySelectorAll('.btn-group-vertical .filter-btn').forEach(btn => {
                btn.addEventListener('click', function () {
                    const filterType = this.dataset.filter;
                    const filterValue = this.dataset.value;

                    // Update active state for button group
                    this.closest('.btn-group-vertical').querySelectorAll('.filter-btn').forEach(b => {
                        b.classList.remove('active');
                    });
                    this.classList.add('active');

                    // Update filters
                    filters[filterType] = filterValue;
                    applyFilters();
                });
            });

            // Range sliders
            document.getElementById('price-range').addEventListener('input', function () {
                const value = parseInt(this.value);
                document.getElementById('price-value').textContent = value.toLocaleString();
                filters.price = value;
                applyFilters();
            });

            document.getElementById('mileage-range').addEventListener('input', function () {
                const value = parseInt(this.value);
                document.getElementById('mileage-value').textContent = value.toLocaleString();
                filters.mileage = value;
                applyFilters();
            });

            // Engine size filter
            document.getElementById('engine-size').addEventListener('change', function () {
                filters.engine_size = this.value;
                applyFilters();
            });

            // Sort options
            document.querySelectorAll('.sort-option').forEach(option => {
                option.addEventListener('click', function (e) {
                    e.preventDefault();

                    // Update active state
                    document.querySelectorAll('.sort-option').forEach(opt => {
                        opt.classList.remove('active');
                    });
                    this.classList.add('active');

                    // Update sort filter
                    filters.sort = this.dataset.sort;
                    applyFilters();
                });
            });
        }

        // Reset all filters
        function resetAllFilters() {
            // Reset filter values
            filters.type = 'all';
            filters.make = 'all';
            filters.model = 'all';
            filters.trans = 'all';
            filters.fuel_type = 'all';
            filters.colours = [];
            filters.price = parseInt(document.getElementById('price-range').max);
            filters.mileage = parseInt(document.getElementById('mileage-range').max);
            filters.engine_size = 'all';
            filters.year_min = 'all';
            filters.year_max = 'all';
            filters.sort = 'price-asc';
            filters.category = 'all';

            // Reset UI elements
            document.getElementById('make-filter').value = 'all';
            document.getElementById('model-filter').innerHTML = '<option value="all" selected>All Models</option>';
            document.getElementById('model-filter').disabled = true;

            document.getElementById('price-range').value = filters.price;
            document.getElementById('price-value').textContent = filters.price.toLocaleString();

            document.getElementById('mileage-range').value = filters.mileage;
            document.getElementById('mileage-value').textContent = filters.mileage.toLocaleString();

            document.getElementById('engine-size').value = 'all';
            document.getElementById('year-min').value = 'all';
            document.getElementById('year-max').value = 'all';

            // Reset color filters
            document.querySelectorAll('#color-filters .color-filter').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.value === 'all') {
                    btn.classList.add('active');
                }
            });

            // Reset active buttons
            document.querySelectorAll('.btn-group-vertical .filter-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.value === 'all') {
                    btn.classList.add('active');
                }
            });

            // Reset vehicle type specifically
            document.querySelectorAll('[data-filter="type"].filter-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.value === 'all') {
                    btn.classList.add('active');
                }
            });

            // Reset sort option
            document.querySelectorAll('.sort-option').forEach(opt => {
                opt.classList.remove('active');
                if (opt.dataset.sort === 'price-asc') {
                    opt.classList.add('active');
                }
            });

            applyFilters();
        }

        // Initialize everything
        setupColorFilters();
        setupMakeModelFilters();
        setupFilterControls();

        document.getElementById('reset-filters').addEventListener('click', resetAllFilters);
        document.getElementById('reset-filters-no-results').addEventListener('click', resetAllFilters);

        // Initial filter application
        applyFilters();
    }
});