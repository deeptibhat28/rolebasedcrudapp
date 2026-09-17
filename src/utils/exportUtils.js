import XlsxPopulate from "xlsx-populate";

// ---------- Password policy ----------
// at least 8 characters, one uppercase, one lowercase, one number, one symbol.
export function validateExportPassword(password, confirmPassword) {
  if (!password) {
    return { valid: false, message: "Password is required." };
  }
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Include at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Include at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Include at least one number." };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: "Include at least one symbol." };
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { valid: false, message: "Passwords do not match." };
  }
  return { valid: true, message: "" };
}

// Cryptographically random password that always satisfies the policy above.
export function generateSecurePassword(length = 14) {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const numbers = "23456789";
  const symbols = "!@#$%^&*-_=+";
  const all = upper + lower + numbers + symbols;

  const randomIndex = (max) => {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] % max;
  };

  const required = [
    upper[randomIndex(upper.length)],
    lower[randomIndex(lower.length)],
    numbers[randomIndex(numbers.length)],
    symbols[randomIndex(symbols.length)],
  ];

  const remainingLength = Math.max(length - required.length, 4);
  const rest = Array.from({ length: remainingLength }, () => all[randomIndex(all.length)]);

  const combined = [...required, ...rest];
  // Shuffle so the required characters aren't always in the same position.
  for (let i = combined.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join("");
}

// ---------- Filename helper ----------
export function buildExportFilename(baseName, extension) {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(
    now.getHours()
  )}-${pad(now.getMinutes())}`;
  return `${baseName}_${stamp}.${extension}`;
}

// ---------- Download helper (no password ever touches this) ----------
function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------- CSV export ----------
// columns: [{ key: "fullName", label: "Full Name" }, ...]
// rows: array of plain objects
function csvEscape(value) {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportToCsv({ columns, rows, baseName }) {
  const header = columns.map((col) => csvEscape(col.label)).join(",");
  const lines = rows.map((row) =>
    columns.map((col) => csvEscape(row[col.key])).join(",")
  );
  const csvContent = [header, ...lines].join("\r\n");

  // BOM so Excel opens UTF-8 CSVs correctly instead of mangling special characters.
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const filename = buildExportFilename(baseName, "csv");
  triggerBlobDownload(blob, filename);
  return filename;
}

// ---------- Excel export (password-protected) ----------
// columns: [{ key: "fullName", label: "Full Name" }, ...]
// rows: array of plain objects
// password: required string, used only in-memory here — never logged, never in the filename.
export async function exportToXlsx({ columns, rows, baseName, sheetName = "Data", password }) {
  const workbook = await XlsxPopulate.fromBlankAsync();
  const sheet = workbook.sheet(0);
  sheet.name(sheetName.slice(0, 31)); // Excel sheet name limit

  // Header row
  columns.forEach((col, colIndex) => {
    const cell = sheet.cell(1, colIndex + 1);
    cell.value(col.label);
    cell.style({ bold: true, fill: "DCE6F1", horizontalAlignment: "center" });
  });

  // Data rows
  rows.forEach((row, rowIndex) => {
    columns.forEach((col, colIndex) => {
      const value = row[col.key];
      sheet.cell(rowIndex + 2, colIndex + 1).value(
        value === null || value === undefined ? "" : value
      );
    });
  });

  // Basic column widths so it doesn't look cramped on open
  columns.forEach((col, colIndex) => {
    const headerLen = (col.label || "").length;
    const maxDataLen = rows.reduce((max, row) => {
      const len = row[col.key] ? String(row[col.key]).length : 0;
      return Math.max(max, len);
    }, headerLen);
    sheet.column(colIndex + 1).width(Math.min(Math.max(maxDataLen + 2, 10), 40));
  });

  sheet.row(1).freeze?.(); // no-op if unsupported by this build; header stays visible if supported

  const blob = await workbook.outputAsync({ password, type: "blob" });
  const filename = buildExportFilename(baseName, "xlsx");
  triggerBlobDownload(blob, filename);
  return filename;
}