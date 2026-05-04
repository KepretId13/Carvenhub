<script>
function openDetail(element) {
    document.getElementById('modalTitle').innerText = element.getAttribute('data-title');
    document.getElementById('modalImg').src = element.getAttribute('data-img');
    document.getElementById('modalDQ').innerText = element.getAttribute('data-dq');
    document.getElementById('modalVibe').innerText = element.getAttribute('data-vibe');
    document.getElementById('modalAbout').innerText = element.getAttribute('data-about');
    
    document.getElementById('detailModal').style.display = "block";
}

function closeModal() {
    document.getElementById('detailModal').style.display = "none";
}

// Tutup modal kalau klik area luar
window.onclick = function(event) {
    if (event.target == document.getElementById('detailModal')) {
        closeModal();
    }
}
</script>
