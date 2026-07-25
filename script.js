/* ==========================================================================
   DASHBOARD PUSAT SUMBER SEKOLAH — SCRIPT
   Vanilla JS. Handles navigation, Admin Mode inline editing, and all
   fetch()/POST calls to a Google Apps Script backend (Google Sheets).
   ========================================================================== */

// --------------------------------------------------------------------------
// CONFIG — replace with your deployed Apps Script Web App URL.
// e.g. "https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxxxxxxx/exec"
// --------------------------------------------------------------------------
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbws411a_yRLfbVpQIXpXxJQNOUcH6v74_q7qYkQCSQ1NBgHdqWr1BlDHv8JTzdUUy4Y/exec",
  ADMIN_PIN: "1234", // change this before deploying to production
};

const USING_LIVE_BACKEND = () =>
  CONFIG.APPS_SCRIPT_URL && CONFIG.APPS_SCRIPT_URL.startsWith("http");

// ==========================================================================
// SVG ICON SYSTEM — replaces all emoji with crisp, theme-consistent line
// icons (stroke = currentColor, so they inherit color from surrounding CSS).
// ==========================================================================

const ICONS = {
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H18a1 1 0 0 1 1 1v15.5a1 1 0 0 1-1 1H6.5A1.5 1.5 0 0 0 5 22Z"/><path d="M5 4.5v16"/></svg>`,
  bookOpen: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5.5c2-1 5-1 7 .5v13c-2-1.5-5-1.5-7-.5z"/><path d="M21 5.5c-2-1-5-1-7 .5v13c2-1.5 5-1.5 7-.5z"/></svg>`,
  spinner: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" class="icon-spin"><path d="M12 3a9 9 0 1 0 9 9"/></svg>`,
  checkCircle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.5 2.5L16 9.5"/></svg>`,
  alertTriangle: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 2.5 20h19z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r=".8" fill="currentColor" stroke="none"/></svg>`,
  fileText: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M15 3v4h4"/><path d="M8 13h8M8 17h8M8 9h3"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"/><path d="M15 3v4h4"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 14.5 14.5 9.5"/><path d="M11 6.5 12.4 5a3.5 3.5 0 1 1 5 5L16 11.4"/><path d="M13 17.5 11.6 19a3.5 3.5 0 1 1-5-5L8 12.6"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m7 10.5 5 5 5-5"/><path d="M5 19.5h14"/></svg>`,
  clipboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4.5" width="12" height="17" rx="1.5"/><path d="M9 4.5V3.5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1"/><path d="M9 11h6M9 15h6"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19.5 8.5a2 2 0 0 0-4-4L4 16Z"/><path d="M13.5 6.5 17.5 10.5"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m5 5 14 14M19 5 5 19"/></svg>`,
  crown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8 4 3 5-6 5 6 4-3-1.5 10h-15Z"/><path d="M5 21h14"/></svg>`,
  gift: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="9" width="17" height="4" rx="1"/><rect x="5" y="13" width="14" height="8" rx="1"/><path d="M12 9v12"/><path d="M12 9C9 9 8 7.3 8 6a2 2 0 0 1 4 0 2 2 0 0 1 4 0c0 1.3-1 3-4 3Z"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7"/><path d="M6 7l1 13.5A1.5 1.5 0 0 0 8.5 22h7a1.5 1.5 0 0 0 1.5-1.5L18 7"/><path d="M10 11v6M14 11v6"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v10a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5Z"/><circle cx="12" cy="13" r="3.5"/></svg>`,
};

/** Returns an icon's raw SVG markup with a shared "icon" class applied. */
function icon(name, extraClass = "") {
  const svg = ICONS[name];
  if (!svg) return "";
  // Some icons (e.g. "spinner") already carry their own class="..." (like
  // icon-spin for the rotation animation) — merge into ONE class attribute
  // instead of naively injecting a second, which HTML parsing would silently
  // drop, quietly breaking things like the spin animation.
  const existingClassMatch = svg.match(/class="([^"]*)"/);
  const mergedClass = ["icon", existingClassMatch ? existingClassMatch[1] : "", extraClass].filter(Boolean).join(" ");
  if (existingClassMatch) {
    return svg.replace(/class="[^"]*"/, `class="${mergedClass}"`);
  }
  return svg.replace("<svg ", `<svg class="${mergedClass}" `);
}

// ==========================================================================
// MOCK DATA — used automatically when no Apps Script URL is configured yet,
// so the UI can be tested locally before the Google Sheet is connected.
// ==========================================================================

const MOCK = {
  announcements: [
    {
      id: 1,
      title: "Minggu Membaca 2026 Bermula 4 Ogos!",
      description:
        "Sertai program bacaan sekolah tahun ini dengan pelbagai hadiah menarik. Semua pelajar digalakkan menyertai aktiviti membaca sepanjang minggu tersebut di Pusat Sumber Sekolah.",
      image: "https://picsum.photos/seed/psshero/1600/700",
      date: "2026-08-04",
    },
    {
      id: 2,
      title: "Pameran Buku Baharu",
      description: "Lebih 200 naskhah buku baharu kini tersedia di rak fiksyen dan sains popular.",
      date: "2026-07-20",
    },
    {
      id: 3,
      title: "Bengkel Kemahiran Rujukan",
      description: "Bengkel untuk Tingkatan 1 mengenai cara menggunakan katalog digital PSS.",
      date: "2026-08-12",
    },
    {
      id: 4,
      title: "Cuti Pertengahan Penggal",
      description: "PSS akan ditutup sepanjang cuti pertengahan penggal. Buku boleh dipulangkan selepas cuti tamat.",
      date: "2026-09-01",
    },
  ],
  marquee: [
    { id: "act1", img: "https://picsum.photos/seed/act1/400/300", caption: "Bengkel Origami PSS" },
    { id: "act2", img: "https://picsum.photos/seed/act2/400/300", caption: "Pertandingan Poster Membaca" },
    { id: "act3", img: "https://picsum.photos/seed/act3/400/300", caption: "Sudut Bacaan Baharu" },
    { id: "act4", img: "https://picsum.photos/seed/act4/400/300", caption: "Lawatan Perpustakaan Negeri" },
    { id: "act5", img: "https://picsum.photos/seed/act5/400/300", caption: "Klinik Rujukan Ilmiah" },
    { id: "act6", img: "https://picsum.photos/seed/act6/400/300", caption: "Hari Buku Sedunia" },
  ],
  books: [
    {
      category: "Popular Minggu Ini",
      items: [
        { id: "b1", title: "Misteri Rumah Tua", synopsis: "Sebuah kisah misteri yang membawa pembaca meneroka rahsia sebuah rumah lama di pinggir bandar.", cover: "https://picsum.photos/seed/book1/300/450" },
        { id: "b2", title: "Lautan Bintang", synopsis: "Petualangan angkasa lepas seorang kanak-kanak yang bermimpi menjadi angkasawan pertama negara.", cover: "https://picsum.photos/seed/book2/300/450" },
        { id: "b3", title: "Warisan Nusantara", synopsis: "Koleksi cerita rakyat dan legenda dari seluruh Nusantara yang sarat dengan nilai murni.", cover: "https://picsum.photos/seed/book3/300/450" },
        { id: "b4", title: "Kod Rahsia", synopsis: "Novel thriller remaja tentang sekumpulan pelajar yang memecahkan kod rahsia sekolah.", cover: "https://picsum.photos/seed/book4/300/450" },
        { id: "b5", title: "Hutan Simpanan", synopsis: "Kisah pengembaraan alam semula jadi yang mengajar tentang pemuliharaan hutan tropika.", cover: "https://picsum.photos/seed/book5/300/450" },
        { id: "b6", title: "Impian Juara", synopsis: "Kisah inspirasi seorang atlet muda yang berjuang mencapai impian menjadi juara kebangsaan.", cover: "https://picsum.photos/seed/book6/300/450" },
      ],
    },
    {
      category: "Sains & Teknologi",
      items: [
        { id: "b7", title: "Dunia Robotik", synopsis: "Pengenalan mudah kepada dunia robotik dan kecerdasan buatan untuk pelajar sekolah menengah.", cover: "https://picsum.photos/seed/book7/300/450" },
        { id: "b8", title: "Angkasa & Kita", synopsis: "Penjelajahan sistem suria dan fenomena angkasa lepas yang menakjubkan.", cover: "https://picsum.photos/seed/book8/300/450" },
        { id: "b9", title: "Kimia Harian", synopsis: "Bagaimana kimia berperanan dalam kehidupan seharian kita, dari dapur hingga makmal.", cover: "https://picsum.photos/seed/book9/300/450" },
        { id: "b10", title: "Kod & Kreativiti", synopsis: "Panduan asas pengaturcaraan untuk pelajar yang berminat dalam bidang teknologi.", cover: "https://picsum.photos/seed/book10/300/450" },
        { id: "b11", title: "Tenaga Masa Depan", synopsis: "Penerokaan sumber tenaga boleh diperbaharui dan kepentingannya untuk generasi akan datang.", cover: "https://picsum.photos/seed/book11/300/450" },
      ],
    },
    {
      category: "Sastera Klasik",
      items: [
        { id: "b12", title: "Hikayat Melayu", synopsis: "Antologi hikayat klasik Melayu yang menjadi warisan sastera negara.", cover: "https://picsum.photos/seed/book12/300/450" },
        { id: "b13", title: "Puisi Tanah Air", synopsis: "Kumpulan puisi patriotik yang membangkitkan semangat cinta akan tanah air.", cover: "https://picsum.photos/seed/book13/300/450" },
        { id: "b14", title: "Bayang Kampung", synopsis: "Novel klasik tentang kehidupan kampung dan nilai kekeluargaan yang erat.", cover: "https://picsum.photos/seed/book14/300/450" },
        { id: "b15", title: "Suara Rimba", synopsis: "Kisah rakyat yang membawa pembaca menyelami kearifan tempatan dan alam semula jadi.", cover: "https://picsum.photos/seed/book15/300/450" },
      ],
    },
  ],
  elibrary: [
    { id: "e1", title: "Kertas Percubaan SPM Matematik 2025", type: "Kertas Peperiksaan", meta: "PDF · 2.4 MB", link: "#" },
    { id: "e2", title: "Nota Ringkas Sejarah Tingkatan 5", type: "Nota", meta: "PDF · 1.1 MB", link: "#" },
    { id: "e3", title: "Kertas Percubaan PT3 Sains", type: "Kertas Peperiksaan", meta: "PDF · 1.8 MB", link: "#" },
    { id: "e4", title: "Portal e-Buku Teks KPM", type: "Pautan", meta: "Pautan Luar", link: "#" },
    { id: "e5", title: "Nota Bahasa Melayu — Komsas", type: "Nota", meta: "PDF · 900 KB", link: "#" },
    { id: "e6", title: "Kertas Percubaan Bahasa Inggeris", type: "Kertas Peperiksaan", meta: "PDF · 2.0 MB", link: "#" },
    { id: "e7", title: "Perpustakaan Digital Negara", type: "Pautan", meta: "Pautan Luar", link: "#" },
    { id: "e8", title: "Nota Fizik — Elektrik & Magnet", type: "Nota", meta: "PDF · 1.4 MB", link: "#" },
  ],
  leaderboard: [
    { id: "lb1", name: "Ahmad Danial", kelas: "5 Cemerlang", score: 128 },
    { id: "lb2", name: "Nur Aisyah", kelas: "4 Bestari", score: 121 },
    { id: "lb3", name: "Muhammad Haziq", kelas: "5 Amanah", score: 115 },
    { id: "lb4", name: "Siti Sarah", kelas: "3 Gemilang", score: 98 },
    { id: "lb5", name: "Lim Wei Jian", kelas: "4 Cemerlang", score: 92 },
    { id: "lb6", name: "Nurul Iman", kelas: "5 Bestari", score: 87 },
    { id: "lb7", name: "Kavitha Raj", kelas: "3 Amanah", score: 81 },
    { id: "lb8", name: "Farid Iskandar", kelas: "2 Gemilang", score: 76 },
    { id: "lb9", name: "Chong Mei Ling", kelas: "4 Amanah", score: 70 },
    { id: "lb10", name: "Zulaikha Batrisyia", kelas: "1 Bestari", score: 64 },
  ],
  committee: [
    { tier: 1, name: "Pn. Rohana Ahmad", role: "Guru Penasihat PSS", avatar: "https://i.pravatar.cc/150?img=45", editKey: "committee-1" },
    { tier: 2, name: "En. Kamarul Zaman", role: "Naib Penasihat", avatar: "https://i.pravatar.cc/150?img=12", editKey: "committee-2" },
    { tier: 2, name: "Pn. Siti Fatimah", role: "Setiausaha", avatar: "https://i.pravatar.cc/150?img=32", editKey: "committee-3" },
    { tier: 3, name: "Amirul Hakim", role: "Ketua Pengawas PSS", avatar: "https://i.pravatar.cc/150?img=51", editKey: "committee-4" },
    { tier: 3, name: "Nur Balqis", role: "Penolong Ketua", avatar: "https://i.pravatar.cc/150?img=47", editKey: "committee-5" },
    { tier: 3, name: "Danish Iman", role: "Bendahari Pengawas", avatar: "https://i.pravatar.cc/150?img=33", editKey: "committee-6" },
    { tier: 4, name: "10 Ahli Pengawas PSS", role: "Ahli Jawatankuasa", avatar: "https://i.pravatar.cc/150?img=5", editKey: "committee-7" },
  ],
  events: [
    { id: "ev1", day: "04", month: "OGO", title: "Minggu Membaca 2026", desc: "Aktiviti membaca sepanjang minggu dengan cabaran dan hadiah harian.", image: "https://picsum.photos/seed/event1/500/300", rulesLink: "", registerLink: "" },
    { id: "ev2", day: "12", month: "OGO", title: "Bengkel Kemahiran Rujukan", desc: "Wajib untuk Tingkatan 1. Sila daftar melalui borang di bawah.", image: "https://picsum.photos/seed/event2/500/300", rulesLink: "", registerLink: "" },
    { id: "ev3", day: "20", month: "OGO", title: "Hari Sukan Membaca", desc: "Aktiviti luar bilik darjah menggabungkan sukan dan cabaran bacaan.", image: "https://picsum.photos/seed/event3/500/300", rulesLink: "", registerLink: "" },
    { id: "ev4", day: "02", month: "SEP", title: "Mesyuarat Agung PSS", desc: "Mesyuarat tahunan jawatankuasa dan pelantikan pengawas baharu.", image: "https://picsum.photos/seed/event4/500/300", rulesLink: "", registerLink: "" },
  ],
  wishlist: [
    { id: "w1", name: "Bean Bag Sudut Bacaan", qty: "3 / 10 disumbang", progress: 30, image: "https://picsum.photos/seed/wish1/400/300", donated: false },
    { id: "w2", name: "Buku Ensiklopedia Sains", qty: "5 / 20 disumbang", progress: 25, image: "https://picsum.photos/seed/wish2/400/300", donated: false },
    { id: "w3", name: "Rak Buku Mudah Alih", qty: "1 / 4 disumbang", progress: 25, image: "https://picsum.photos/seed/wish3/400/300", donated: false },
    { id: "w4", name: "Set Novel Remaja Popular", qty: "8 / 15 disumbang", progress: 53, image: "https://picsum.photos/seed/wish4/400/300", donated: false },
    { id: "w5", name: "Skrin Projektor PSS", qty: "0 / 1 disumbang", progress: 0, image: "https://picsum.photos/seed/wish5/400/300", donated: false },
    { id: "w6", name: "Headphone Pembelajaran", qty: "2 / 10 disumbang", progress: 20, image: "https://picsum.photos/seed/wish6/400/300", donated: false },
  ],
  heroSlides: [
    { id: "hero1", image: "https://picsum.photos/seed/psshero/1600/700" },
    { id: "hero2", image: "https://picsum.photos/seed/psshero2/1600/700" },
    { id: "hero3", image: "https://picsum.photos/seed/psshero3/1600/700" },
  ],
  settings: {
    brand_line1: "Pusat Sumber Ibnu Sina",
    brand_line2: "SK Tangkungon Telupid",
    brand_line3: "XBA 2139",
    nav_home_label: "Utama / Buletin",
    nav_home_icon: "",
    nav_pustaka_label: "Pustaka Interaktif",
    nav_pustaka_icon: "",
    nav_elibrary_label: "E-Library",
    nav_elibrary_icon: "",
    nav_leaderboard_label: "Papan Pendahulu",
    nav_leaderboard_icon: "",
    nav_carta_label: "Carta Organisasi",
    nav_carta_icon: "",
    nav_kalendar_label: "Kalendar Acara",
    nav_kalendar_icon: "",
    nav_wakaf_label: "Wakaf & Sumbangan",
    nav_wakaf_icon: "",
    page_pustaka_desc: "Terokai koleksi buku popular pilihan Pusat Sumber Sekolah",
    page_elibrary_desc: "Muat turun kertas peperiksaan lepas, nota digital dan pautan pembelajaran",
    page_leaderboard_desc: "Top 10 Pembaca Teraktif Pusat Sumber Sekolah",
    page_carta_desc: "Jawatankuasa Pusat Sumber Sekolah",
    page_kalendar_desc: "Aktiviti akan datang, borang pendaftaran & peraturan",
    page_wakaf_desc: "Wishlist PSS — bantu kami lengkapkan keperluan pusat sumber",
    custom_css: "",
  },
};

// ==========================================================================
// BACKEND ACCESS LAYER (Google Apps Script)
// ==========================================================================

/**
 * Fetch a "sheet" (dataset) from Apps Script, or fall back to mock data
 * when no backend URL has been configured (useful for local UI testing).
 */
async function fetchSheet(sheetName, fallbackData) {
  if (!USING_LIVE_BACKEND()) return fallbackData;
  try {
    const res = await fetch(`${CONFIG.APPS_SCRIPT_URL}?sheet=${encodeURIComponent(sheetName)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Gagal memuatkan sheet "${sheetName}", guna data sandaran.`, err);
    return fallbackData;
  }
}

/**
 * Send a POST update to Apps Script. Body is sent as text/plain to avoid
 * CORS preflight (Apps Script Web Apps do not support OPTIONS requests).
 */
async function postToSheet(payload) {
  if (!USING_LIVE_BACKEND()) {
    console.info("[Demo mode] POST simulasi:", payload);
    return { status: "ok", demo: true };
  }
  try {
    const res = await fetch(CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error("Gagal menghantar kemas kini ke Google Sheet.", err);
    return { status: "error", error: String(err) };
  }
}

// ==========================================================================
// ADMIN CRUD ENGINE — powers "Tambah" (add), "Padam" (delete) and image
// upload for every section. In demo mode (no backend configured) these
// mutate the in-memory MOCK data directly so the full flow is testable
// offline; with a live backend they call Apps Script's addRow / deleteRow /
// uploadImage actions and re-render from the freshly-fetched sheet data.
// ==========================================================================

const isDemo = () => !USING_LIVE_BACKEND();

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses/resizes an image file entirely client-side (via <canvas>)
 * before it's ever uploaded — this shrinks both the upload payload and the
 * final file stored in Drive far more than anything the backend could do,
 * since Apps Script has no image-processing library of its own. Downscales
 * to at most maxDimension on the longest side and re-encodes as JPEG at
 * the given quality (0–1). Falls back to the original file if the browser
 * can't decode it as an image for any reason (exotic format, corrupt file).
 */
function compressImageFile(file, { maxDimension = 1600, quality = 0.72 } = {}) {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        const scale = maxDimension / Math.max(width, height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/jpeg", quality));
    };

    img.onerror = async () => {
      URL.revokeObjectURL(objectUrl);
      resolve(await fileToDataUrl(file)); // fallback: upload the original, uncompressed
    };

    img.src = objectUrl;
  });
}

const CRUD = {
  Announcements: {
    render: () => renderHome(),
    title: "Tambah Pengumuman",
    fields: () => [
      { key: "title", label: "Tajuk", type: "text", required: true },
      { key: "description", label: "Penerangan", type: "textarea" },
      { key: "date", label: "Tarikh", type: "date" },
    ],
    buildRow: (v) => ({
      id: Date.now(),
      title: v.title,
      description: v.description,
      date: v.date,
      image: `https://picsum.photos/seed/ann${Date.now()}/1600/700`,
    }),
    demoAdd: (row) => MOCK.announcements.push(row),
    demoDelete: (id) => { MOCK.announcements = MOCK.announcements.filter((a) => String(a.id) !== String(id)); },
    demoUploadImage: (id, url) => {
      const a = MOCK.announcements.find((x) => String(x.id) === String(id));
      if (a) a.image = url;
    },
  },
  HeroSlides: {
    render: () => renderHeroSlides(),
    title: "Tambah Gambar Hero",
    fields: () => [],
    buildRow: () => ({
      id: "hero_" + Date.now(),
      image: `https://picsum.photos/seed/hero${Date.now()}/1600/700`,
    }),
    demoAdd: (row) => MOCK.heroSlides.push(row),
    demoDelete: (id) => { MOCK.heroSlides = MOCK.heroSlides.filter((s) => String(s.id) !== String(id)); },
    demoUploadImage: (id, url) => {
      const s = MOCK.heroSlides.find((x) => String(x.id) === String(id));
      if (s) s.image = url;
    },
  },
  Activities: {
    render: () => renderHome(),
    title: "Tambah Aktiviti",
    fields: () => [{ key: "caption", label: "Keterangan Aktiviti", type: "text", required: true }],
    buildRow: (v) => ({
      id: "act_" + Date.now(),
      img: `https://picsum.photos/seed/act${Date.now()}/400/300`,
      caption: v.caption,
    }),
    demoAdd: (row) => MOCK.marquee.push(row),
    demoDelete: (id) => { MOCK.marquee = MOCK.marquee.filter((a) => String(a.id) !== String(id)); },
    demoUploadImage: (id, url) => {
      const a = MOCK.marquee.find((x) => String(x.id) === String(id));
      if (a) a.img = url;
    },
  },
  Books: {
    render: () => renderPustaka(),
    title: "Tambah Buku",
    fields: (ctx) => [
      { key: "category", label: "Kategori", type: "text", required: true, value: (ctx && ctx.category) || "" },
      { key: "title", label: "Tajuk Buku", type: "text", required: true },
      { key: "synopsis", label: "Sinopsis", type: "textarea" },
    ],
    buildRow: (v) => ({
      id: "book_" + Date.now(),
      category: v.category,
      title: v.title,
      synopsis: v.synopsis,
      cover: `https://picsum.photos/seed/book${Date.now()}/300/450`,
      reserved: 0,
    }),
    demoAdd: (row) => {
      const group = MOCK.books.find((g) => g.category === row.category);
      const item = { id: row.id, title: row.title, synopsis: row.synopsis, cover: row.cover };
      if (group) group.items.push(item);
      else MOCK.books.push({ category: row.category, items: [item] });
    },
    demoDelete: (id) => {
      MOCK.books.forEach((g) => { g.items = g.items.filter((b) => String(b.id) !== String(id)); });
      MOCK.books = MOCK.books.filter((g) => g.items.length > 0);
    },
    demoUploadImage: (id, url) => {
      for (const g of MOCK.books) {
        const b = g.items.find((x) => String(x.id) === String(id));
        if (b) { b.cover = url; return; }
      }
    },
  },
  ELibrary: {
    render: () => renderElibrary(),
    title: "Tambah Bahan E-Library",
    fields: () => [
      { key: "title", label: "Tajuk", type: "text", required: true },
      { key: "type", label: "Jenis", type: "select", options: ["Kertas Peperiksaan", "Nota", "Pautan"] },
      { key: "meta", label: "Maklumat (cth: PDF · 2 MB)", type: "text" },
      { key: "link", label: "Pautan Muat Turun", type: "text", placeholder: "https://..." },
    ],
    buildRow: (v) => ({ id: "elib_" + Date.now(), title: v.title, type: v.type, meta: v.meta, link: v.link || "#" }),
    demoAdd: (row) => MOCK.elibrary.push(row),
    demoDelete: (id) => { MOCK.elibrary = MOCK.elibrary.filter((x) => String(x.id) !== String(id)); },
  },
  Leaderboard: {
    render: () => renderLeaderboard(),
    title: "Tambah Pelajar",
    fields: () => [
      { key: "name", label: "Nama Pelajar", type: "text", required: true },
      { key: "kelas", label: "Kelas", type: "text" },
      { key: "score", label: "Skor", type: "number" },
    ],
    buildRow: (v) => ({ id: "lb_" + Date.now(), name: v.name, kelas: v.kelas, score: Number(v.score) || 0 }),
    demoAdd: (row) => MOCK.leaderboard.push(row),
    demoDelete: (id) => { MOCK.leaderboard = MOCK.leaderboard.filter((x) => String(x.id) !== String(id)); },
    demoUploadImage: (id, url) => {
      const m = MOCK.leaderboard.find((x) => String(x.id) === String(id));
      if (m) m.photo = url;
    },
  },
  Committee: {
    render: () => renderCarta(),
    title: "Tambah Ahli Jawatankuasa",
    fields: () => [
      { key: "tier", label: "Tingkat (1 = paling atas)", type: "number", value: 4 },
      { key: "name", label: "Nama", type: "text", required: true },
      { key: "role", label: "Jawatan", type: "text" },
    ],
    buildRow: (v) => ({
      editKey: "committee_" + Date.now(),
      tier: Number(v.tier) || 4,
      name: v.name,
      role: v.role,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`,
    }),
    demoAdd: (row) => MOCK.committee.push(row),
    demoDelete: (editKey) => { MOCK.committee = MOCK.committee.filter((x) => String(x.editKey) !== String(editKey)); },
    demoUploadImage: (editKey, url) => {
      const m = MOCK.committee.find((x) => String(x.editKey) === String(editKey));
      if (m) m.avatar = url;
    },
  },
  Events: {
    render: () => renderKalendar(),
    title: "Tambah Acara",
    fields: () => [
      { key: "day", label: "Hari (cth: 15)", type: "text", required: true },
      { key: "month", label: "Bulan (cth: OGO)", type: "text", required: true },
      { key: "title", label: "Tajuk Acara", type: "text", required: true },
      { key: "desc", label: "Penerangan", type: "textarea" },
    ],
    buildRow: (v) => ({
      id: "ev_" + Date.now(),
      day: v.day,
      month: v.month,
      title: v.title,
      desc: v.desc,
      image: `https://picsum.photos/seed/event${Date.now()}/500/300`,
      rulesLink: "",
      registerLink: "",
    }),
    demoAdd: (row) => MOCK.events.push(row),
    demoDelete: (id) => { MOCK.events = MOCK.events.filter((x) => String(x.id) !== String(id)); },
    demoUploadImage: (id, url) => {
      const e = MOCK.events.find((x) => String(x.id) === String(id));
      if (e) e.image = url;
    },
  },
  Wishlist: {
    render: () => renderWakaf(),
    title: "Tambah Item Wishlist",
    fields: () => [
      { key: "name", label: "Nama Item", type: "text", required: true },
      { key: "qty", label: "Status (cth: 0 / 5 disumbang)", type: "text" },
      { key: "progress", label: "Peratus Kemajuan (0-100)", type: "number" },
    ],
    buildRow: (v) => ({
      id: "w_" + Date.now(),
      name: v.name,
      qty: v.qty,
      progress: Number(v.progress) || 0,
      image: `https://picsum.photos/seed/wish${Date.now()}/400/300`,
      donated: false,
    }),
    demoAdd: (row) => MOCK.wishlist.push(row),
    demoDelete: (id) => { MOCK.wishlist = MOCK.wishlist.filter((x) => String(x.id) !== String(id)); },
    demoUploadImage: (id, url) => {
      const w = MOCK.wishlist.find((x) => String(x.id) === String(id));
      if (w) w.image = url;
    },
  },
};

