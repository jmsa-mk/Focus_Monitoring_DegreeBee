import { useEffect, useState } from "react";

/**
 * Utility: pick FontAwesome icon class for a filename by extension.
 */
export function fileIconClass(name) {
    const ext = (name || "").split(".").pop().toLowerCase();
    if (ext === "pdf") return "fa-solid fa-file-pdf text-red-500";
    if (["doc", "docx"].includes(ext)) return "fa-solid fa-file-word text-blue-500";
    if (["xls", "xlsx", "csv"].includes(ext)) return "fa-solid fa-file-excel text-green-500";
    if (["ppt", "pptx"].includes(ext)) return "fa-solid fa-file-powerpoint text-orange-500";
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "fa-solid fa-file-image text-purple-500";
    if (["zip", "rar", "7z"].includes(ext)) return "fa-solid fa-file-zipper text-yellow-500";
    if (ext === "txt") return "fa-solid fa-file-lines text-gray-500";
    return "fa-solid fa-file text-gray-500";
}

/**
 * Utility: format byte count to human-readable string.
 */
export function formatBytes(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * FilePreviewModal: full-screen preview dialog for a stored file.
 *
 * Renders inline preview when possible:
 *   image    : <img>
 *   pdf      : <iframe>
 *   txt/csv  : fetched plain text in <pre>
 *   other    : fallback message + download CTA
 *
 * ESC and click-outside close. Header has Download button + close.
 */
export default function FilePreviewModal({ url, name, size, onClose }) {
    const ext = (name || "").split(".").pop().toLowerCase();
    const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
    const isPdf = ext === "pdf";
    const isText = ["txt", "csv"].includes(ext);

    const [textContent, setTextContent] = useState(null);
    const [textError, setTextError] = useState(false);

    useEffect(() => {
        if (!isText) return;
        let cancelled = false;
        fetch(url)
            .then((r) => {
                if (!r.ok) throw new Error("Failed");
                return r.text();
            })
            .then((t) => {
                if (!cancelled) setTextContent(t);
            })
            .catch(() => {
                if (!cancelled) setTextError(true);
            });
        return () => {
            cancelled = true;
        };
    }, [url, isText]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl
                    w-full max-w-5xl max-h-[90vh] flex flex-col
                    border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 min-w-0">
                        <i className={`${fileIconClass(name)} text-2xl flex-shrink-0`}></i>
                        <div className="min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-white truncate">
                                {name}
                            </div>
                            {size > 0 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatBytes(size)}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                            href={url}
                            download={name}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                                bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                dark:from-[#213A58] dark:to-[#172D9D]
                                text-white text-sm font-semibold shadow hover:opacity-90 transition"
                        >
                            <i className="fa-solid fa-download"></i>
                            Download
                        </a>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-lg flex items-center justify-center
                                text-gray-600 dark:text-gray-300
                                hover:bg-gray-100 dark:hover:bg-gray-800"
                            title="Close"
                        >
                            <i className="fa-solid fa-xmark text-lg"></i>
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
                    {isImage && (
                        <div className="p-4 flex items-center justify-center min-h-full">
                            <img
                                src={url}
                                alt={name}
                                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow"
                            />
                        </div>
                    )}

                    {isPdf && (
                        <iframe
                            src={url}
                            title={name}
                            className="w-full h-[75vh] border-0"
                        />
                    )}

                    {isText && (
                        <div className="p-6">
                            {textError ? (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                                    <i className="fa-solid fa-triangle-exclamation text-4xl mb-3"></i>
                                    <p>Gagal memuat preview file.</p>
                                </div>
                            ) : textContent === null ? (
                                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                                    <i className="fa-solid fa-spinner fa-spin text-3xl mb-3"></i>
                                    <p>Loading preview...</p>
                                </div>
                            ) : (
                                <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono whitespace-pre-wrap break-words bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                                    {textContent}
                                </pre>
                            )}
                        </div>
                    )}

                    {!isImage && !isPdf && !isText && (
                        <div className="flex flex-col items-center justify-center text-center py-16 px-6">
                            <i className={`${fileIconClass(name)} text-7xl mb-4`}></i>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                Preview tidak tersedia
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md">
                                Format <span className="font-mono uppercase">.{ext}</span> tidak dapat di-preview di browser.
                                Silakan download file untuk membukanya.
                            </p>
                            <a
                                href={url}
                                download={name}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                                    bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                    dark:from-[#213A58] dark:to-[#172D9D]
                                    text-white font-semibold shadow-md hover:opacity-90 transition"
                            >
                                <i className="fa-solid fa-download"></i>
                                Download {name}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
