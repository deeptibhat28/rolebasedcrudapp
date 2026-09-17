import React, { useState } from "react";
import ReactDOM from "react-dom";
import { toast } from "react-toastify";
import {
  exportToCsv,
  exportToXlsx,
  generateSecurePassword,
  validateExportPassword,
} from "../utils/exportUtils";

export default function ExportModal({
  isOpen,
  onClose,
  columns,
  rows,
  baseName,
  sheetName = "Data",
}) {
  const [format, setFormat] = useState("csv"); // "csv" | "xlsx"
  const [passwordMode, setPasswordMode] = useState("auto"); // "auto" | "custom"
  const [customPassword, setCustomPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [completedPassword, setCompletedPassword] = useState(null); 
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setFormat("csv");
    setPasswordMode("auto");
    setCustomPassword("");
    setConfirmPassword("");
    setShowPasswords(false);
    setFieldError("");
    setIsExporting(false);
    setCompletedPassword(null);
    setCopied(false);
    onClose();
  };

  const handleCopyPassword = async () => {
    if (!completedPassword) return;
    try {
      await navigator.clipboard.writeText(completedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail in insecure contexts; the password is still visible to select/copy manually.
    }
  };

  const handleExport = async () => {
    if (!rows || rows.length === 0) {
      setFieldError("There is no data to export for the current filters.");
      return;
    }

    setFieldError("");

    if (format === "csv") {
      setIsExporting(true);
      try {
        exportToCsv({ columns, rows, baseName });
        toast.success("CSV exported successfully.");
        resetAndClose();
      } catch (err) {
        toast.error("Failed to export CSV.");
      } finally {
        setIsExporting(false);
      }
      return;
    }

    // xlsx
    let passwordToUse = "";
    if (passwordMode === "auto") {
      passwordToUse = generateSecurePassword();
    } else {
      const result = validateExportPassword(customPassword, confirmPassword);
      if (!result.valid) {
        setFieldError(result.message);
        return;
      }
      passwordToUse = customPassword;
    }

    setIsExporting(true);
    try {
      await exportToXlsx({
        columns,
        rows,
        baseName,
        sheetName,
        password: passwordToUse,
      });
      toast.success("Excel file exported successfully.");
      if (passwordMode === "auto") {
        // Only shown in-memory in the UI; never logged, never in a toast, never in the filename.
        setCompletedPassword(passwordToUse);
      } else {
        resetAndClose();
      }
    } catch (err) {
      toast.error("Failed to export Excel file.");
    } finally {
      setIsExporting(false);
    }
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 px-4"
      onClick={resetAndClose}
    >
      <div
        className="bg-white dark:bg-[#2e1048] p-6 rounded-3xl shadow-2xl max-w-md w-full border border-blue-200 dark:border-purple-500/40 text-gray-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {completedPassword ? (
          <>
            <h3 className="text-lg font-extrabold mb-2">Your file is ready</h3>
            <p className="text-xs text-gray-500 dark:text-purple-300/80 mb-4">
              Use this password to open the Excel file. It will not be shown again —
              copy it now and store it somewhere safe.
            </p>
            <div className="flex items-center gap-2 mb-4">
              <input
                type={showPasswords ? "text" : "password"}
                readOnly
                value={completedPassword}
                className="flex-1 px-3 py-2 bg-blue-50 dark:bg-[#1b082d]/70 border border-blue-200 dark:border-purple-500/40 rounded-xl text-sm font-mono"
              />
              <button
                onClick={() => setShowPasswords((v) => !v)}
                className="px-3 py-2 bg-blue-50 dark:bg-[#1b082d]/70 border border-blue-200 dark:border-purple-500/40 rounded-xl text-xs font-bold"
              >
                {showPasswords ? "Hide" : "Show"}
              </button>
              <button
                onClick={handleCopyPassword}
                className="px-3 py-2 bg-linear-to-r from-orange-500 to-pink-600 text-white rounded-xl text-xs font-bold"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={resetAndClose}
                className="px-4 py-2 bg-blue-50 dark:bg-[#1b082d]/70 border border-blue-200 dark:border-purple-500/40 rounded-xl text-xs font-bold"
              >
                Done
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-lg font-extrabold mb-1">Export Data</h3>
            <p className="text-xs text-gray-500 dark:text-purple-300/80 mb-4">
              Exports the {rows.length} row{rows.length === 1 ? "" : "s"} currently matching
              your filters.
            </p>

            <p className="text-xs font-bold uppercase tracking-wide text-blue-600/70 dark:text-purple-300 mb-2">
              Format
            </p>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setFormat("csv")}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  format === "csv"
                    ? "bg-linear-to-r from-orange-500 to-pink-600 text-white border-transparent"
                    : "bg-blue-50 dark:bg-[#1b082d]/70 border-blue-200 dark:border-purple-500/40"
                }`}
              >
                CSV
              </button>
              <button
                onClick={() => setFormat("xlsx")}
                className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                  format === "xlsx"
                    ? "bg-linear-to-r from-orange-500 to-pink-600 text-white border-transparent"
                    : "bg-blue-50 dark:bg-[#1b082d]/70 border-blue-200 dark:border-purple-500/40"
                }`}
              >
                Excel (.xlsx)
              </button>
            </div>

            {format === "xlsx" && (
              <>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600/70 dark:text-purple-300 mb-2">
                  Password protection
                </p>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => {
                      setPasswordMode("auto");
                      setFieldError("");
                    }}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                      passwordMode === "auto"
                        ? "bg-blue-600 text-white border-transparent dark:bg-purple-600"
                        : "bg-blue-50 dark:bg-[#1b082d]/70 border-blue-200 dark:border-purple-500/40"
                    }`}
                  >
                    Auto-generate
                  </button>
                  <button
                    onClick={() => {
                      setPasswordMode("custom");
                      setFieldError("");
                    }}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-bold border transition ${
                      passwordMode === "custom"
                        ? "bg-blue-600 text-white border-transparent dark:bg-purple-600"
                        : "bg-blue-50 dark:bg-[#1b082d]/70 border-blue-200 dark:border-purple-500/40"
                    }`}
                  >
                    Set my own
                  </button>
                </div>

                {passwordMode === "custom" && (
                  <div className="space-y-2 mb-3">
                    <input
                      type={showPasswords ? "text" : "password"}
                      placeholder="Password"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-blue-50 dark:bg-[#1b082d]/70 border border-blue-200 dark:border-purple-500/40 rounded-xl text-sm"
                    />
                    <input
                      type={showPasswords ? "text" : "password"}
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-blue-50 dark:bg-[#1b082d]/70 border border-blue-200 dark:border-purple-500/40 rounded-xl text-sm"
                    />
                    <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-purple-300/80">
                      <input
                        type="checkbox"
                        checked={showPasswords}
                        onChange={(e) => setShowPasswords(e.target.checked)}
                      />
                      Show passwords
                    </label>
                    <p className="text-[11px] text-gray-400 dark:text-purple-400/70">
                      Min 8 characters, with uppercase, lowercase, a number, and a symbol.
                    </p>
                  </div>
                )}
              </>
            )}

            {fieldError && (
              <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-3">
                {fieldError}
              </p>
            )}

            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={resetAndClose}
                className="px-4 py-2 bg-blue-50 dark:bg-[#1b082d]/70 border border-blue-200 dark:border-purple-500/40 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="px-4 py-2 bg-linear-to-r from-orange-500 to-pink-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {isExporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}