async function handleAddSubmit(sheet, values) {
  const cfg = CRUD[sheet];
  const row = cfg.buildRow(values);

  if (isDemo()) {
    cfg.demoAdd(row);
    showToast("Item ditambah (mod demo — sambungkan Google Sheet untuk simpan kekal).");
    cfg.render();
    return;
  }

  const result = await postToSheet({ action: "addRow", sheet, row });
  if (result.status === "ok") {
    showToast("Item berjaya ditambah.");
    cfg.render();
  } else {
    showToast("Gagal menambah item.", "error");
  }
}

async function handleDeleteClick(sheet, id) {
  if (!window.confirm("Padam item ini? Tindakan ini tidak boleh diundur.")) return;
  const cfg = CRUD[sheet];

  if (isDemo()) {
    cfg.demoDelete(id);
    showToast("Item dipadam (mod demo).");
    cfg.render();
    return;
  }

  const result = await postToSheet({ action: "deleteRow", sheet, id });
  if (result.status === "ok") {
    showToast("Item berjaya dipadam.");
    cfg.render();
  } else {
    showToast("Gagal memadam item.", "error");
  }
}

async function handleImageFileChosen(file, sheet, row, column) {
  showToast("Sedang memampatkan gambar...");
  const dataUrl = await compressImageFile(file);
  const compressedFilename = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  const cfg = CRUD[sheet];

  if (isDemo()) {
    cfg.demoUploadImage(row, dataUrl);
    showToast("Gambar dikemas kini (mod demo).");
    cfg.render();
    return;
  }

  showToast("Sedang memuat naik gambar...");
  const result = await postToSheet({ action: "uploadImage", dataUrl, filename: compressedFilename, sheet, row, column });
  if (result.status === "ok") {
    showToast("Gambar berjaya dimuat naik.");
    cfg.render();
  } else {
    showToast("Gagal memuat naik gambar.", "error");
  }
}

