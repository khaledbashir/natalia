"use client";
import React from "react";

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      <div className="relative max-w-lg w-full bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 mx-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{title || "Confirm"}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{message || "Are you sure?"}</p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
