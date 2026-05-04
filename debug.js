// Navigasi Buka/Tutup
function toggleNav() {
    const sideNav = document.getElementById("sideNav");
    const overlay = document.getElementById("navOverlay");
    sideNav.classList.toggle("active");
    overlay.style.display = sideNav.classList.contains("active") ? "block" : "none";
}

// Buka Detail Modal
function openDetail(el) {
    document.getElementById('modalTitle').innerText = el.getAttribute('data-title');
    document.getElementById('modalImg').src = el.getAttribute('data-img');
    document.getElementById('modalDQ').innerText = el.getAttribute('data-dq');
    document.getElementById('modalVibe').innerText = el.getAttribute('data-vibe');
    document.getElementById('modalAbout').innerText = el.getAttribute('data-about');
    document.getElementById('detailModal').style.display = "block";
}

// Tutup Modal
function closeModal() {
    document.getElementById('detailModal').style.display = "none";
}

// Sistem Filter Search & Difficulty
function filterItems() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const diff = document.getElementById('difficultyFilter').value;
    const cards = document.getElementsByClassName('item-card');

    for (let card of cards) {
        const title = card.getAttribute('data-title').toLowerCase();
        const info = card.innerText;
        const matchSearch = title.includes(search);
        const matchDiff = diff === 'all' || info.includes(diff);
        
        card.style.display = (matchSearch && matchDiff) ? "block" : "none";
    }
}

// Event Klik Area Luar (Overlay)
window.onclick = (e) => {
    if (e.target.id === 'detailModal') closeModal();
    if (e.target.id === 'navOverlay') toggleNav();
}