async function handleLinkEditClick(btn) {
  const sheet = btn.dataset.sheet;
  const row = btn.dataset.row;
  const column = btn.dataset.col;
  const current = btn.dataset.current || "";
  const url = window.prompt("Masukkan URL pautan (kosongkan untuk buang):", current);
  if (url === null) return;

  if (isDemo()) {
    const ev = MOCK.events.find((x) => String(x.id) === String(row));
    if (ev) ev[column] = url;
    showToast("Pautan dikemas kini (mod demo).");
    renderKalendar();
    return;
  }

  const result = await postToSheet({ action: "update", sheet, row, column, value: url });
  if (result.status === "ok") {
    showToast("Pautan berjaya dikemas kini.");
    renderKalendar();
  } else {
    showToast("Gagal mengemas kini pautan.", "error");
  }
}

/** Small HTML builders reused by every render*() function below. */
function deleteBtnHTML(sheet, id) {
  return `<button type="button" class="item-delete-btn" data-sheet="${sheet}" data-id="${id}" title="Padam item">${icon("trash")}</button>`;
}
function imgEditBtnHTML(sheet, row, column, title = "Tukar gambar") {
  return `<button type="button" class="img-edit-trigger" data-sheet="${sheet}" data-row="${row}" data-col="${column}" title="${title}">${icon("camera")}</button>`;
}
function addTileHTML(sheet, label, { category, inline } = {}) {
  const cls = inline ? "add-tile add-tile--inline" : "add-tile";
  const catAttr = category ? `data-category="${category}"` : "";
  return `<button type="button" class="${cls}" data-sheet="${sheet}" ${catAttr}>${icon("plus")}<span>${label}</span></button>`;
}

