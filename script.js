const subTitle = document.getElementById('sub-title');
const mainTitle = document.getElementById('main-title');

// 1. FUNGSI DASAR (Ketik & Hapus)
async function typeEffect(element, text, speed = 80) {
    if (!element) return;
    for (let i = 0; i <= text.length; i++) {
        element.innerHTML = text.substring(0, i);
        await new Promise(res => setTimeout(res, speed));
    }
}

async function backspaceEffect(element, speed = 40) {
    if (!element) return;
    let text = element.innerHTML;
    for (let i = text.length; i >= 0; i--) {
        element.innerHTML = text.substring(0, i);
        await new Promise(res => setTimeout(res, speed));
    }
}

// 2. SEQUENCE UTAMA (Hanya Satu initSystem)
async function initSystem() {
    console.log("System Initializing...");

    // Phase 1: Subtitle sequence
    await typeEffect(subTitle, "PROJECT_U8", 100);
    await new Promise(res => setTimeout(res, 1200));
    await backspaceEffect(subTitle, 50);
    await typeEffect(subTitle, "QUEST PLANNER ECOSYSTEM", 60);

    // Phase 2: Main title sequence
    await new Promise(res => setTimeout(res, 300));
    await typeEffect(mainTitle, "THE ARCHIVE.", 100);
    await new Promise(res => setTimeout(res, 2000));
    await backspaceEffect(mainTitle, 60);
    await typeEffect(mainTitle, "WELCOME.", 150);

    // Phase 3: Trigger Animation (Sidebar & Content Shift)
    await new Promise(res => setTimeout(res, 1000)); // Jeda bentar biar user baca "Welcome"
    document.body.classList.add('system-ready');
    
    console.log("System Initialized: Sidebar & Content Synced.");
    document.body.classList.add('content-up');
}

// 3. MOBILE TRIGGER (Toggle Sidebar)
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const trigger = document.querySelector('.menu-trigger');
    if (!sidebar || !trigger) return;

    sidebar.classList.toggle('active');
    trigger.innerHTML = sidebar.classList.contains('active') ? "[ CLOSE ]" : "[ MENU ]";
}

// 4. JALANKAN SISTEM
window.addEventListener('DOMContentLoaded', initSystem);
