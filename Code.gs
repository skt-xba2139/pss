/**
 * ============================================================================
 * DASHBOARD PUSAT SUMBER SEKOLAH — GOOGLE APPS SCRIPT BACKEND
 * ============================================================================
 * Deploy as a Web App (Deploy > New deployment > Web app):
 *   - Execute as: Me
 *   - Who has access: Anyone (or "Anyone with Google account" for staff use)
 * Copy the resulting /exec URL into CONFIG.APPS_SCRIPT_URL in script.js.
 *
 * Expected Google Sheet tabs (create these exact sheet/tab names):
 *   Announcements | Activities | Books | ELibrary | Leaderboard |
 *   Committee | Events | Wishlist
 *
 * Suggested columns per tab (row 1 = header):
 *
 * Announcements: id | title | description | image | date
 * Activities:    id | img | caption
 * Books:         id | category | title | synopsis | cover | reserved (count)
 * ELibrary:      id | title | type | meta | link
 * Leaderboard:   id | name | kelas | score
 * Committee:     editKey | tier | name | role | avatar
 * Events:        id | day | month | title | desc | image | rulesLink | registerLink
 * Wishlist:      id | name | qty | progress | image | donated (TRUE/FALSE)
 *
 * If you already ran setupDashboardSheets() before "id"/rulesLink/registerLink
 * were added to this file, run upgradeDashboardSheets() once — it patches
 * existing tabs in place (adds the missing columns, backfills ids) without
 * touching any data you've already entered.
 *
 * Uploaded images (from Admin Mode's image-upload button) are stored in a
 * Google Drive folder named "PSS Dashboard Uploads" (auto-created on first
 * upload) and shared as "Anyone with the link can view" so they can be
 * hotlinked from the dashboard.
 * ============================================================================
 */

const SHEET_NAMES = {
  Announcements: "Announcements",
  Activities: "Activities",
  Books: "Books",
  ELibrary: "ELibrary",
  Leaderboard: "Leaderboard",
  Committee: "Committee",
  Events: "Events",
  Wishlist: "Wishlist",
};

/**
 * Handle GET requests: ?sheet=SheetName
 * Returns the sheet contents as a JSON array of objects (header row -> keys).
 */
function doGet(e) {
  try {
    const sheetName = e.parameter.sheet;
    if (!sheetName) {
      return jsonResponse({ status: "error", error: "Parameter 'sheet' diperlukan." });
    }

    // Special case: Books needs to be grouped by category for the carousel UI.
    if (sheetName === "Books") {
      return jsonResponse(getBooksGrouped());
    }

    const data = readSheetAsObjects(sheetName);
    return jsonResponse(data);
  } catch (err) {
    return jsonResponse({ status: "error", error: err.message });
  }
}

/**
 * Handle POST requests. Body is JSON (sent as text/plain by the frontend
 * to avoid CORS preflight issues with Apps Script Web Apps).
 *
 * Supported actions:
 *   - "update"       : inline admin edit of a single field
 *   - "reserveBook"  : increment reservation count for a book
 *   - "donate"       : mark a wishlist item as donated
 *   - "addRow"       : admin adds a new item to any sheet
 *   - "deleteRow"    : admin removes an item from any sheet
 *   - "uploadImage"  : admin uploads a new image (saved to Drive), optionally
 *                      writing the resulting URL straight into a sheet cell
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    let result;
    switch (action) {
      case "update":
        result = handleUpdate(payload);
        break;
      case "reserveBook":
        result = handleReserveBook(payload);
        break;
      case "donate":
        result = handleDonate(payload);
        break;
      case "addRow":
        result = handleAddRow(payload);
        break;
      case "deleteRow":
        result = handleDeleteRow(payload);
        break;
      case "uploadImage":
        result = handleUploadImage(payload);
        break;
      default:
        result = { status: "error", error: "Tindakan tidak dikenali: " + action };
    }
    return jsonResponse(result);
  } catch (err) {
    return jsonResponse({ status: "error", error: err.message });
  }
}

// ============================================================================
// ACTION HANDLERS
// ============================================================================

/**
 * Generic inline-edit handler used by Admin Mode.
 * payload: { sheet, row, column, key, value }
 * "row" may be a numeric sheet row id (Announcements) or a lookup key
 * such as an editKey (Committee) — handled by findRowIndex().
 */