let pendingImageTarget = null;
function triggerImageUpload(sheet, row, column) {
  pendingImageTarget = { sheet, row, column };
  document.getElementById("globalImageInput").click();
}

function handleAddTileClick(el) {
  const sheet = el.dataset.sheet;
  const category = el.dataset.category;
  const cfg = CRUD[sheet];
  if (!cfg) return;

  const fields = cfg.fields({ category });
  // Nothing to fill in (e.g. a hero slide is just a placeholder image the
  // admin uploads a real photo over afterward) — skip the empty modal.
  if (fields.length === 0) {
    handleAddSubmit(sheet, {});
    return;
  }

  openFormModal({
    title: cfg.title,
    fields,
    onSubmit: (values) => handleAddSubmit(sheet, values),
  });
}

// ==========================================================================
// PREMIUM MICRO-INTERACTIONS — 3D cursor-tilt on cards and a cursor-following
// spotlight on the hero banner. Both are delegated on document so they keep
// working after any re-render (grids get replaced via innerHTML constantly).
// ==========================================================================

/**
 * Lets admins drag the Home page's whole top-level sections (Hero, Hero
 * Slides manager, Marquee, Pengumuman Lain) into a new order — the same
 * "snap" reordering as the card grids, just applied to entire sections.
 * Unlike the grids (rebuilt from fetched data every render), these are
 * static DOM nodes, so the saved order is applied by physically moving
 * them once here, rather than by re-sorting an array before rendering.
 */
function initHomeSectionSorting() {
  const container = document.getElementById("page-home");
  const orderStr = SETTINGS && SETTINGS.order_home_sections;

  if (orderStr) {
    orderStr.split(",").filter(Boolean).forEach((id) => {
      const el = container.querySelector(`.home-section[data-home-section-id="${id}"]`);
      if (el) container.appendChild(el);
    });
  }

  makeSortable(container, "home_sections", ".home-section", "homeSectionId", "vertical");
}

function initTiltEffect() {
  const TILT_SELECTOR = ".book-card, .glass-card";
  const MAX_DEG = 7;
  let activeCard = null;

  const resetCard = (card) => {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  };

  document.addEventListener("mousemove", (e) => {
    const card = e.target.closest(TILT_SELECTOR);

    if (card !== activeCard) {
      if (activeCard) resetCard(activeCard);
      activeCard = card;
    }
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--tilt-x", (px * MAX_DEG * 2).toFixed(2) + "deg");
    card.style.setProperty("--tilt-y", (-py * MAX_DEG * 2).toFixed(2) + "deg");
  });
}

function initHeroSpotlight() {
  const hero = document.getElementById("heroBanner");
  if (!hero) return;

  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    hero.style.setProperty("--spot-x", x + "%");
    hero.style.setProperty("--spot-y", y + "%");
  });
}

/** Wires the single reusable file input + one delegated click listener that
 *  powers every add / delete / image-upload / link-edit control on the page,
 *  regardless of when their markup was rendered (re-render-proof). */
function initAdminCRUD() {
  document.getElementById("globalImageInput").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file || !pendingImageTarget) return;
    const { sheet, row, column } = pendingImageTarget;
    await handleImageFileChosen(file, sheet, row, column);
  });

  document.addEventListener("click", (e) => {
    const uploadTrigger = e.target.closest(".img-edit-trigger");
    if (uploadTrigger) {
      e.preventDefault();
      e.stopPropagation();
      triggerImageUpload(uploadTrigger.dataset.sheet, uploadTrigger.dataset.row, uploadTrigger.dataset.col);
      return;
    }

    const delBtn = e.target.closest(".item-delete-btn");
    if (delBtn) {
      e.preventDefault();
      e.stopPropagation();
      handleDeleteClick(delBtn.dataset.sheet, delBtn.dataset.id);
      return;
    }

    const addTile = e.target.closest(".add-tile");
    if (addTile) {
      e.preventDefault();
      e.stopPropagation();
      handleAddTileClick(addTile);
      return;
    }

    const linkEditBtn = e.target.closest(".link-edit-btn");
    if (linkEditBtn) {
      e.preventDefault();
      e.stopPropagation();
      handleLinkEditClick(linkEditBtn);
      return;
    }

    const navIconEditBtn = e.target.closest(".nav-icon-edit-btn");
    if (navIconEditBtn) {
      e.preventDefault();
      e.stopPropagation();
      handleNavIconEditClick(navIconEditBtn);
      return;
    }
  });
}

/** Generic modal: builds inputs from a `fields` array and calls
 *  onSubmit(values) with { fieldKey: value } when "Simpan" is clicked. */
