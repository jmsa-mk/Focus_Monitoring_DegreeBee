import { router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import FilePreviewModal, { fileIconClass, formatBytes } from "./FilePreviewModal";

function formatRelative(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
}

export default function QuestionBankSection({ files = [], classId, currentUserId }) {
    const [showUploader, setShowUploader] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [editingFile, setEditingFile] = useState(null);

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white inline-flex items-center gap-3">
                        <i className="fa-solid fa-folder-open text-[#01A9F2]"></i>
                        Question Bank
                        <span className="text-base font-normal text-gray-500 dark:text-gray-400">
                            ({files.length})
                        </span>
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Bank materi belajar: dokumen, gambar, presentasi, dan lainnya.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowUploader(true)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold
                        bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                        dark:from-[#213A58] dark:to-[#172D9D]
                        text-white shadow-md hover:opacity-90 transition
                        inline-flex items-center gap-2"
                >
                    <i className="fa-solid fa-cloud-arrow-up"></i>
                    Upload File
                </button>
            </div>

            {files.length === 0 ? (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    <i className="fa-solid fa-folder-open text-7xl mb-4 text-gray-300 dark:text-gray-600"></i>
                    <p className="text-lg font-medium">Belum ada file</p>
                    <p className="text-sm mt-1">Upload materi pertama untuk berbagi dengan kelas.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {files.map((f) => (
                        <FileCard
                            key={f.id}
                            file={f}
                            currentUserId={currentUserId}
                            onPreview={() => setPreviewFile(f)}
                            onEdit={() => setEditingFile(f)}
                        />
                    ))}
                </div>
            )}

            {showUploader && (
                <UploadModal
                    classId={classId}
                    onClose={() => setShowUploader(false)}
                />
            )}

            {editingFile && (
                <EditModal
                    file={editingFile}
                    onClose={() => setEditingFile(null)}
                />
            )}

            {previewFile && (
                <FilePreviewModal
                    url={previewFile.file_url}
                    name={previewFile.file_name}
                    size={previewFile.file_size}
                    onClose={() => setPreviewFile(null)}
                />
            )}
        </div>
    );
}

function FileCard({ file, currentUserId, onPreview, onEdit }) {
    const [confirmDelete, setConfirmDelete] = useState(false);
    const isOwner = file.user_id === currentUserId;
    const displayName = file.title || file.file_name;

    const handleDelete = () => {
        router.delete(`/question-bank/${file.id}`, {
            preserveScroll: true,
            preserveState: true,
            only: ["questionBankFiles"],
            onSuccess: () => setConfirmDelete(false),
        });
    };

    const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(
        (file.file_name || "").split(".").pop().toLowerCase()
    );

    return (
        <>
            <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700
                hover:shadow-lg hover:border-[#01A9F2] dark:hover:border-[#01A9F2]
                transition cursor-pointer overflow-hidden">

                <button
                    type="button"
                    onClick={onPreview}
                    className="block w-full aspect-square bg-gray-50 dark:bg-gray-900
                        flex items-center justify-center relative"
                >
                    {isImage ? (
                        <img
                            src={file.file_url}
                            alt={file.file_name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <i className={`${fileIconClass(file.file_name)} text-6xl`}></i>
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition
                        flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="bg-white/95 dark:bg-gray-900/95 px-3 py-1.5 rounded-lg text-xs font-semibold
                            text-gray-900 dark:text-white inline-flex items-center gap-1.5">
                            <i className="fa-solid fa-eye"></i>
                            Preview
                        </div>
                    </div>
                </button>

                <div className="p-3">
                    <div className="font-semibold text-sm text-gray-900 dark:text-white truncate" title={displayName}>
                        {displayName}
                    </div>
                    {file.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                            {file.description}
                        </div>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 inline-flex items-center gap-1.5">
                        {file.user?.avatar_url ? (
                            <img
                                src={file.user.avatar_url}
                                alt={file.user.name}
                                className="w-4 h-4 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-[8px] font-bold">
                                {(file.user?.name || "?").charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="truncate">{file.user?.name || "Anonymous"}</span>
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex items-center gap-1.5">
                        <span>{formatBytes(file.file_size)}</span>
                        <span><i className="fa-solid fa-circle text-[2px] align-middle"></i></span>
                        <span>{formatRelative(file.created_at)}</span>
                    </div>
                </div>

                {isOwner && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="w-8 h-8 rounded-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur
                                text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800
                                shadow flex items-center justify-center"
                            title="Edit"
                        >
                            <i className="fa-solid fa-pen text-xs"></i>
                        </button>
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                            className="w-8 h-8 rounded-lg bg-red-500/95 backdrop-blur
                                text-white hover:bg-red-600 shadow flex items-center justify-center"
                            title="Delete"
                        >
                            <i className="fa-solid fa-trash text-xs"></i>
                        </button>
                    </div>
                )}
            </div>

            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-[90%] max-w-sm
                        border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                            Delete file?
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            File "{displayName}" akan dihapus permanen.
                        </p>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(false)}
                                className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                    text-gray-700 dark:text-gray-200
                                    hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

function UploadModal({ classId, onClose }) {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const fileInputRef = useRef(null);
    const errors = usePage().props.errors || {};

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && !uploading) onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, uploading]);

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        if (f.size > 20 * 1024 * 1024) {
            alert("File must be smaller than 20 MB.");
            e.target.value = "";
            return;
        }
        setFile(f);
        // Auto-fill title from filename if empty
        if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
    };

    const handleSubmit = () => {
        if (uploading || !file) return;
        setUploading(true);
        setProgress(0);
        router.post(
            `/classes/${classId}/question-bank`,
            { file, title, description },
            {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                only: ["questionBankFiles"],
                onProgress: (event) => {
                    if (event && typeof event.percentage === "number") {
                        setProgress(event.percentage);
                    }
                },
                onSuccess: () => onClose(),
                onFinish: () => {
                    setUploading(false);
                    setProgress(0);
                },
            }
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => !uploading && onClose()}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md
                    border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white inline-flex items-center gap-2">
                            <i className="fa-solid fa-cloud-arrow-up text-[#01A9F2]"></i>
                            Upload File
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="w-8 h-8 rounded-md flex items-center justify-center
                                text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800
                                disabled:opacity-40"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.gif,.zip,.txt,.csv"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {!file ? (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full aspect-video rounded-2xl
                                border-2 border-dashed border-gray-300 dark:border-gray-600
                                hover:border-[#01A9F2] dark:hover:border-[#01A9F2]
                                flex flex-col items-center justify-center gap-2
                                text-gray-500 dark:text-gray-400 hover:text-[#01A9F2]
                                transition bg-gray-50/50 dark:bg-gray-800/30"
                        >
                            <i className="fa-solid fa-cloud-arrow-up text-4xl"></i>
                            <span className="font-semibold">Click to select file</span>
                            <span className="text-xs">PDF, DOC, XLS, PPT, image, ZIP. Max 20 MB.</span>
                        </button>
                    ) : (
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <i className={`${fileIconClass(file.name)} text-3xl flex-shrink-0`}></i>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                        {file.name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatBytes(file.size)}
                                    </div>
                                </div>
                                {!uploading && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFile(null);
                                            if (fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                        className="text-red-500 hover:text-red-600 p-1"
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                )}
                            </div>
                            {uploading && (
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-semibold text-gray-700 dark:text-gray-200">Uploading...</span>
                                        <span className="font-bold text-[#01A9F2]">{progress}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-linear-to-r from-[#00E2E0] to-[#797CFF] transition-all"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {errors.file && (
                        <p className="text-red-500 text-xs mt-2">{errors.file}</p>
                    )}

                    <div className="mt-4 space-y-3">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title (optional)"
                            readOnly={uploading}
                            className="w-full px-4 py-2.5 rounded-lg border text-sm
                                bg-white text-gray-900 placeholder-gray-400
                                dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description (optional)"
                            rows={2}
                            readOnly={uploading}
                            className="w-full px-4 py-2.5 rounded-lg border text-sm resize-none
                                bg-white text-gray-900 placeholder-gray-400
                                dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={uploading}
                            className="px-4 py-2 rounded-lg text-sm font-semibold
                                text-gray-700 dark:text-gray-200
                                hover:bg-gray-100 dark:hover:bg-gray-800
                                disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={uploading || !file}
                            className="px-5 py-2 rounded-lg text-sm font-semibold
                                bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                dark:from-[#213A58] dark:to-[#172D9D]
                                text-white shadow hover:opacity-90
                                disabled:opacity-40 disabled:cursor-not-allowed
                                inline-flex items-center gap-2 min-w-[100px] justify-center"
                        >
                            {uploading ? (
                                <><i className="fa-solid fa-spinner fa-spin"></i>{progress}%</>
                            ) : (
                                <><i className="fa-solid fa-upload"></i>Upload</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function EditModal({ file, onClose }) {
    const [title, setTitle] = useState(file.title || "");
    const [description, setDescription] = useState(file.description || "");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && !saving) onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, saving]);

    const handleSubmit = () => {
        if (saving) return;
        setSaving(true);
        router.put(
            `/question-bank/${file.id}`,
            { title, description },
            {
                preserveScroll: true,
                preserveState: true,
                only: ["questionBankFiles"],
                onSuccess: () => onClose(),
                onFinish: () => setSaving(false),
            }
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => !saving && onClose()}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md
                    border border-gray-200 dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            Edit File Info
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="w-8 h-8 rounded-md flex items-center justify-center
                                text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800
                                disabled:opacity-40"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border border-gray-200 dark:border-gray-700 mb-4
                        inline-flex items-center gap-3 w-full">
                        <i className={`${fileIconClass(file.file_name)} text-2xl flex-shrink-0`}></i>
                        <div className="min-w-0">
                            <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                {file.file_name}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatBytes(file.file_size)}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Title"
                            readOnly={saving}
                            className="w-full px-4 py-2.5 rounded-lg border text-sm
                                bg-white text-gray-900 placeholder-gray-400
                                dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                        />
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            rows={3}
                            readOnly={saving}
                            className="w-full px-4 py-2.5 rounded-lg border text-sm resize-none
                                bg-white text-gray-900 placeholder-gray-400
                                dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500
                                focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                        />
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                        Untuk ganti file, hapus dulu lalu upload baru.
                    </p>

                    <div className="flex justify-end gap-2 mt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={saving}
                            className="px-4 py-2 rounded-lg text-sm font-semibold
                                text-gray-700 dark:text-gray-200
                                hover:bg-gray-100 dark:hover:bg-gray-800
                                disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={saving}
                            className="px-5 py-2 rounded-lg text-sm font-semibold
                                bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                dark:from-[#213A58] dark:to-[#172D9D]
                                text-white shadow hover:opacity-90
                                disabled:opacity-40 disabled:cursor-not-allowed
                                inline-flex items-center gap-2"
                        >
                            {saving ? (
                                <><i className="fa-solid fa-spinner fa-spin"></i>Saving...</>
                            ) : (
                                <><i className="fa-solid fa-check"></i>Save</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