function handleUpdate(payload) {
  const sheet = getSheet(payload.sheet);
  if (!sheet) return { status: "error", error: "Sheet tidak dijumpai: " + payload.sheet };

  const headers = getHeaders(sheet);
  const colIndex = findColumnIndex(headers, payload.column);
  if (colIndex === -1) return { status: "error", error: "Lajur tidak dijumpai: " + payload.column };

  const rowIndex = findRowIndex(sheet, headers, payload.row);
  if (rowIndex === -1) return { status: "error", error: "Baris tidak dijumpai: " + payload.row };

  sheet.getRange(rowIndex + 1, colIndex + 1).setValue(payload.value);
  return { status: "ok" };
}

/**
 * Increments a reservation counter for a book and logs the reservation.
 * payload: { bookId }
 */
function handleReserveBook(payload) {
  const sheet = getSheet(SHEET_NAMES.Books);
  if (!sheet) return { status: "error", error: "Sheet 'Books' tidak dijumpai." };

  const headers = getHeaders(sheet);
  const idCol = findColumnIndex(headers, "id");
  const reservedCol = findColumnIndex(headers, "reserved");
  if (idCol === -1) return { status: "error", error: "Lajur 'id' tiada dalam sheet Books." };

  const data = sheet.getDataRange().getValues();
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][idCol]) === String(payload.bookId)) {
      if (reservedCol !== -1) {
        const current = Number(data[r][reservedCol]) || 0;
        sheet.getRange(r + 1, reservedCol + 1).setValue(current + 1);
      }
      return { status: "ok" };
    }
  }
  return { status: "error", error: "Buku tidak dijumpai: " + payload.bookId };
}

/**
 * Marks a wishlist item as donated. Prevents duplicate donations by
 * checking the "donated" flag before writing.
 * payload: { itemId }
 */
function handleDonate(payload) {
  const sheet = getSheet(SHEET_NAMES.Wishlist);
  if (!sheet) return { status: "error", error: "Sheet 'Wishlist' tidak dijumpai." };

  const headers = getHeaders(sheet);
  const idCol = findColumnIndex(headers, "id");
  const donatedCol = findColumnIndex(headers, "donated");
  if (idCol === -1 || donatedCol === -1) {
    return { status: "error", error: "Lajur 'id'/'donated' tiada dalam sheet Wishlist." };
  }

  const data = sheet.getDataRange().getValues();
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][idCol]) === String(payload.itemId)) {
      if (data[r][donatedCol] === true || String(data[r][donatedCol]).toUpperCase() === "TRUE") {
        return { status: "error", error: "Item ini sudah disumbangkan oleh orang lain." };
      }
      sheet.getRange(r + 1, donatedCol + 1).setValue(true);
      return { status: "ok" };
    }
  }
  return { status: "error", error: "Item wishlist tidak dijumpai: " + payload.itemId };
}

/**
 * Admin adds a brand-new row to any sheet.
 * payload: { sheet, row: { columnName: value, ... } }
 * If the sheet has an "id" column and the caller didn't supply one, a unique
 * id is generated automatically (sheetname_timestamp) and returned so the
 * frontend can immediately re-render/reference the new item.
 */
function handleAddRow(payload) {
  const sheet = getSheet(payload.sheet);
  if (!sheet) return { status: "error", error: "Sheet tidak dijumpai: " + payload.sheet };

  const headers = getHeaders(sheet);
  const rawRow = payload.row || {};

  // Match submitted field names to headers case-insensitively, same as
  // every other handler — a caller sending "Title" instead of "title"
  // still lands in the right column instead of silently being dropped.
  const rowData = {};
  Object.keys(rawRow).forEach((k) => { rowData[String(k).toLowerCase()] = rawRow[k]; });

  let generatedId = null;
  if (findColumnIndex(headers, "id") !== -1 && !rowData.id) {
    generatedId = payload.sheet.toLowerCase() + "_" + new Date().getTime();
    rowData.id = generatedId;
  }

  const orderedValues = headers.map((h) => {
    const v = rowData[String(h).toLowerCase()];
    return v !== undefined ? v : "";
  });
  sheet.appendRow(orderedValues);

  return { status: "ok", id: generatedId || rowData.id || null };
}