function openFormModal({ title, fields, onSubmit }) {
  const modal = document.getElementById("formModal");
  document.getElementById("formModalTitle").textContent = title;

  const fieldsEl = document.getElementById("formModalFields");
  fieldsEl.innerHTML = fields
    .map((f, i) => {
      const id = `formField_${i}`;
      let inputHTML;
      if (f.type === "textarea") {
        inputHTML = `<textarea id="${id}" rows="3" placeholder="${f.placeholder || ""}">${f.value || ""}</textarea>`;
      } else if (f.type === "select") {
        inputHTML = `<select id="${id}">${f.options.map((o) => `<option value="${o}">${o}</option>`).join("")}</select>`;
      } else {
        inputHTML = `<input id="${id}" type="${f.type || "text"}" placeholder="${f.placeholder || ""}" value="${f.value || ""}">`;
      }
      return `<label class="form-field"><span>${f.label}${f.required ? " *" : ""}</span>${inputHTML}</label>`;
    })
    .join("");

  resetDialogPosition(document.getElementById("formModalBox"));
  modal.classList.add("show");

  const oldSubmitBtn = document.getElementById("formModalSubmit");
  const submitBtn = oldSubmitBtn.cloneNode(true); // strips old listeners from previous opens
  oldSubmitBtn.replaceWith(submitBtn);

  submitBtn.addEventListener("click", async () => {
    const values = {};
    fields.forEach((f, i) => { values[f.key] = document.getElementById(`formField_${i}`).value; });

    const missing = fields.find((f) => f.required && !values[f.key]);
    if (missing) {
      showToast(`Sila isi "${missing.label}".`, "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon("spinner")} Menyimpan...`;
    await onSubmit(values);
    submitBtn.disabled = false;
    submitBtn.textContent = "Simpan";
    modal.classList.remove("show");
  });

  document.getElementById("formModalCancel").onclick = () => modal.classList.remove("show");
}

// ==========================================================================
// TOAST
// ==========================================================================

let toastTimer = null;
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.innerHTML = `${icon(type === "success" ? "checkCircle" : "alertTriangle")}<span>${message}</span>`;
  toast.className = `toast show ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3200);
}

// ==========================================================================
// SIDEBAR NAVIGATION
// ==========================================================================

function initNavigation() {
  const navItems = document.querySelectorAll(".nav-item");
  const pages = document.querySelectorAll(".page");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      if (e.target.closest(".nav-icon-edit-btn")) return;
      const editableTarget = e.target.closest("[data-editable]");
      if (editableTarget && editableTarget.getAttribute("contenteditable") === "true") return;
      e.preventDefault();
      const target = item.dataset.section;

      navItems.forEach((n) => n.classList.remove("active"));
      item.classList.add("active");

      pages.forEach((p) => p.classList.remove("active"));
      document.getElementById(`page-${target}`).classList.add("active");

      closeMobileSidebar();
      document.getElementById("mainContent").scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function initMobileSidebar() {
  const hamburger = document.getElementById("hamburgerBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  hamburger.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");
    hamburger.classList.toggle("open", isOpen);
    overlay.classList.toggle("show", isOpen);
  });

  overlay.addEventListener("click", closeMobileSidebar);
}

function closeMobileSidebar() {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("hamburgerBtn").classList.remove("open");
  document.getElementById("sidebarOverlay").classList.remove("show");
}

// ==========================================================================
// ADMIN MODE
// ==========================================================================

let adminMode = false;

function initAdminMode() {
  const toggleBtn = document.getElementById("adminToggleBtn");
  const modal = document.getElementById("adminModal");
  const pinInput = document.getElementById("adminPinInput");
  const confirmBtn = document.getElementById("adminModalConfirm");
  const cancelBtn = document.getElementById("adminModalCancel");

  toggleBtn.addEventListener("click", () => {
    if (adminMode) {
      setAdminMode(false);
      return;
    }
    resetDialogPosition(document.getElementById("adminModalBox"));
    modal.classList.add("show");
    pinInput.value = "";
    pinInput.focus();
  });

  const attemptLogin = () => {
    if (pinInput.value === CONFIG.ADMIN_PIN) {
      setAdminMode(true);
      modal.classList.remove("show");
      showToast("Mod Admin diaktifkan. Anda kini boleh menyunting kandungan.");
    } else {
      showToast("PIN tidak sah.", "error");
    }
  };

  confirmBtn.addEventListener("click", attemptLogin);
  pinInput.addEventListener("keydown", (e) => { if (e.key === "Enter") attemptLogin(); });
  cancelBtn.addEventListener("click", () => modal.classList.remove("show"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("show"); });
}

function setAdminMode(on) {
  adminMode = on;
  document.body.classList.toggle("admin-mode", on);
  document.getElementById("adminToggleBtn").classList.toggle("on", on);

  // Flip every sortable card's native draggable attribute in lockstep with
  // admin mode, so regular visitors never have draggable="true" images
  // fighting the carousel's auto-scroll (see makeSortable).
  document.querySelectorAll(".js-sortable-card").forEach((card) => {
    card.setAttribute("draggable", on ? "true" : "false");
  });

  document.querySelectorAll("[data-editable]").forEach((el) => {
    el.setAttribute("contenteditable", on ? "true" : "false");
  });

  // The Home marquee and Pustaka carousels both render a single (editable)
  // copy of each item in admin mode but a duplicated, animated copy for
  // visitors (see renderHome / renderPustaka) — re-render both now so
  // flipping admin mode mid-session switches immediately instead of only
  // taking effect on the next full page load.
  if (document.getElementById("marqueeTrack")) renderHome();
  if (document.getElementById("carouselRows")) renderPustaka();

  if (!on) showToast("Mod Admin dimatikan.", "success");
}

// ==========================================================================
// THEME CUSTOMIZER — lets Admin Mode change the dashboard's accent colour
// live (updates CSS variables), persisted per-browser via localStorage.
// ==========================================================================

// ==========================================================================
// LIGHT / DARK MODE TOGGLE — persisted per-browser via localStorage; the
// choice is also applied by an inline <script> in <head> before first paint
// so a saved "light" preference never flashes dark-then-light on load.
// ==========================================================================

const THEME_MODE_KEY = "pss-theme-mode";

function initThemeModeToggle() {
  const applyThemeMode = (mode) => {
    if (mode === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
    localStorage.setItem(THEME_MODE_KEY, mode);
  };

  const toggleThemeMode = () => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    applyThemeMode(isLight ? "dark" : "light");
  };

  document.getElementById("themeModeToggle").addEventListener("click", toggleThemeMode);
  document.getElementById("themeModeToggleMobile").addEventListener("click", toggleThemeMode);
}

const DEFAULT_ACCENT = "#e50914";
const ACCENT_STORAGE_KEY = "pss-accent-color";

function initThemeCustomizer() {
  const input = document.getElementById("accentColorInput");
  const resetBtn = document.getElementById("accentColorReset");

  const saved = localStorage.getItem(ACCENT_STORAGE_KEY);
  if (saved) applyAccentColor(saved);

  input.addEventListener("input", (e) => applyAccentColor(e.target.value));
  resetBtn.addEventListener("click", () => {
    applyAccentColor(DEFAULT_ACCENT);
    localStorage.removeItem(ACCENT_STORAGE_KEY);
    showToast("Warna tema disetkan semula.");
  });
}

function applyAccentColor(hex) {
  const root = document.documentElement.style;
  const num = parseInt(hex.replace("#", ""), 16);
  const r = num >> 16, g = (num >> 8) & 0x00ff, b = num & 0x0000ff;

  root.setProperty("--red", hex);
  root.setProperty("--red-dark", shadeColor(hex, -25));
  root.setProperty("--red-light", shadeColor(hex, 20));
  root.setProperty("--red-rgb", `${r}, ${g}, ${b}`);
  root.setProperty("--red-glow", hexToRgba(hex, 0.45));
  document.getElementById("accentColorInput").value = hex;
  localStorage.setItem(ACCENT_STORAGE_KEY, hex);
}

/** Darkens (negative percent) or lightens (positive) a hex colour. */
function shadeColor(hex, percent) {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.max(0, Math.min(255, (num >> 16) + amt));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + r * 0x10000 + g * 0x100 + b).toString(16).slice(1)}`;
}

function hexToRgba(hex, alpha) {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = num >> 16;
  const g = (num >> 8) & 0x00ff;
  const b = num & 0x0000ff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ==========================================================================
// DRAG-TO-REORDER ("snap" reordering) — lets Admin Mode drag any card into
// a new position within its grid/row/list; the new order is persisted via
// the Settings sheet (key "order_<orderKey>") so it survives reloads for
// every visitor. Built on native HTML5 drag-and-drop, no external library.
// ==========================================================================

/**
 * Sorts `items` (each with an id field) according to a previously-saved
 * order, if one exists. Items not present in the saved order (e.g. newly
 * added since the order was last saved) are appended at the end, in their
 * original order — so nothing ever silently disappears.
 */
function applySavedOrder(items, orderKey, idKey = "id") {
  const orderStr = SETTINGS && SETTINGS[`order_${orderKey}`];
  if (!orderStr && orderStr !== 0) return items;

  // Google Sheets returns a cell as a JS number (not a string) whenever its
  // content is purely numeric — which happens whenever a saved order has
  // exactly one item and that item's id looks like a number (e.g. an
  // announcement id generated from Date.now()). String(...) first so
  // .split() never throws in that case.
  const orderedIds = String(orderStr).split(",").filter(Boolean);
  const remaining = new Map(items.map((it) => [String(it[idKey]), it]));
  const result = [];

  orderedIds.forEach((id) => {
    if (remaining.has(id)) {
      result.push(remaining.get(id));
      remaining.delete(id);
    }
  });
  remaining.forEach((it) => result.push(it));

  return result;
}

async function saveOrder(orderKey, ids) {
  const key = `order_${orderKey}`;
  const value = ids.join(",");
  if (SETTINGS) SETTINGS[key] = value;

  if (isDemo()) {
    MOCK.settings[key] = value;
    return;
  }
  await postToSheet({ action: "updateSetting", key, value });
}

/**
 * Makes every element matching `cardSelector` inside `container` draggable
 * (admin mode only — dragstart is cancelled otherwise). Dragging one card
 * over another live-reorders them in the DOM immediately (the "snap" — cards
 * shuffle into place as you drag, same as any native reorderable list), and
 * dropping persists the final DOM order via saveOrder().
 *
 * `layout` controls which axis decides "before or after the hovered card":
 *   "horizontal" — a single scrolling row (carousels, thumbnail strips)
 *   "vertical"   — a single column (leaderboard rows)
 *   "grid"       — a wrapping grid (compares row first, then column)
 */
function makeSortable(container, orderKey, cardSelector, idAttr, layout = "grid") {
  let draggedEl = null;
  const cards = () => Array.from(container.querySelectorAll(cardSelector));

  cards().forEach((card) => {
    // Only actually mark cards draggable while admin mode is on. Leaving
    // draggable="true" set for every regular visitor (as before) made the
    // browser treat the card's own <img> as a native drag source the moment
    // the cursor rested on it — which silently fights any in-progress
    // programmatic scrollLeft animation (e.g. the Netflix-style auto-scroll
    // drift) the instant a visitor's mouse crosses a book cover.
    card.classList.add("js-sortable-card");
    card.setAttribute("draggable", document.body.classList.contains("admin-mode") ? "true" : "false");

    card.addEventListener("dragstart", (e) => {
      if (!document.body.classList.contains("admin-mode")) { e.preventDefault(); return; }
      // Don't hijack text selection when the admin is editing a
      // contenteditable field inside a draggable section (e.g. the hero
      // title) — let that behave like normal text selection instead.
      if (e.target.closest('[contenteditable="true"]')) { e.preventDefault(); return; }
      draggedEl = card;
      e.dataTransfer.effectAllowed = "move";
      requestAnimationFrame(() => card.classList.add("dragging"));
    });

    card.addEventListener("dragend", () => {
      card.classList.remove("dragging");
      if (draggedEl) {
        const ids = cards().map((c) => c.dataset[idAttr]);
        saveOrder(orderKey, ids);
      }
      draggedEl = null;
    });

    card.addEventListener("dragover", (e) => {
      if (!draggedEl || draggedEl === card) return;
      e.preventDefault();

      const rect = card.getBoundingClientRect();
      let insertBefore;
      if (layout === "horizontal") {
        insertBefore = e.clientX < rect.left + rect.width / 2;
      } else if (layout === "vertical") {
        insertBefore = e.clientY < rect.top + rect.height / 2;
      } else {
        const sameRow = Math.abs(e.clientY - (rect.top + rect.height / 2)) < rect.height / 2;
        insertBefore = sameRow
          ? e.clientX < rect.left + rect.width / 2
          : e.clientY < rect.top + rect.height / 2;
      }

      if (insertBefore) card.parentNode.insertBefore(draggedEl, card);
      else card.parentNode.insertBefore(draggedEl, card.nextSibling);
    });
  });
}

/**
 * Attach a "blur" listener to every editable element so edits are saved
 * (POSTed to the Google Sheet) the moment the admin clicks away.
 */
function wireInlineEditing(container = document) {
  container.querySelectorAll("[data-editable]").forEach((el) => {
    if (el.dataset.wired) return;
    el.dataset.wired = "true";

    let originalValue = el.textContent.trim();

    el.addEventListener("focus", () => {
      originalValue = el.textContent.trim();
    });

    el.addEventListener("blur", async () => {
      const newValue = el.textContent.trim();
      if (newValue === originalValue) return;

      // Settings-backed elements (branding, nav labels, page descriptions)
      // are key/value pairs in the Settings sheet, not sheet/row/column
      // targeted cells — route those through updateSetting instead.
      if (el.dataset.settingKey) {
        const result = await postToSheet({ action: "updateSetting", key: el.dataset.settingKey, value: newValue });
        if (result.status === "ok") {
          if (isDemo()) MOCK.settings[el.dataset.settingKey] = newValue;
          SETTINGS[el.dataset.settingKey] = newValue;
          // Other elements bound to the same key (e.g. a nav label and its
          // page's big <h1> share one key) update immediately too, without
          // needing a full reload.
          document.querySelectorAll(`[data-setting-key="${el.dataset.settingKey}"]`).forEach((other) => {
            if (other !== el) other.textContent = newValue;
          });
          showToast("Tetapan berjaya dikemas kini.");
        } else {
          showToast("Gagal menyimpan tetapan.", "error");
        }
        return;
      }

      const payload = {
        action: "update",
        sheet: el.dataset.sheet || "General",
        row: el.dataset.row || null,
        column: el.dataset.col || null,
        key: el.dataset.editable,
        value: newValue,
      };

      const result = await postToSheet(payload);
      if (result.status === "ok") {
        showToast(`"${el.dataset.editable}" berjaya dikemas kini.`);
      } else {
        showToast("Gagal menyimpan perubahan.", "error");
      }
    });
  });
}

// ==========================================================================
// SITE SETTINGS — branding, nav labels/icons, page descriptions and custom
// CSS. Backed by the "Settings" key/value sheet via the generic
// updateSetting action; SETTINGS holds the current values in memory.
// ==========================================================================

let SETTINGS = {};

const NAV_SECTIONS = ["home", "pustaka", "elibrary", "leaderboard", "carta", "kalendar", "wakaf"];
const PAGE_DESC_SECTIONS = ["pustaka", "elibrary", "leaderboard", "carta", "kalendar", "wakaf"];

async function renderSettings() {
  const fetched = await fetchSheet("Settings", MOCK.settings);
  // Defensive merge: if the deployed Code.gs is older than this frontend
  // (Settings not implemented yet, so it comes back as [] instead of an
  // object) or is just missing a key, fall back to sane defaults instead
  // of leaving text blank.
  SETTINGS = Object.assign({}, MOCK.settings, Array.isArray(fetched) ? {} : fetched);

  document.querySelectorAll('[data-setting-key="brand_line1"]').forEach((el) => (el.textContent = SETTINGS.brand_line1));
  document.querySelectorAll('[data-setting-key="brand_line2"]').forEach((el) => (el.textContent = SETTINGS.brand_line2));
  document.querySelectorAll('[data-setting-key="brand_line3"]').forEach((el) => (el.textContent = SETTINGS.brand_line3));

  const mobileLogo = document.getElementById("mobileLogo");
  if (mobileLogo) mobileLogo.textContent = `${SETTINGS.brand_line1} ${SETTINGS.brand_line2}`;

  NAV_SECTIONS.forEach((section) => {
    const labelValue = SETTINGS[`nav_${section}_label`];
    const navItem = document.querySelector(`.nav-item[data-section="${section}"]`);

    if (navItem) {
      const label = navItem.querySelector(".nav-label");
      if (label) label.textContent = labelValue || label.textContent;

      const iconWrap = navItem.querySelector(".nav-icon");
      if (iconWrap) {
        // Remember the original SVG once, so clearing a custom emoji later can restore it.
        if (!iconWrap.dataset.defaultIcon) iconWrap.dataset.defaultIcon = iconWrap.innerHTML;
        const customIcon = SETTINGS[`nav_${section}_icon`];
        iconWrap.innerHTML = customIcon ? `<span>${customIcon}</span>` : iconWrap.dataset.defaultIcon;
      }
    }

    // The big on-page <h1> for each section shares the same setting as its
    // nav label, so renaming a tab (from either place) keeps both in sync.
    const pageTitle = document.querySelector(`#page-${section} h1[data-setting-key="nav_${section}_label"]`);
    if (pageTitle) pageTitle.textContent = labelValue || pageTitle.textContent;
  });

  PAGE_DESC_SECTIONS.forEach((section) => {
    const el = document.querySelector(`#page-${section} [data-setting-key="page_${section}_desc"]`);
    if (el) el.textContent = SETTINGS[`page_${section}_desc`];
  });

  applyCustomCss(SETTINGS.custom_css || "");
  wireInlineEditing(document);
}

function applyCustomCss(css) {
  let styleEl = document.getElementById("customCssStyle");
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = "customCssStyle";
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = css;
}

async function handleNavIconEditClick(btn) {
  const section = btn.dataset.section;
  const key = `nav_${section}_icon`;
  const current = SETTINGS[key] || "";
  const emoji = window.prompt("Masukkan emoji baharu untuk ikon ini (kosongkan untuk guna ikon asal):", current);
  if (emoji === null) return;

  if (isDemo()) {
    MOCK.settings[key] = emoji;
    SETTINGS[key] = emoji;
    showToast("Ikon dikemas kini (mod demo).");
    renderSettings();
    return;
  }

  const result = await postToSheet({ action: "updateSetting", key, value: emoji });
  if (result.status === "ok") {
    SETTINGS[key] = emoji;
    showToast("Ikon berjaya dikemas kini.");
    renderSettings();
  } else {
    showToast("Gagal mengemas kini ikon.", "error");
  }
}

// ==========================================================================
// DRAGGABLE MODALS — every dialog box can be moved by dragging its
// background (grabbing a button/input/link inside it still works normally)
// and resized via the native browser resize handle (CSS `resize: both` on
// .modal-box). Position resets each time a dialog is (re)opened so it can
// never get dragged somewhere and "lost" between uses.
// ==========================================================================

function makeDialogDraggable(dialogEl) {
  if (!dialogEl || dialogEl.dataset.dragWired) return;
  dialogEl.dataset.dragWired = "true";

  let dragging = false;
  let startX = 0, startY = 0, startLeft = 0, startTop = 0;

  dialogEl.addEventListener("mousedown", (e) => {
    if (e.target.closest("button, input, textarea, select, a")) return;
    const rect = dialogEl.getBoundingClientRect();
    dragging = true;
    dialogEl.classList.add("dragging");
    dialogEl.style.position = "fixed";
    dialogEl.style.left = rect.left + "px";
    dialogEl.style.top = rect.top + "px";
    dialogEl.style.margin = "0";
    startX = e.clientX;
    startY = e.clientY;
    startLeft = rect.left;
    startTop = rect.top;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!dragging) return;
    dialogEl.style.left = startLeft + (e.clientX - startX) + "px";
    dialogEl.style.top = startTop + (e.clientY - startY) + "px";
  });

  document.addEventListener("mouseup", () => {
    dragging = false;
    dialogEl.classList.remove("dragging");
  });
}

/** Clears any drag/resize position so a dialog reopens centered, not
 *  wherever it was last left. Call right before showing a modal. */
function resetDialogPosition(dialogEl) {
  if (!dialogEl) return;
  dialogEl.style.position = "";
  dialogEl.style.left = "";
  dialogEl.style.top = "";
  dialogEl.style.margin = "";
  dialogEl.style.width = "";
  dialogEl.style.height = "";
}

function initDraggableModals() {
  ["adminModalBox", "bookModalContent", "formModalBox", "cssModalBox"].forEach((id) => {
    makeDialogDraggable(document.getElementById(id));
  });
}

function initCustomCssModal() {
  const openBtn = document.getElementById("openCssModalBtn");
  const modal = document.getElementById("cssModal");
  const textarea = document.getElementById("cssModalTextarea");

  openBtn.addEventListener("click", () => {
    textarea.value = SETTINGS.custom_css || "";
    resetDialogPosition(document.getElementById("cssModalBox"));
    modal.classList.add("show");
  });

  document.getElementById("cssModalCancel").addEventListener("click", () => modal.classList.remove("show"));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("show"); });

  document.getElementById("cssModalSave").addEventListener("click", async () => {
    const css = textarea.value;
    applyCustomCss(css); // live preview immediately, before the save round-trip

    if (isDemo()) {
      MOCK.settings.custom_css = css;
      SETTINGS.custom_css = css;
      showToast("CSS tersuai disimpan (mod demo).");
      modal.classList.remove("show");
      return;
    }

    const result = await postToSheet({ action: "updateSetting", key: "custom_css", value: css });
    if (result.status === "ok") {
      SETTINGS.custom_css = css;
      showToast("CSS tersuai berjaya disimpan.");
      modal.classList.remove("show");
    } else {
      showToast("Gagal menyimpan CSS tersuai.", "error");
    }
  });
}

