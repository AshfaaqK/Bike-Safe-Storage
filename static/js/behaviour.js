document.addEventListener('DOMContentLoaded', function () {
    // Message Expand/Collapse -----------------

    // Select all elements with the class 'read-more-btn' on the page
    document.querySelectorAll('.read-more-btn').forEach(button => {
        
        // Add a click event listener to each button
        button.addEventListener('click', function () {
            
            // Find the closest parent <td> element to the clicked button
            // This ensures we only affect the message in the current row
            const row = this.closest('td');

            // Find the preview text element within this row
            const preview = row.querySelector('.message-preview');

            // Find the full text element within this row
            const full = row.querySelector('.message-full');

            // Check if the full text is currently hidden
            if (full.style.display === 'none') {
                // If hidden, show the full text and hide the preview
                preview.style.display = 'none';
                full.style.display = 'inline';

                // Change the button text to "Read Less"
                this.textContent = 'Read Less';
            } else {
                // If showing full text, switch back to showing preview
                preview.style.display = 'inline';
                full.style.display = 'none';

                // Change the button text back to "Read More"
                this.textContent = 'Read More';
            }
        });
    });

    // Pagination -----------------

    // Pagination variables
    const rowsPerPage = 10; // Number of rows to show per page
    const tableBody = document.getElementById('enquiriesTableBody');
    const rows = document.querySelectorAll('.enquiry-row');
    const pageCount = Math.ceil(rows.length / rowsPerPage);
    let currentPage = 1;

    // Pagination controls
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const paginationList = document.querySelector('.pagination');

    // Search input
    const searchInput = document.getElementById('searchInput');

    // Function to show rows for the current page
    function showPage(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        rows.forEach((row, index) => {
            if (index >= start && index < end) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });

        // Update pagination controls
        updatePaginationControls(page);
    }

    // Function to update pagination controls
    function updatePaginationControls(page) {
        // Clear existing page numbers (except prev/next)
        const pageItems = document.querySelectorAll('.pagination .page-item:not(#prevPage):not(#nextPage)');
        pageItems.forEach(item => item.remove());

        // Add new page numbers
        for (let i = 1; i <= pageCount; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = 'page-item ' + (i === page ? 'active' : '');

            const pageLink = document.createElement('a');
            pageLink.className = 'page-link';
            pageLink.href = '#';
            pageLink.textContent = i;

            pageLink.addEventListener('click', function (e) {
                e.preventDefault();
                currentPage = i;
                showPage(currentPage);
            });

            pageItem.appendChild(pageLink);

            // Insert before the next button
            nextPageBtn.parentNode.insertBefore(pageItem, nextPageBtn);
        }

        // Update prev/next button states
        prevPageBtn.className = page === 1 ? 'page-item disabled' : 'page-item';
        nextPageBtn.className = page === pageCount ? 'page-item disabled' : 'page-item';
    }

    // Event listeners for prev/next buttons
    prevPageBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            showPage(currentPage);
        }
    });

    nextPageBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (currentPage < pageCount) {
            currentPage++;
            showPage(currentPage);
        }
    });

    // Search functionality
    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();

        rows.forEach(row => {
            const rowText = row.textContent.toLowerCase();
            if (rowText.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });

        // Reset pagination when searching
        currentPage = 1;
        updatePaginationControls(currentPage);
    });

    // Initialize the page
    showPage(currentPage);
});