/**
 * Admin deletes a row from any sheet, matched by id/editKey (via
 * findRowIndex — same lookup used by handleUpdate).
 * payload: { sheet, id }
 */
function handleDeleteRow(payload) {
  const sheet = getSheet(payload.sheet);
  if (!sheet) return { status: "error", error: "Sheet tidak dijumpai: " + payload.sheet };

  const headers = getHeaders(sheet);
  const rowIndex = findRowIndex(sheet, headers, payload.id);
  if (rowIndex === -1) return { status: "error", error: "Baris tidak dijumpai: " + payload.id };

  sheet.deleteRow(rowIndex + 1); // rowIndex is 0-based into a values array whose [0] is the header row
  return { status: "ok" };
}

/**
 * Admin uploads a new image. Decodes a base64 data URL, saves it to a
 * dedicated Drive folder (created on first use), makes it publicly viewable,
 * and — if sheet/row/column are supplied — writes the resulting URL straight
 * into that cell (same target-lookup as handleUpdate).
 * payload: { dataUrl, filename, sheet?, row?, column? }
 */
function handleUploadImage(payload) {
  if (!payload.dataUrl || payload.dataUrl.indexOf("base64,") === -1) {
    return { status: "error", error: "Data imej tidak sah." };
  }

  const commaIndex = payload.dataUrl.indexOf(",");
  const meta = payload.dataUrl.substring(5, payload.dataUrl.indexOf(";")); // e.g. "image/png"
  const base64 = payload.dataUrl.substring(commaIndex + 1);
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, meta, payload.filename || "upload.png");

  const folder = getOrCreateUploadsFolder();
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // "uc?export=view" is unreliable for hotlinking as an <img src> (Google
  // frequently redirects it to an interstitial/viewer page instead of the
  // raw bytes). The "thumbnail" endpoint reliably serves actual image data
  // for anyone-with-link files, so use that instead — at a large enough
  // size that it still looks sharp as a big hero/cover image.
  const url = "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w1600";

  if (payload.sheet && payload.row && payload.column) {
    const sheet = getSheet(payload.sheet);
    if (sheet) {
      const headers = getHeaders(sheet);
      const colIndex = findColumnIndex(headers, payload.column);
      const rowIndex = findRowIndex(sheet, headers, payload.row);
      if (colIndex !== -1 && rowIndex !== -1) {
        sheet.getRange(rowIndex + 1, colIndex + 1).setValue(url);
      }
    }
  }

  return { status: "ok", url: url };
}

function getOrCreateUploadsFolder() {
  const folderName = "PSS Dashboard Uploads";
  const existing = DriveApp.getFoldersByName(folderName);
  if (existing.hasNext()) return existing.next();
  return DriveApp.createFolder(folderName);
}

// ============================================================================
// ONE-CLICK SETUP
// ============================================================================
// Run this once from the Apps Script editor (select "setupDashboardSheets"
// in the function dropdown, then click Run) to auto-create all 8 tabs with
// the correct headers and pre-fill them with sample data — the same sample
// data used by the frontend's demo mode, so the dashboard works immediately
// once you deploy. Safe to re-run: it skips any sheet that already exists.
// ============================================================================

function setupDashboardSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const sheetDefs = [
    {
      name: SHEET_NAMES.Announcements,
      headers: ["id", "title", "description", "image", "date"],
      rows: [
        [1, "Minggu Membaca 2026 Bermula 4 Ogos!", "Sertai program bacaan sekolah tahun ini dengan pelbagai hadiah menarik. Semua pelajar digalakkan menyertai aktiviti membaca sepanjang minggu tersebut di Pusat Sumber Sekolah.", "https://picsum.photos/seed/psshero/1600/700", "2026-08-04"],
        [2, "Pameran Buku Baharu", "Lebih 200 naskhah buku baharu kini tersedia di rak fiksyen dan sains popular.", "", "2026-07-20"],
        [3, "Bengkel Kemahiran Rujukan", "Bengkel untuk Tingkatan 1 mengenai cara menggunakan katalog digital PSS.", "", "2026-08-12"],
        [4, "Cuti Pertengahan Penggal", "PSS akan ditutup sepanjang cuti pertengahan penggal. Buku boleh dipulangkan selepas cuti tamat.", "", "2026-09-01"],
      ],
    },
    {
      name: SHEET_NAMES.Activities,
      headers: ["id", "img", "caption"],
      rows: [
        ["act1", "https://picsum.photos/seed/act1/400/300", "Bengkel Origami PSS"],
        ["act2", "https://picsum.photos/seed/act2/400/300", "Pertandingan Poster Membaca"],
        ["act3", "https://picsum.photos/seed/act3/400/300", "Sudut Bacaan Baharu"],
        ["act4", "https://picsum.photos/seed/act4/400/300", "Lawatan Perpustakaan Negeri"],
        ["act5", "https://picsum.photos/seed/act5/400/300", "Klinik Rujukan Ilmiah"],
        ["act6", "https://picsum.photos/seed/act6/400/300", "Hari Buku Sedunia"],
      ],
    },
    {
      name: SHEET_NAMES.Books,
      headers: ["id", "category", "title", "synopsis", "cover", "reserved"],
      rows: [
        ["b1", "Popular Minggu Ini", "Misteri Rumah Tua", "Sebuah kisah misteri yang membawa pembaca meneroka rahsia sebuah rumah lama di pinggir bandar.", "https://picsum.photos/seed/book1/300/450", 0],
        ["b2", "Popular Minggu Ini", "Lautan Bintang", "Petualangan angkasa lepas seorang kanak-kanak yang bermimpi menjadi angkasawan pertama negara.", "https://picsum.photos/seed/book2/300/450", 0],
        ["b3", "Popular Minggu Ini", "Warisan Nusantara", "Koleksi cerita rakyat dan legenda dari seluruh Nusantara yang sarat dengan nilai murni.", "https://picsum.photos/seed/book3/300/450", 0],
        ["b4", "Popular Minggu Ini", "Kod Rahsia", "Novel thriller remaja tentang sekumpulan pelajar yang memecahkan kod rahsia sekolah.", "https://picsum.photos/seed/book4/300/450", 0],
        ["b5", "Popular Minggu Ini", "Hutan Simpanan", "Kisah pengembaraan alam semula jadi yang mengajar tentang pemuliharaan hutan tropika.", "https://picsum.photos/seed/book5/300/450", 0],
        ["b6", "Popular Minggu Ini", "Impian Juara", "Kisah inspirasi seorang atlet muda yang berjuang mencapai impian menjadi juara kebangsaan.", "https://picsum.photos/seed/book6/300/450", 0],
        ["b7", "Sains & Teknologi", "Dunia Robotik", "Pengenalan mudah kepada dunia robotik dan kecerdasan buatan untuk pelajar sekolah menengah.", "https://picsum.photos/seed/book7/300/450", 0],
        ["b8", "Sains & Teknologi", "Angkasa & Kita", "Penjelajahan sistem suria dan fenomena angkasa lepas yang menakjubkan.", "https://picsum.photos/seed/book8/300/450", 0],
        ["b9", "Sains & Teknologi", "Kimia Harian", "Bagaimana kimia berperanan dalam kehidupan seharian kita, dari dapur hingga makmal.", "https://picsum.photos/seed/book9/300/450", 0],
        ["b10", "Sains & Teknologi", "Kod & Kreativiti", "Panduan asas pengaturcaraan untuk pelajar yang berminat dalam bidang teknologi.", "https://picsum.photos/seed/book10/300/450", 0],
        ["b11", "Sains & Teknologi", "Tenaga Masa Depan", "Penerokaan sumber tenaga boleh diperbaharui dan kepentingannya untuk generasi akan datang.", "https://picsum.photos/seed/book11/300/450", 0],
        ["b12", "Sastera Klasik", "Hikayat Melayu", "Antologi hikayat klasik Melayu yang menjadi warisan sastera negara.", "https://picsum.photos/seed/book12/300/450", 0],
        ["b13", "Sastera Klasik", "Puisi Tanah Air", "Kumpulan puisi patriotik yang membangkitkan semangat cinta akan tanah air.", "https://picsum.photos/seed/book13/300/450", 0],
        ["b14", "Sastera Klasik", "Bayang Kampung", "Novel klasik tentang kehidupan kampung dan nilai kekeluargaan yang erat.", "https://picsum.photos/seed/book14/300/450", 0],
        ["b15", "Sastera Klasik", "Suara Rimba", "Kisah rakyat yang membawa pembaca menyelami kearifan tempatan dan alam semula jadi.", "https://picsum.photos/seed/book15/300/450", 0],
      ],
    },
    {
      name: SHEET_NAMES.ELibrary,
      headers: ["id", "title", "type", "meta", "link"],
      rows: [
        ["e1", "Kertas Percubaan SPM Matematik 2025", "Kertas Peperiksaan", "PDF · 2.4 MB", "#"],
        ["e2", "Nota Ringkas Sejarah Tingkatan 5", "Nota", "PDF · 1.1 MB", "#"],
        ["e3", "Kertas Percubaan PT3 Sains", "Kertas Peperiksaan", "PDF · 1.8 MB", "#"],
        ["e4", "Portal e-Buku Teks KPM", "Pautan", "Pautan Luar", "#"],
        ["e5", "Nota Bahasa Melayu — Komsas", "Nota", "PDF · 900 KB", "#"],
        ["e6", "Kertas Percubaan Bahasa Inggeris", "Kertas Peperiksaan", "PDF · 2.0 MB", "#"],
        ["e7", "Perpustakaan Digital Negara", "Pautan", "Pautan Luar", "#"],
        ["e8", "Nota Fizik — Elektrik & Magnet", "Nota", "PDF · 1.4 MB", "#"],
      ],
    },
    {
      name: SHEET_NAMES.Leaderboard,
      headers: ["id", "name", "kelas", "score"],
      rows: [
        ["lb1", "Ahmad Danial", "5 Cemerlang", 128],
        ["lb2", "Nur Aisyah", "4 Bestari", 121],
        ["lb3", "Muhammad Haziq", "5 Amanah", 115],
        ["lb4", "Siti Sarah", "3 Gemilang", 98],
        ["lb5", "Lim Wei Jian", "4 Cemerlang", 92],
        ["lb6", "Nurul Iman", "5 Bestari", 87],
        ["lb7", "Kavitha Raj", "3 Amanah", 81],
        ["lb8", "Farid Iskandar", "2 Gemilang", 76],
        ["lb9", "Chong Mei Ling", "4 Amanah", 70],
        ["lb10", "Zulaikha Batrisyia", "1 Bestari", 64],
      ],
    },
    {
      name: SHEET_NAMES.Committee,
      headers: ["editKey", "tier", "name", "role", "avatar"],
      rows: [
        ["committee-1", 1, "Pn. Rohana Ahmad", "Guru Penasihat PSS", "https://i.pravatar.cc/150?img=45"],
        ["committee-2", 2, "En. Kamarul Zaman", "Naib Penasihat", "https://i.pravatar.cc/150?img=12"],
        ["committee-3", 2, "Pn. Siti Fatimah", "Setiausaha", "https://i.pravatar.cc/150?img=32"],
        ["committee-4", 3, "Amirul Hakim", "Ketua Pengawas PSS", "https://i.pravatar.cc/150?img=51"],
        ["committee-5", 3, "Nur Balqis", "Penolong Ketua", "https://i.pravatar.cc/150?img=47"],
        ["committee-6", 3, "Danish Iman", "Bendahari Pengawas", "https://i.pravatar.cc/150?img=33"],
        ["committee-7", 4, "10 Ahli Pengawas PSS", "Ahli Jawatankuasa", "https://i.pravatar.cc/150?img=5"],
      ],
    },
    {
      name: SHEET_NAMES.Events,
      headers: ["id", "day", "month", "title", "desc", "image", "rulesLink", "registerLink"],
      rows: [
        ["ev1", "04", "OGO", "Minggu Membaca 2026", "Aktiviti membaca sepanjang minggu dengan cabaran dan hadiah harian.", "https://picsum.photos/seed/event1/500/300", "", ""],
        ["ev2", "12", "OGO", "Bengkel Kemahiran Rujukan", "Wajib untuk Tingkatan 1. Sila daftar melalui borang di bawah.", "https://picsum.photos/seed/event2/500/300", "", ""],
        ["ev3", "20", "OGO", "Hari Sukan Membaca", "Aktiviti luar bilik darjah menggabungkan sukan dan cabaran bacaan.", "https://picsum.photos/seed/event3/500/300", "", ""],
        ["ev4", "02", "SEP", "Mesyuarat Agung PSS", "Mesyuarat tahunan jawatankuasa dan pelantikan pengawas baharu.", "https://picsum.photos/seed/event4/500/300", "", ""],
      ],
    },
    {
      name: SHEET_NAMES.Wishlist,
      headers: ["id", "name", "qty", "progress", "image", "donated"],
      rows: [
        ["w1", "Bean Bag Sudut Bacaan", "3 / 10 disumbang", 30, "https://picsum.photos/seed/wish1/400/300", false],
        ["w2", "Buku Ensiklopedia Sains", "5 / 20 disumbang", 25, "https://picsum.photos/seed/wish2/400/300", false],
        ["w3", "Rak Buku Mudah Alih", "1 / 4 disumbang", 25, "https://picsum.photos/seed/wish3/400/300", false],
        ["w4", "Set Novel Remaja Popular", "8 / 15 disumbang", 53, "https://picsum.photos/seed/wish4/400/300", false],
        ["w5", "Skrin Projektor PSS", "0 / 1 disumbang", 0, "https://picsum.photos/seed/wish5/400/300", false],
        ["w6", "Headphone Pembelajaran", "2 / 10 disumbang", 20, "https://picsum.photos/seed/wish6/400/300", false],
      ],
    },
  ];

  sheetDefs.forEach((def) => {
    let sheet = ss.getSheetByName(def.name);
    if (sheet) {
      Logger.log(`Langkau "${def.name}" — sheet sudah wujud.`);
      return;
    }
    sheet = ss.insertSheet(def.name);
    sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]).setFontWeight("bold");
    if (def.rows.length > 0) {
      sheet.getRange(2, 1, def.rows.length, def.headers.length).setValues(def.rows);
    }
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, def.headers.length);
    Logger.log(`Sheet "${def.name}" dicipta dengan ${def.rows.length} baris contoh.`);
  });

  // Remove Google Sheets' default blank "Sheet1" tab if it's still empty and unused.
  const defaultSheet = ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1 && defaultSheet.getLastRow() === 0) {
    ss.deleteSheet(defaultSheet);
  }

  Logger.log("Setup selesai! Semua tab dashboard telah dicipta dengan data contoh.");
  // Note: SpreadsheetApp.getUi() only works when run from inside the Sheets
  // UI (e.g. a custom menu), not when run directly from the Apps Script
  // editor — so we log instead of alert() to avoid an unnecessary error here.
}

