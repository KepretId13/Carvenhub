const subTitle = document.getElementById('sub-title');
const mainTitle = document.getElementById('main-title');

// FUNGSI KETIK (Wajib Async)
async function typeEffect(element, text, speed = 80) {
    if (!element) return;
    for (let i = 0; i <= text.length; i++) {
        element.innerHTML = text.substring(0, i);
        await new Promise(res => setTimeout(res, speed));
    }
}

// FUNGSI HAPUS (Wajib Async)
async function backspaceEffect(element, speed = 40) {
    if (!element) return;
    let text = element.innerHTML;
    for (let i = text.length; i >= 0; i--) {
        element.innerHTML = text.substring(0, i);
        await new Promise(res => setTimeout(res, speed));
    }
}

// MESIN UTAMA (Wajib Async)
async function initSystem() {
    // TAHAP 1: Typing
    await typeEffect(subTitle, "PROJECT_U8", 100);
    await new Promise(res => setTimeout(res, 1000));
    await backspaceEffect(subTitle, 50);
    await typeEffect(subTitle, "QUEST PLANNER ECOSYSTEM", 60);

    await typeEffect(mainTitle, "THE ARCHIVE.", 100);
    await new Promise(res => setTimeout(res, 2000));
    await backspaceEffect(mainTitle, 60);
    await typeEffect(mainTitle, "WELCOME.", 150);

    // TAHAP 2: Geser Sidebar
    await new Promise(res => setTimeout(res, 1000));
    document.body.classList.add('system-ready');

    // TAHAP 3: Welcome Naik & Lobby Muncul
    await new Promise(res => setTimeout(res, 2000));
    document.body.classList.add('content-up');
}

// JALANKAN (Tanpa Await di sini)
window.addEventListener('DOMContentLoaded', initSystem);
