const subTitle = document.getElementById('sub-title');
const mainTitle = document.getElementById('main-title');

// ==========================================================================
// DATA REPOSITORIES (Edit isi daftar/konten lu di sini)
// ==========================================================================

// Kategori 0x01: Archive Design
const designItems = [
    { id: "01", title: "UI_LAYOUT_REVISION" },
    { id: "02", title: "CHARACTER_STUDY_01" },
    { id: "03", title: "MOUNTAIN_PREVIEW" }
];

// Kategori 0x02: Archive OST
const ostItems = [
    { id: "01", title: "THE_ARCHIVE_THEME", url: "https://youtube.com/..." },
    { id: "02", title: "BENCANA_BINTANG_OST", url: "https://youtube.com/..." },
    { id: "03", title: "SYSTEM_IDLE_AMBIENT", url: "https://youtube.com/..." }
];

// Kategori 0x03: Ecosystem Manifest (Standar Antarmuka Sederhana)
const manifestItems = [
    {
        header: "CORE_ECOSYSTEM",
        desc: "Universe8 bertindak sebagai arsitektur mandiri untuk mengelola lini kreatif, eksperimen data, serta pelacakan quest planner secara terpusat."
    },
    {
        header: "INTERFACE_STANDARD",
        desc: "Sistem antarmuka berbasis asinkronus (Level 4), dirancang minimalis menggunakan enkapsulasi capsule-grid guna memastikan efisiensi visual."
    },
    {
        header: "PLANNER_LOGIC",
        desc: "Modul manajemen tugas taktis untuk menyinkronkan seluruh proyek berjalan, lore, dan aset komersial dalam satu kendali operasional."
    }
];

// ==========================================================================
// 1. FUNGSI DASAR KETIK & HAPUS
// ==========================================================================
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

// ==========================================================================
// 2. DYNAMIC INJECTOR (Ngerakit List & Manifest ke HTML otomatis)
// ==========================================================================
function injectLobbyContent() {
    const container = document.getElementById('lobby-main');
    if (!container) return;

    container.innerHTML = `
        <div class="lobby-row">
            <div class="lobby-column">
                <span class="group-label">0x01 / ARCHIVE_DESIGN</span>
                <ul class="shape-list">
                    ${designItems.map((item, index) => `
                        <li style="transition-delay: ${index * 0.1}s">
                            <a href="#" class="item-link" onclick="openDesignMenu('${item.title}')">[${item.id}] ${item.title}</a>
                        </li>
                    `).join('')}
                </ul>
            </div>
            
            <div class="lobby-column">
                <span class="group-label">0x02 / ARCHIVE_OST</span>
                <ul class="shape-list">
                    ${ostItems.map((item, index) => `
                        <li style="transition-delay: ${(index + designItems.length) * 0.1}s">
                            <a href="${item.url}" target="_blank" class="item-link">[${item.id}] ${item.title}</a>
                        </li>
                    `).join('')}
                </ul>
            </div>
        </div>

        <div class="manifest-section" style="transition-delay: ${(designItems.length + ostItems.length) * 0.1 + 0.3}s;">
            <span class="group-label">0x03 / ECOSYSTEM_MANIFEST</span>
            <div class="manifest-container">
                ${manifestItems.map(box => `
                    <div class="manifest-box">
                        <h4>${box.header}</h4>
                        <p>${box.desc}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    console.log("Lobby & Manifest injected successfully.");
}

// ==========================================================================
// 3. SEQUENCE UTAMA SISTEM
// ==========================================================================
async function initSystem() {
    console.log("Booting Core System...");

    // Tahap 1: Typing Sequence
    await typeEffect(subTitle, "PROJECT_U8", 100);
    await new Promise(res => setTimeout(res, 1200));
    await backspaceEffect(subTitle, 50);
    await typeEffect(subTitle, "QUEST PLANNER ECOSYSTEM", 60);

    await typeEffect(mainTitle, "THE ARCHIVE.", 100);
    await new Promise(res => setTimeout(res, 2000));
    await backspaceEffect(mainTitle, 60);
    await typeEffect(mainTitle, "WELCOME.", 150);

    // Tahap 2: Sidebar Slide Masuk
    await new Promise(res => setTimeout(res, 1000));
    document.body.classList.add('system-ready');

    // Tahap 2.5: Standby 2 detik
    await new Promise(res => setTimeout(res, 2000));

    // Tahap 3: Teks Naik & Panggil Konten Manual
    document.body.classList.add('content-up');
    injectLobbyContent();
}

// ==========================================================================
// 4. INTERAKSI TOGGLE & MODAL
// ==========================================================================
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const trigger = document.querySelector('.menu-trigger');
    if (!sidebar || !trigger) return;
    sidebar.classList.toggle('active');
    trigger.innerHTML = sidebar.classList.contains('active') ? "[ CLOSE ]" : "[ MENU ]";
}

function openDesignMenu(title) {
    alert("Menu untuk: " + title + "\\n(Nanti kita ganti jadi Pop-up custom)");
    // Di sini lu bisa panggil modal Etsy/Lynk.id nanti
}

// BOOT SELESAI ELEMEN SIAP
window.addEventListener('DOMContentLoaded', initSystem);