// ============================================================================
// UPGRADE (for sheets created before "id"/rulesLink/registerLink existed)
// ============================================================================
// Run this once from the Apps Script editor if your sheet was set up using
// an older version of setupDashboardSheets(). It patches tabs in place:
//   - Activities  : adds an "id" column (backfilled act_1, act_2, ...)
//   - Leaderboard : adds an "id" column (backfilled lb_1, lb_2, ...)
//   - Events      : adds "rulesLink" and "registerLink" columns (left blank)
// Safe to re-run — every step first checks whether the column already
// exists before touching anything, and no existing data is modified.
// ============================================================================

function upgradeDashboardSheets() {
  addIdColumnIfMissing(SHEET_NAMES.Activities, "act");
  addIdColumnIfMissing(SHEET_NAMES.Leaderboard, "lb");
  addColumnsIfMissing(SHEET_NAMES.Events, ["rulesLink", "registerLink"]);
  Logger.log("Upgrade selesai.");
}

function addIdColumnIfMissing(sheetName, prefix) {
  const sheet = getSheet(sheetName);
  if (!sheet) return;

  const headers = getHeaders(sheet);
  if (headers.includes("id")) return;

  sheet.insertColumnBefore(1);
  sheet.getRange(1, 1).setValue("id").setFontWeight("bold");

  const lastRow = sheet.getLastRow();
  for (let r = 2; r <= lastRow; r++) {
    sheet.getRange(r, 1).setValue(prefix + "_" + (r - 1));
  }
  Logger.log(`"id" ditambah pada "${sheetName}".`);
}