// ==========================================================================
// RENDER: HOME / BULLETIN
// ==========================================================================

// ==========================================================================
// RENDER: HERO SLIDESHOW — multiple background images that crossfade
// automatically. Admin manages the list via a thumbnail strip below the
// hero (add/delete/upload), using the same generic CRUD engine as
// everything else. Regular visitors just see the fade cycle.
// ==========================================================================

let heroSlideTimer = null;

async function renderHeroSlides() {
  let slides = await fetchSheet("HeroSlides", MOCK.heroSlides);
  slides = applySavedOrder(slides, "heroslides");
  const heroMedia = document.getElementById("heroMedia");

  heroMedia.querySelectorAll(".hero-slide").forEach((el) => el.remove());
  slides.forEach((s, i) => {
    const img = document.createElement("img");
    img.src = s.image;
    img.alt = "Buletin Pengumuman";
    img.className = "hero-slide" + (i === 0 ? " active" : "");
    heroMedia.insertBefore(img, heroMedia.firstChild);
  });

  const strip = document.getElementById("heroSlidesStrip");
  strip.innerHTML =
    slides
      .map(
        (s) => `
    <div class="hero-slide-thumb" data-slide-id="${s.id}">
      <img src="${s.image}" alt="Slaid hero" loading="lazy">
      ${imgEditBtnHTML("HeroSlides", s.id, "image", "Tukar gambar slaid")}
      ${deleteBtnHTML("HeroSlides", s.id)}
    </div>`
      )
      .join("") + addTileHTML("HeroSlides", "Tambah Gambar");
  makeSortable(strip, "heroslides", ".hero-slide-thumb", "slideId", "horizontal");

  clearInterval(heroSlideTimer);
  if (slides.length > 1) {
    let activeIndex = 0;
    heroSlideTimer = setInterval(() => {
      const imgs = heroMedia.querySelectorAll(".hero-slide");
      if (imgs.length < 2) return;
      imgs[activeIndex].classList.remove("active");
      activeIndex = (activeIndex + 1) % imgs.length;
      imgs[activeIndex].classList.add("active");
    }, 5000);
  }
}

