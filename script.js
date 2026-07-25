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
  return svg.replace("<svg ", `<svg class="icon ${extraClass}" `);
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
  const dataUrl = await fileToDataUrl(file);
  const cfg = CRUD[sheet];

  if (isDemo()) {
    cfg.demoUploadImage(row, dataUrl);
    showToast("Gambar dikemas kini (mod demo).");
    cfg.render();
    return;
  }

  showToast("Sedang memuat naik gambar...");
  const result = await postToSheet({ action: "uploadImage", dataUrl, filename: file.name, sheet, row, column });
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

  openFormModal({
    title: cfg.title,
    fields: cfg.fields({ category }),
    onSubmit: (values) => handleAddSubmit(sheet, values),
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

  document.querySelectorAll("[data-editable]").forEach((el) => {
    el.setAttribute("contenteditable", on ? "true" : "false");
  });

  if (!on) showToast("Mod Admin dimatikan.", "success");
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
// RENDER: HOME / BULLETIN
// ==========================================================================

async function renderHome() {
  const announcements = await fetchSheet("Announcements", MOCK.announcements);
  const marqueeItems = await fetchSheet("Activities", MOCK.marquee);

  // Hero uses the first announcement
  const hero = announcements[0];
  const heroDeleteWrap = document.getElementById("heroDeleteWrap");
  const heroImgBtn = document.getElementById("heroImgEditBtn");
  if (hero) {
    const heroImg = document.querySelector("#heroBanner .hero-media img");
    const heroTitle = document.querySelector('[data-editable="announcement-title"]');
    const heroDesc = document.querySelector('[data-editable="announcement-desc"]');
    if (hero.image) heroImg.src = hero.image;
    heroTitle.textContent = hero.title;
    heroDesc.textContent = hero.description;
    heroTitle.dataset.row = hero.id;
    heroDesc.dataset.row = hero.id;
    heroDeleteWrap.innerHTML = `<button type="button" class="hero-delete-btn item-delete-btn" data-sheet="Announcements" data-id="${hero.id}" title="Padam pengumuman ini">${icon("trash")} Padam</button>`;
    heroImgBtn.dataset.sheet = "Announcements";
    heroImgBtn.dataset.row = hero.id;
    heroImgBtn.dataset.col = "image";
  }

  // Marquee — duplicate items for a seamless infinite loop
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
  track.innerHTML = buildItems(marqueeItems) + buildItems(marqueeItems);

  // Remaining announcements grid (skip the hero one)
  const grid = document.getElementById("announcementGrid");
  grid.innerHTML =
    announcements
      .slice(1)
      .map(
        (a) => `
    <div class="glass-card announcement-card">
      ${deleteBtnHTML("Announcements", a.id)}
      <h3 data-editable="announcement-title-${a.id}" data-sheet="Announcements" data-row="${a.id}" data-col="Title">${a.title}</h3>
      <p data-editable="announcement-desc-${a.id}" data-sheet="Announcements" data-row="${a.id}" data-col="Description">${a.description}</p>
      <span class="date-tag">${formatDate(a.date)}</span>
    </div>`
      )
      .join("") + addTileHTML("Announcements", "Tambah Pengumuman");

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

async function renderPustaka() {
  const rows = await fetchSheet("Books", MOCK.books);
  const container = document.getElementById("carouselRows");

  container.innerHTML = rows
    .map(
      (row) => `
    <div class="carousel-row">
      <h3 class="carousel-row-title">${row.category}</h3>
      <div class="carousel-scroller">
        ${row.items
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
          .join("")}
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
    <div class="glass-card elib-card">
      ${deleteBtnHTML("ELibrary", item.id)}
      <div class="elib-icon">${icon(ELIB_ICONS[item.type] || "file")}</div>
      <h3>${item.title}</h3>
      <div class="elib-meta">${item.type} · ${item.meta}</div>
      <a class="btn btn-ghost" href="${item.link}" target="_blank" rel="noopener">${icon("download")} Muat Turun</a>
    </div>`
      )
      .join("") + addTileHTML("ELibrary", "Tambah Bahan");
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
        <div class="podium-avatar">${initials(person.name)}</div>
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
      <div class="lb-avatar">${initials(p.name)}</div>
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
        const members = committee.filter((c) => c.tier === tier);
        return `
      <div class="org-tier">
        ${members
          .map(
            (m) => `
          <div class="glass-card org-card">
            ${deleteBtnHTML("Committee", m.editKey)}
            ${imgEditBtnHTML("Committee", m.editKey, "avatar", "Tukar gambar")}
            <img class="org-avatar" src="${m.avatar}" alt="${m.name}">
            <div class="org-name" data-editable="${m.editKey}-name" data-sheet="Committee" data-row="${m.editKey}" data-col="Name">${m.name}</div>
            <div class="org-role" data-editable="${m.editKey}-role" data-sheet="Committee" data-row="${m.editKey}" data-col="Role">${m.role}</div>
          </div>`
          )
          .join("")}
      </div>`;
      })
      .join("") + `<div class="org-add-row">${addTileHTML("Committee", "Tambah Ahli", { inline: true })}</div>`;

  wireInlineEditing(container);
}

// ==========================================================================
// RENDER: KALENDAR ACARA
// ==========================================================================

async function renderKalendar() {
  const events = await fetchSheet("Events", MOCK.events);
  const grid = document.getElementById("eventGrid");

  grid.innerHTML =
    events
      .map(
        (ev) => `
    <div class="glass-card event-card">
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
}

// ==========================================================================
// RENDER: WAKAF & SUMBANGAN (WISHLIST)
// ==========================================================================

async function renderWakaf() {
  const wishlist = await fetchSheet("Wishlist", MOCK.wishlist);
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

  renderHome();
  renderPustaka();
  renderElibrary();
  renderLeaderboard();
  renderCarta();
  renderKalendar();
  renderWakaf();

  if (!USING_LIVE_BACKEND()) {
    console.info(
      "%cMod Demo Aktif","color:#f5c518;font-weight:bold;",
      "\nTiada Google Apps Script URL dikonfigurasi. Dashboard menggunakan data contoh (MOCK).\nKemas kini CONFIG.APPS_SCRIPT_URL dalam script.js untuk sambung ke Google Sheet sebenar."
    );
  }
});