function addColumnsIfMissing(sheetName, columnNames) {
  const sheet = getSheet(sheetName);
  if (!sheet) return;

  const headers = getHeaders(sheet);
  columnNames.forEach((col) => {
    if (headers.includes(col)) return;
    const nextCol = sheet.getLastColumn() + 1;
    sheet.getRange(1, nextCol).setValue(col).setFontWeight("bold");
    Logger.log(`"${col}" ditambah pada "${sheetName}".`);
  });
}

// ============================================================================
// SHEET HELPERS
// ============================================================================

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
}

function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
}

/** Converts a sheet's rows into an array of plain objects keyed by header. */
function readSheetAsObjects(sheetName) {
  const sheet = getSheet(sheetName);
  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];
  const rows = values.slice(1);

  return rows.map((row) => {
    const obj = {};
    headers.forEach((header, i) => (obj[header] = row[i]));
    return obj;
  });
}

/**
 * Case-insensitive column lookup — a column reference like "Title" or
 * "TITLE" will still correctly match a real header of "title". This is the
 * single source of truth for matching a column name to its index; every
 * handler above goes through this so a casing mismatch can never again
 * cause a silent "column not found" failure.
 */
function findColumnIndex(headers, columnName) {
  if (!columnName) return -1;
  const target = String(columnName).toLowerCase();
  for (let i = 0; i < headers.length; i++) {
    if (String(headers[i]).toLowerCase() === target) return i;
  }
  return -1;
}