async function renderHome() {
  const announcements = await fetchSheet("Announcements", MOCK.announcements);
  const marqueeItems = await fetchSheet("Activities", MOCK.marquee);

  // Hero text always uses the first announcement AS FETCHED (stable sheet
  // row order) — deliberately NOT reordered by applySavedOrder(). Otherwise
  // dragging the "Pengumuman Lain" grid into a new order could silently
  // promote a *different* announcement to become the featured hero, which
  // looks exactly like an edit "reverting" even though nothing was lost —
  // the real content just moved to the grid. (The background image is a
  // separate multi-slide slideshow — see renderHeroSlides().)
  const hero = announcements[0];
  const heroDeleteWrap = document.getElementById("heroDeleteWrap");
  if (hero) {
    const heroTitle = document.querySelector('[data-editable="announcement-title"]');
    const heroDesc = document.querySelector('[data-editable="announcement-desc"]');
    heroTitle.textContent = hero.title;
    heroDesc.textContent = hero.description;
    heroTitle.dataset.row = hero.id;
    heroDesc.dataset.row = hero.id;
    heroDeleteWrap.innerHTML = `<button type="button" class="hero-delete-btn item-delete-btn" data-sheet="Announcements" data-id="${hero.id}" title="Padam pengumuman ini">${icon("trash")} Padam</button>`;
  }

  // Marquee — duplicate items for a seamless infinite loop (the CSS
  // animation slides the track by exactly -50%, so it only loops seamlessly
  // when the track holds two back-to-back copies). But every duplicated
  // item carries its own live delete/upload buttons with the same
  // data-id, so in admin mode this reads as "I added one photo and two
  // appeared" — every activity has always shown twice, admin only notices
  // it the moment they add or upload one. Render a single editable copy
  // (no animation) while admin mode is on, and only duplicate + animate for
  // regular visitors.
  const track = document.getElementById("marqueeTrack");
  const buildItems = (list) =>
    list
      .map(
        (item) => `
      <div class="marquee-item">
        <img src="${item.img}" alt="${item.caption}" loading="lazy">
        <div class="marquee-caption">${item.caption}</div>
        ${deleteBtnHTML("Activities", item.id)}
        ${imgEditBtnHTML("Activities", item.id, "img", "Tukar gambar aktiviti")}
      </div>`
      )
      .join("");
  track.innerHTML = document.body.classList.contains("admin-mode")
    ? buildItems(marqueeItems)
    : buildItems(marqueeItems) + buildItems(marqueeItems);

  // Remaining announcements grid (skip the hero one) — reordering here only
  // ever affects this grid's own display order, never which one is hero.
  const grid = document.getElementById("announcementGrid");
  const gridItems = applySavedOrder(announcements.slice(1), "announcements");
  grid.innerHTML =
    gridItems
      .map(
        (a) => `
    <div class="glass-card announcement-card" data-announcement-id="${a.id}">
      ${deleteBtnHTML("Announcements", a.id)}
      <h3 data-editable="announcement-title-${a.id}" data-sheet="Announcements" data-row="${a.id}" data-col="title">${a.title}</h3>
      <p data-editable="announcement-desc-${a.id}" data-sheet="Announcements" data-row="${a.id}" data-col="description">${a.description}</p>
      <span class="date-tag">${formatDate(a.date)}</span>
    </div>`
      )
      .join("") + addTileHTML("Announcements", "Tambah Pengumuman");
  makeSortable(grid, "announcements", ".announcement-card", "announcementId", "grid");

  wireInlineEditing(grid);
  wireInlineEditing(document.querySelector(".hero"));
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" });
}

// ==========================================================================
// RENDER: PUSTAKA INTERAKTIF (NETFLIX CAROUSEL)
// ==========================================================================

function slugifyOrderKey(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

async function renderPustaka() {
  const rows = await fetchSheet("Books", MOCK.books);
  rows.forEach((row) => {
    row.items = applySavedOrder(row.items, `books_${slugifyOrderKey(row.category)}`);
  });
  const container = document.getElementById("carouselRows");
  const inAdminMode = document.body.classList.contains("admin-mode");

  const buildBooks = (items) =>
    items
      .map(
        (book) => `
          <div class="book-card" data-book-id="${book.id}">
            <img src="${book.cover}" alt="${book.title}" loading="lazy">
            ${deleteBtnHTML("Books", book.id)}
            ${imgEditBtnHTML("Books", book.id, "cover", "Tukar kulit buku")}
            <div class="book-card-overlay">
              <h4>${book.title}</h4>
              <p>${book.synopsis}</p>
              <button class="btn btn-primary book-borrow-btn" data-book-id="${book.id}">${icon("book")} Tempah Buku</button>
            </div>
          </div>`
      )
      .join("");

  container.innerHTML = rows
    .map(
      (row) => `
    <div class="carousel-row">
      <h3 class="carousel-row-title">${row.category}</h3>
      <div class="carousel-scroller" data-category="${row.category}">
        ${
          // A category with only 4-5 books almost never overflows a wide
          // desktop viewport, so there's nothing for the auto-scroll drift
          // to actually scroll — it silently does nothing (not a bug, just
          // nothing to scroll). Duplicating the row's cards guarantees real
          // overflow so the Netflix-style drift always has room to move,
          // the same fix already applied to the Home marquee. But each
          // duplicate card carries its own delete/upload button sharing the
          // same data-book-id, so — exactly as with the marquee — only do
          // this for regular visitors; admin mode always shows one true,
          // editable copy per book.
          inAdminMode ? buildBooks(row.items) : buildBooks(row.items) + buildBooks(row.items)
        }
        ${addTileHTML("Books", "Tambah Buku", { category: row.category })}
      </div>
    </div>`
    )
    .join("");

  // click card -> open detail modal; click button/admin-control -> handled separately
  container.querySelectorAll(".book-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".item-delete-btn, .img-edit-trigger, .book-borrow-btn")) return;
      openBookModal(card.dataset.bookId, rows);
    });
  });
  container.querySelectorAll(".book-borrow-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      reserveBook(btn.dataset.bookId, btn);
    });
  });

  container.querySelectorAll(".carousel-scroller").forEach((scroller) => {
    makeSortable(scroller, `books_${slugifyOrderKey(scroller.dataset.category)}`, ".book-card", "bookId", "horizontal");
  });

  initCarouselAutoScroll(container);
}

/**
 * Netflix-style continuous row movement: each carousel row slowly drifts
 * sideways on its own, reversing direction at either end, and pauses the
 * instant the cursor enters it (cards still enlarge via the existing hover
 * CSS). Runs via requestAnimationFrame and self-terminates the moment its
 * row is removed from the DOM (e.g. on the next renderPustaka() re-render),
 * so re-rendering never leaks orphaned animation loops.
 */
