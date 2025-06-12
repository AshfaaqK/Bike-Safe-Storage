document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.read-more-btn').forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('td');
            const preview = row.querySelector('.message-preview');
            const full = row.querySelector('.message-full');
            
            if (full.style.display === 'none') {
                preview.style.display = 'none';
                full.style.display = 'inline';
                this.textContent = 'Read Less';
            } else {
                preview.style.display = 'inline';
                full.style.display = 'none';
                this.textContent = 'Read More';
            }
        });
    });
});