/**
 * Locates the row index (0-based, excluding header) matching a given
 * identifier. Tries the "id" column first, then "editKey" (Committee),
 * falling back to treating rowKey as a direct 1-based row number.
 */
function findRowIndex(sheet, headers, rowKey) {
  const idCol = findColumnIndex(headers, "id");
  const editKeyCol = findColumnIndex(headers, "editKey");
  const data = sheet.getDataRange().getValues();

  for (let r = 1; r < data.length; r++) {
    if (idCol !== -1 && String(data[r][idCol]) === String(rowKey)) return r;
    if (editKeyCol !== -1 && String(data[r][editKeyCol]) === String(rowKey)) return r;
  }

  const asNumber = Number(rowKey);
  if (!isNaN(asNumber) && asNumber >= 1 && asNumber < data.length) return asNumber;

  return -1;
}

/** Groups the Books sheet by "category" for the Netflix-style carousel UI. */
function getBooksGrouped() {
  const rows = readSheetAsObjects(SHEET_NAMES.Books);
  const grouped = {};

  rows.forEach((row) => {
    const category = row.category || "Umum";
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push({
      id: row.id,
      title: row.title,
      synopsis: row.synopsis,
      cover: row.cover,
    });
  });

  return Object.keys(grouped).map((category) => ({
    category,
    items: grouped[category],
  }));
}

/** Wraps a JS object as a JSON Apps Script TextOutput response. */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
