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

    const rowsPerPage = 10; // Number of rows to show per page
    const allRows = document.querySelectorAll('.enquiry-row');
    let visibleRows = Array.from(allRows); // Tracks currently visible rows
    let pageCount = Math.ceil(visibleRows.length / rowsPerPage);
    let currentPage = 1;

    // Pagination controls
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');

    // Search input
    const searchInput = document.getElementById('searchInput');

    // Function to show rows for the current page
    function showPage(page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        // First hide all rows
        allRows.forEach(row => row.style.display = 'none');

        // Then show only the visible rows for current page
        visibleRows.slice(start, end).forEach(row => {
            row.style.display = '';
        });

        // Update pagination controls
        updatePaginationControls(page);
    }

    // Function to update pagination controls
    function updatePaginationControls(page) {

        // Recalculate page count based on visible rows
        pageCount = Math.ceil(visibleRows.length / rowsPerPage);
        currentPage = Math.min(page, pageCount) || 1;

        // Clear existing page numbers (except prev/next)
        const pageItems = document.querySelectorAll('.pagination .page-item:not(#prevPage):not(#nextPage)');
        pageItems.forEach(item => item.remove());

        // Add new page numbers
        for (let i = 1; i <= pageCount; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = 'page-item ' + (i === currentPage ? 'active' : '');

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
            nextPageBtn.parentNode.insertBefore(pageItem, nextPageBtn);
        }

        // Update prev/next button states
        prevPageBtn.className = currentPage === 1 ? 'page-item disabled' : 'page-item';
        nextPageBtn.className = currentPage >= pageCount ? 'page-item disabled' : 'page-item';
    }

    // Search functionality
    searchInput.addEventListener('input', function () {
        const searchTerm = this.value.toLowerCase();

        if (searchTerm === '') {
            // If search is empty, show all rows
            visibleRows = Array.from(allRows);
        } else {
            // Filter rows based on search term
            visibleRows = Array.from(allRows).filter(row => {
                return row.textContent.toLowerCase().includes(searchTerm);
            });
        }

        // Reset to first page and update display
        currentPage = 1;
        updatePaginationControls(currentPage);
        showPage(currentPage);
    });

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

    // Initialize the page
    showPage(currentPage);
});