function initCarouselAutoScroll(container) {
  container.querySelectorAll(".carousel-scroller").forEach((scroller) => {
    let direction = 1;
    let paused = false;
    // scrollLeft is exposed/rounded as an integer by the browser, so
    // accumulating a sub-1px step directly on it (scroller.scrollLeft += 0.6)
    // never moves — each read-modify-write starts from the rounded-down
    // value again. Track the true fractional position separately instead,
    // and only ever write (never read back) it into scrollLeft.
    let virtualScroll = scroller.scrollLeft;

    scroller.addEventListener("mouseenter", () => { paused = true; });
    scroller.addEventListener("mouseleave", () => { paused = false; });
    scroller.addEventListener("touchstart", () => { paused = true; }, { passive: true });

    const step = () => {
      if (!scroller.isConnected) return; // row was re-rendered/removed — stop looping

      if (!paused) {
        const maxScroll = scroller.scrollWidth - scroller.clientWidth;
        if (maxScroll > 0) {
          virtualScroll += direction * 0.6;
          if (virtualScroll >= maxScroll) { virtualScroll = maxScroll; direction = -1; }
          else if (virtualScroll <= 0) { virtualScroll = 0; direction = 1; }
          scroller.scrollLeft = virtualScroll;
        }
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function findBook(bookId, rows) {
  for (const row of rows) {
    const found = row.items.find((b) => b.id === bookId);
    if (found) return found;
  }
  return null;
}

function openBookModal(bookId, rows) {
  const book = findBook(bookId, rows);
  if (!book) return;
  const modal = document.getElementById("bookModal");
  const content = document.getElementById("bookModalContent");

  content.innerHTML = `
    <div class="book-modal-hero">
      <img src="${book.cover}" alt="${book.title}">
      ${imgEditBtnHTML("Books", book.id, "cover", "Tukar kulit buku")}
      <button class="modal-close" id="bookModalClose">${icon("x")}</button>
    </div>
    <div class="book-modal-body">
      <h2>${book.title}</h2>
      <div class="book-modal-meta">${icon("bookOpen")} Tersedia di Pusat Sumber Sekolah</div>
      <p>${book.synopsis}</p>
      <button class="btn btn-primary book-borrow-btn" data-book-id="${book.id}">${icon("book")} Tempah Buku</button>
    </div>`;

  resetDialogPosition(content);
  modal.classList.add("show");
  document.getElementById("bookModalClose").addEventListener("click", () => modal.classList.remove("show"));
  content.querySelector(".book-borrow-btn").addEventListener("click", (e) => reserveBook(book.id, e.target));
  modal.addEventListener("click", (e) => { if (e.target === modal) modal.classList.remove("show"); }, { once: true });
}

async function reserveBook(bookId, btn) {
  btn.disabled = true;
  btn.innerHTML = `${icon("spinner")} Memproses...`;

  const result = await postToSheet({ action: "reserveBook", sheet: "Books", bookId });

  if (result.status === "ok" || result.demo) {
    btn.innerHTML = `${icon("checkCircle")} Ditempah!`;
    showToast("Buku berjaya ditempah. Sila dapatkan di kaunter PSS.");
  } else {
    btn.disabled = false;
    btn.innerHTML = `${icon("book")} Tempah Buku`;
    showToast("Gagal menempah buku. Cuba lagi.", "error");
  }
}

// ==========================================================================
// RENDER: E-LIBRARY
// ==========================================================================

let elibraryData = [];

async function renderElibrary() {
  elibraryData = await fetchSheet("ELibrary", MOCK.elibrary);
  elibraryData = applySavedOrder(elibraryData, "elibrary");
  drawElibrary("all");

  document.querySelectorAll(".filter-bar .chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      document.querySelectorAll(".filter-bar .chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      drawElibrary(chip.dataset.filter);
    });
  });
}

const ELIB_ICONS = { "Kertas Peperiksaan": "file", "Nota": "fileText", "Pautan": "link" };

function drawElibrary(filter) {
  const grid = document.getElementById("elibraryGrid");
  const items = filter === "all" ? elibraryData : elibraryData.filter((i) => i.type === filter);

  grid.innerHTML =
    items
      .map(
        (item) => `
    <div class="glass-card elib-card" data-elib-id="${item.id}">
      ${deleteBtnHTML("ELibrary", item.id)}
      <div class="elib-icon">${icon(ELIB_ICONS[item.type] || "file")}</div>
      <h3>${item.title}</h3>
      <div class="elib-meta">${item.type} · ${item.meta}</div>
      <a class="btn btn-ghost" href="${item.link}" target="_blank" rel="noopener">${icon("download")} Muat Turun</a>
    </div>`
      )
      .join("") + addTileHTML("ELibrary", "Tambah Bahan");

  // Only allow drag-reordering on the unfiltered view — reordering within a
  // filtered subset would silently push every hidden item to the end of the
  // saved order the next time it's read back.
  if (filter === "all") makeSortable(grid, "elibrary", ".elib-card", "elibId", "grid");
}

// ==========================================================================
// RENDER: LEADERBOARD
// ==========================================================================

async function renderLeaderboard() {
  const data = await fetchSheet("Leaderboard", MOCK.leaderboard);
  const sorted = [...data].sort((a, b) => b.score - a.score).slice(0, 10);

  const podium = document.getElementById("leaderboardPodium");
  const [first, second, third] = sorted;
  const podiumHtml = (rank, person) => {
    if (!person) return "";
    return `
      <div class="podium-item rank-${rank}">
        ${rank === 1 ? `<div class="podium-crown">${icon("crown")}</div>` : ""}
        ${deleteBtnHTML("Leaderboard", person.id)}
        <div class="podium-avatar">
          ${person.photo ? `<img src="${person.photo}" alt="${person.name}">` : initials(person.name)}
          ${imgEditBtnHTML("Leaderboard", person.id, "photo", "Tukar gambar pelajar")}
        </div>
        <div class="podium-name">${person.name}</div>
        <div class="podium-class">${person.kelas}</div>
        <div class="podium-score">${person.score} pts</div>
      </div>`;
  };
  podium.innerHTML = podiumHtml(1, first) + podiumHtml(2, second) + podiumHtml(3, third);

  const list = document.getElementById("leaderboardList");
  const maxScore = sorted[0] ? sorted[0].score : 1;
  list.innerHTML =
    sorted
      .slice(3)
      .map(
        (p, i) => `
    <div class="lb-row">
      <div class="lb-rank">#${i + 4}</div>
      <div class="lb-avatar">
        ${p.photo ? `<img src="${p.photo}" alt="${p.name}">` : initials(p.name)}
        ${imgEditBtnHTML("Leaderboard", p.id, "photo", "Tukar gambar pelajar")}
      </div>
      <div class="lb-info">
        <div class="lb-name">${p.name}</div>
        <div class="lb-class">${p.kelas}</div>
      </div>
      <div class="lb-bar-wrap"><div class="lb-bar" style="width:${(p.score / maxScore) * 100}%"></div></div>
      <div class="lb-score">${p.score}</div>
      ${deleteBtnHTML("Leaderboard", p.id)}
    </div>`
      )
      .join("") + `<div class="lb-add-row">${addTileHTML("Leaderboard", "Tambah Pelajar", { inline: true })}</div>`;
}

function initials(name) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}

// ==========================================================================
// RENDER: CARTA ORGANISASI
// ==========================================================================

async function renderCarta() {
  const committee = await fetchSheet("Committee", MOCK.committee);
  const container = document.getElementById("orgChart");

  const tiers = [...new Set(committee.map((c) => c.tier))].sort((a, b) => a - b);
  container.innerHTML =
    tiers
      .map((tier) => {
        const members = applySavedOrder(committee.filter((c) => c.tier === tier), `committee_tier${tier}`, "editKey");
        return `
      <div class="org-tier" data-tier="${tier}">
        ${members
          .map(
            (m) => `
          <div class="glass-card org-card" data-org-key="${m.editKey}">
            ${deleteBtnHTML("Committee", m.editKey)}
            ${imgEditBtnHTML("Committee", m.editKey, "avatar", "Tukar gambar")}
            <img class="org-avatar" src="${m.avatar}" alt="${m.name}">
            <div class="org-name" data-editable="${m.editKey}-name" data-sheet="Committee" data-row="${m.editKey}" data-col="name">${m.name}</div>
            <div class="org-role" data-editable="${m.editKey}-role" data-sheet="Committee" data-row="${m.editKey}" data-col="role">${m.role}</div>
          </div>`
          )
          .join("")}
      </div>`;
      })
      .join("") + `<div class="org-add-row">${addTileHTML("Committee", "Tambah Ahli", { inline: true })}</div>`;

  container.querySelectorAll(".org-tier").forEach((tierEl) => {
    makeSortable(tierEl, `committee_tier${tierEl.dataset.tier}`, ".org-card", "orgKey", "grid");
  });

  wireInlineEditing(container);
}

// ==========================================================================
// RENDER: KALENDAR ACARA
// ==========================================================================

async function renderKalendar() {
  let events = await fetchSheet("Events", MOCK.events);
  events = applySavedOrder(events, "events");
  const grid = document.getElementById("eventGrid");

  grid.innerHTML =
    events
      .map(
        (ev) => `
    <div class="glass-card event-card" data-event-id="${ev.id}">
      ${deleteBtnHTML("Events", ev.id)}
      <div class="event-card-img">
        <img src="${ev.image}" alt="${ev.title}" loading="lazy">
        ${imgEditBtnHTML("Events", ev.id, "image", "Tukar gambar acara")}
      </div>
      <div class="event-date-badge"><div class="day">${ev.day}</div><div class="month">${ev.month}</div></div>
      <div class="event-card-body">
        <h3>${ev.title}</h3>
        <p>${ev.desc}</p>
        <div class="event-card-actions">
          <a class="btn btn-ghost" href="${ev.rulesLink || "#"}" target="_blank" rel="noopener">${icon("clipboard")} Peraturan</a>
          <button type="button" class="link-edit-btn" data-sheet="Events" data-row="${ev.id}" data-col="rulesLink" data-current="${ev.rulesLink || ""}" title="Tetapkan pautan peraturan">${icon("link")}</button>
          <a class="btn btn-primary" href="${ev.registerLink || "#"}" target="_blank" rel="noopener">${icon("edit")} Daftar</a>
          <button type="button" class="link-edit-btn" data-sheet="Events" data-row="${ev.id}" data-col="registerLink" data-current="${ev.registerLink || ""}" title="Tetapkan pautan pendaftaran">${icon("link")}</button>
        </div>
      </div>
    </div>`
      )
      .join("") + addTileHTML("Events", "Tambah Acara");
  makeSortable(grid, "events", ".event-card", "eventId", "grid");
}

// ==========================================================================
// RENDER: WAKAF & SUMBANGAN (WISHLIST)
// ==========================================================================

async function renderWakaf() {
  let wishlist = await fetchSheet("Wishlist", MOCK.wishlist);
  wishlist = applySavedOrder(wishlist, "wishlist");
  const grid = document.getElementById("wishlistGrid");

  grid.innerHTML =
    wishlist
      .map(
        (w) => `
    <div class="glass-card wish-card ${w.donated ? "donated" : ""}" data-wish-id="${w.id}">
      ${deleteBtnHTML("Wishlist", w.id)}
      <div class="wish-img">
        <img src="${w.image}" alt="${w.name}" loading="lazy">
        ${imgEditBtnHTML("Wishlist", w.id, "image", "Tukar gambar item")}
      </div>
      <h3>${w.name}</h3>
      <div class="wish-meta"><span class="wish-qty">${w.qty}</span></div>
      <div class="wish-progress"><div class="wish-progress-bar" style="width:${w.progress}%"></div></div>
      <button class="btn ${w.donated ? "btn-ghost" : "btn-primary"} wish-donate-btn" data-wish-id="${w.id}" ${w.donated ? "disabled" : ""}>
        ${w.donated ? `${icon("checkCircle")} Terima Kasih!` : `${icon("gift")} Sumbang Item Ini`}
      </button>
    </div>`
      )
      .join("") + addTileHTML("Wishlist", "Tambah Item");

  grid.querySelectorAll(".wish-donate-btn").forEach((btn) => {
    btn.addEventListener("click", () => donateItem(btn.dataset.wishId, btn));
  });
  makeSortable(grid, "wishlist", ".wish-card", "wishId", "grid");
}

async function donateItem(wishId, btn) {
  btn.disabled = true;
  btn.innerHTML = `${icon("spinner")} Memproses...`;

  const result = await postToSheet({ action: "donate", sheet: "Wishlist", itemId: wishId });

  if (result.status === "ok" || result.demo) {
    btn.innerHTML = `${icon("checkCircle")} Terima Kasih!`;
    btn.classList.remove("btn-primary");
    btn.classList.add("btn-ghost");
    btn.closest(".wish-card").classList.add("donated");
    showToast("Terima kasih atas sumbangan anda! Pihak PSS akan menghubungi anda.");
  } else {
    btn.disabled = false;
    btn.innerHTML = `${icon("gift")} Sumbang Item Ini`;
    showToast("Gagal menghantar sumbangan. Cuba lagi.", "error");
  }
}

// ==========================================================================
// INIT
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initMobileSidebar();
  initAdminMode();
  initAdminCRUD();
  initThemeCustomizer();
  initCustomCssModal();
  initDraggableModals();
  initTiltEffect();
  initHeroSpotlight();
  initThemeModeToggle();

  if (!USING_LIVE_BACKEND()) {
    console.info(
      "%cMod Demo Aktif","color:#f5c518;font-weight:bold;",
      "\nTiada Google Apps Script URL dikonfigurasi. Dashboard menggunakan data contoh (MOCK).\nKemas kini CONFIG.APPS_SCRIPT_URL dalam script.js untuk sambung ke Google Sheet sebenar."
    );
  }

  // Keep the loading overlay up until every section has fetched its real
  // data, so visitors never see stale placeholder content flash before the
  // live Google Sheet data arrives. A hard timeout guarantees the overlay
  // still lifts (showing whatever loaded) even if one fetch hangs/fails.
  const allRendered = Promise.all([
    renderSettings(),
    renderHeroSlides(),
    renderHome(),
    renderPustaka(),
    renderElibrary(),
    renderLeaderboard(),
    renderCarta(),
    renderKalendar(),
    renderWakaf(),
  ]);
  const safetyTimeout = new Promise((resolve) => setTimeout(resolve, 8000));

  // .catch() here is load-bearing: if any single render*() rejects,
  // Promise.all (and therefore the race) rejects too, and without this the
  // .then() below would simply never run — permanently stranding every
  // visitor on the loading screen even though the other 8 sections had
  // already rendered fine. Log the error but always still reveal the page.
  Promise.race([allRendered, safetyTimeout])
    .catch((err) => console.error("Satu atau lebih seksyen gagal dimuatkan:", err))
    .then(() => {
      document.getElementById("appLoadingOverlay").classList.add("hidden");
      initHomeSectionSorting();
    });
});
