const subTitle = document.getElementById('sub-title');
const mainTitle = document.getElementById('main-title');

// Fungsi dasar mengetik
async function typeEffect(element, text, speed = 80) {
    for (let i = 0; i <= text.length; i++) {
        element.innerHTML = text.substring(0, i);
        await new Promise(res => setTimeout(res, speed));
    }
}

// Fungsi dasar menghapus
async function backspaceEffect(element, speed = 40) {
    let text = element.innerHTML;
    for (let i = text.length; i >= 0; i--) {
        element.innerHTML = text.substring(0, i);
        await new Promise(res => setTimeout(res, speed));
    }
}

// Sequence Inisialisasi Sistem
async function initSystem() {
    // Phase 1: Subtitle sequence
    await typeEffect(subTitle, "PROJECT_U8", 100);
    await new Promise(res => setTimeout(res, 1200));
    await backspaceEffect(subTitle, 50);
    await typeEffect(subTitle, "QUEST PLANNER ECOSYSTEM", 60);

    // Phase 2: Main title sequence
    await new Promise(res => setTimeout(res, 300)); // Delay dikit biar natural
    await typeEffect(mainTitle, "THE ARCHIVE.", 100);
    await new Promise(res => setTimeout(res, 2000));
    await backspaceEffect(mainTitle, 60);
    await typeEffect(mainTitle, "WELCOME.", 150);
}

// Jalankan saat semua aset sudah siap
window.addEventListener('DOMContentLoaded', initSystem);
