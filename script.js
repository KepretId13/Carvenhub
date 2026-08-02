// DOM Elements
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const main = document.getElementById('main');
const overlay = document.getElementById('overlay');

// Toggle Sidebar
menuToggle.addEventListener('click', () => {
    sidebar.classList.toggle('hidden');
    main.classList.toggle('expanded');
});

// Close sidebar when clicking on main content (mobile)
main.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
        sidebar.classList.add('hidden');
        main.classList.remove('expanded');
    }
});

// Modal Functions
function openModal(type) {
    const modalId = type === 'designs' ? 'designsModal' : 'ostModal';
    document.getElementById(modalId).classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(type) {
    const modalId = type === 'designs' ? 'designsModal' : 'ostModal';
    document.getElementById(modalId).classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function closeAllModals() {
    document.getElementById('designsModal').classList.remove('active');
    document.getElementById('ostModal').classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close modal on overlay click
overlay.addEventListener('click', closeAllModals);

// Close modal on ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeAllModals();
    }
});

// Close modal on outside click
document.addEventListener('click', (e) => {
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach(modal => {
        if (!modal.contains(e.target) && !overlay.contains(e.target) && !e.target.closest('.card-button')) {
            closeAllModals();
        }
    });
});

// Responsive behavior
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('hidden');
        main.classList.remove('expanded');
    }
});

// Prevent sidebar from closing on navigation item click
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
    });
});
