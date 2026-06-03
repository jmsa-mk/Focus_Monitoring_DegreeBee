import { useState } from "react";
import { router } from "@inertiajs/react";
import toast from "react-hot-toast";

const REASONS = [
    { value: "inappropriate", label: "Konten tidak pantas", icon: "fa-ban" },
    { value: "spam", label: "Spam atau menyesatkan", icon: "fa-envelope-open-text" },
    { value: "copyright", label: "Pelanggaran hak cipta", icon: "fa-copyright" },
    { value: "harassment", label: "Pelecehan / ujaran kebencian", icon: "fa-hand-fist" },
    { value: "other", label: "Lainnya", icon: "fa-circle-question" },
];

/**
 * Reusable "Report to admin" modal.
 *
 * Props:
 *  - type: "video" | "class"
 *  - id:   numeric id of the reported item
 *  - title: name of the reported item (shown in header)
 *  - onClose: () => void
 */
export default function ReportModal({ type, id, title, onClose }) {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        if (!reason) return;
        setSubmitting(true);
        router.post(
            "/reports",
            { type, id, reason, description },
            {
                preserveScroll: true,
                onFinish: () => setSubmitting(false),
                onSuccess: (page) => {
                    const msg = page?.props?.flash?.success;
                    if (msg) toast.success(msg);
                    onClose?.();
                },
                onError: (errors) => {
                    const first = Object.values(errors || {})[0];
                    if (first) toast.error(first);
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md
                border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                        <i className="fa-solid fa-flag text-red-500"></i>
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-bold text-gray-900 dark:text-white">Laporkan ke Admin</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {type === "video" ? "Video" : "Kelas"}: {title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-auto w-8 h-8 rounded-lg flex items-center justify-center text-gray-400
                            hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <form onSubmit={submit} className="px-6 py-5">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Alasan laporan
                    </label>
                    <div className="space-y-2 mb-4">
                        {REASONS.map((r) => (
                            <label
                                key={r.value}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition
                                    ${
                                        reason === r.value
                                            ? "border-[#01A9F2] bg-[#01A9F2]/10 text-[#01A9F2]"
                                            : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="reason"
                                    value={r.value}
                                    checked={reason === r.value}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="hidden"
                                />
                                <i className={`fa-solid ${r.icon} w-5 text-center`}></i>
                                <span className="text-sm font-medium">{r.label}</span>
                                {reason === r.value && <i className="fa-solid fa-check ml-auto"></i>}
                            </label>
                        ))}
                    </div>

                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                        Detail tambahan <span className="font-normal text-gray-400">(opsional)</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        maxLength={1000}
                        placeholder="Jelaskan kenapa konten ini mencurigakan..."
                        className="w-full px-3 py-2 rounded-xl text-sm resize-none
                            bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
                            text-gray-800 dark:text-gray-100 placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                    />

                    <div className="flex gap-3 mt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600
                                text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={!reason || submitting}
                            className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold
                                hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed
                                inline-flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <i className="fa-solid fa-spinner fa-spin"></i>
                            ) : (
                                <i className="fa-solid fa-paper-plane"></i>
                            )}
                            Kirim Laporan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
