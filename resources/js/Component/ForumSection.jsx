import { router, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

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

function formatBytes(bytes) {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(name) {
    const ext = (name || "").split(".").pop().toLowerCase();
    if (["pdf"].includes(ext)) return "fa-solid fa-file-pdf text-red-500";
    if (["doc", "docx"].includes(ext)) return "fa-solid fa-file-word text-blue-500";
    if (["xls", "xlsx", "csv"].includes(ext)) return "fa-solid fa-file-excel text-green-500";
    if (["ppt", "pptx"].includes(ext)) return "fa-solid fa-file-powerpoint text-orange-500";
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "fa-solid fa-file-image text-purple-500";
    if (["zip", "rar", "7z"].includes(ext)) return "fa-solid fa-file-zipper text-yellow-500";
    if (["txt"].includes(ext)) return "fa-solid fa-file-lines text-gray-500";
    return "fa-solid fa-file text-gray-500";
}

function FileAttachmentChip({ url, name, size }) {
    const [showPreview, setShowPreview] = useState(false);

    if (!url) return null;

    return (
        <>
            <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="inline-flex items-center gap-3 mt-3 px-4 py-3 rounded-xl
                    border border-gray-200 dark:border-gray-700
                    bg-gray-50 dark:bg-gray-800
                    hover:bg-gray-100 dark:hover:bg-gray-700 transition
                    max-w-md text-left cursor-pointer"
            >
                <i className={`${fileIcon(name)} text-2xl`}></i>
                <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {name}
                    </div>
                    {size > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatBytes(size)}
                            <span className="mx-1.5"><i className="fa-solid fa-circle text-[3px] align-middle"></i></span>
                            Click to preview
                        </div>
                    )}
                </div>
                <i className="fa-solid fa-eye text-gray-400 dark:text-gray-500"></i>
            </button>

            {showPreview && (
                <FilePreviewModal
                    url={url}
                    name={name}
                    size={size}
                    onClose={() => setShowPreview(false)}
                />
            )}
        </>
    );
}

function FilePreviewModal({ url, name, size, onClose }) {
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
                        <i className={`${fileIcon(name)} text-2xl flex-shrink-0`}></i>
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
                            <i className={`${fileIcon(name)} text-7xl mb-4`}></i>
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

function countAll(posts) {
    let n = 0;
    for (const p of posts) {
        n += 1 + (p.replies?.length || 0);
    }
    return n;
}

export default function ForumSection({ posts = [], classId, currentUserId }) {
    const [newBody, setNewBody] = useState("");
    const [newFile, setNewFile] = useState(null);
    const [posting, setPosting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = useRef(null);
    const errors = usePage().props.errors || {};

    const total = countAll(posts);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            alert("File must be smaller than 10 MB.");
            e.target.value = "";
            return;
        }
        setNewFile(file);
    };

    const handlePost = () => {
        if (posting) return; // guard against double-submit
        const body = newBody.trim();
        if (!body) return;
        setPosting(true);
        setUploadProgress(0);
        router.post(
            `/classes/${classId}/forum`,
            { body, file: newFile },
            {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                only: ["forumPosts"],
                onProgress: (event) => {
                    if (event && typeof event.percentage === "number") {
                        setUploadProgress(event.percentage);
                    }
                },
                onSuccess: () => {
                    setNewBody("");
                    setNewFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                },
                onFinish: () => {
                    setPosting(false);
                    setUploadProgress(0);
                },
            }
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white inline-flex items-center gap-3">
                <i className="fa-solid fa-comments text-[#01A9F2]"></i>
                Forum
                <span className="text-base font-normal text-gray-500 dark:text-gray-400">
                    ({total})
                </span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Diskusi dan berbagi materi dengan anggota kelas
            </p>

            {/* Composer */}
            <div className={`mb-8 p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm
                ${posting ? "opacity-95 pointer-events-none" : ""}`}>
                <textarea
                    value={newBody}
                    onChange={(e) => setNewBody(e.target.value)}
                    placeholder="Mulai diskusi atau bagikan materi..."
                    rows={3}
                    readOnly={posting}
                    className={`w-full px-4 py-3 rounded-xl border resize-none
                        bg-white text-gray-900 placeholder-gray-400
                        dark:bg-gray-900 dark:border-gray-700 dark:text-white dark:placeholder-gray-400
                        focus:outline-none focus:ring-2 focus:ring-[#01A9F2]
                        ${posting ? "opacity-60" : ""}`}
                />

                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.zip,.txt,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                />

                {newFile && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg
                        bg-[#BAFFFE]/30 dark:bg-[#172D9D]/20
                        border border-[#01A9F2]/40">
                        <i className={`${fileIcon(newFile.name)} text-lg`}></i>
                        <span className="text-sm text-gray-700 dark:text-gray-200 truncate max-w-xs">
                            {newFile.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({formatBytes(newFile.size)})
                        </span>
                        {!posting && (
                            <button
                                type="button"
                                onClick={() => {
                                    setNewFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="ml-1 text-red-500 hover:text-red-600"
                                title="Remove file"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        )}
                    </div>
                )}

                {/* Validation errors */}
                {(errors.file || errors.body) && !posting && (
                    <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700">
                        <div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300">
                            <i className="fa-solid fa-triangle-exclamation mt-0.5"></i>
                            <div>
                                {errors.file && <div>{errors.file}</div>}
                                {errors.body && <div>{errors.body}</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload progress bar */}
                {posting && newFile && (
                    <div className="mt-4 p-3 rounded-xl bg-[#BAFFFE]/30 dark:bg-[#172D9D]/20 border border-[#01A9F2]/40">
                        <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-semibold text-gray-700 dark:text-gray-200 inline-flex items-center gap-2">
                                <i className="fa-solid fa-cloud-arrow-up text-[#01A9F2]"></i>
                                Uploading {newFile.name}
                            </span>
                            <span className="font-bold text-[#01A9F2] dark:text-[#797CFF]">
                                {uploadProgress}%
                            </span>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-[#00E2E0] to-[#797CFF] transition-all duration-200"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {uploadProgress < 100
                                ? "Jangan tutup tab sampai upload selesai..."
                                : "Memproses..."}
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center mt-3">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={posting}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg
                            text-sm text-gray-700 dark:text-gray-200
                            hover:bg-gray-100 dark:hover:bg-gray-700 transition
                            disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <i className="fa-solid fa-paperclip"></i>
                        Attach File
                        <span className="text-xs text-gray-400">(max 10 MB)</span>
                    </button>

                    <div className="flex gap-2">
                        {(newBody || newFile) && !posting && (
                            <button
                                type="button"
                                onClick={() => {
                                    setNewBody("");
                                    setNewFile(null);
                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                }}
                                className="px-4 py-2 rounded-lg text-sm font-semibold
                                    text-gray-700 dark:text-gray-200
                                    hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handlePost}
                            disabled={!newBody.trim() || posting}
                            aria-disabled={!newBody.trim() || posting}
                            className="px-5 py-2 rounded-lg text-sm font-semibold
                                bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                dark:from-[#213A58] dark:to-[#172D9D]
                                text-white shadow hover:opacity-90
                                disabled:opacity-40 disabled:cursor-not-allowed transition
                                min-w-[110px]"
                        >
                            {posting ? (
                                newFile ? (
                                    <><i className="fa-solid fa-spinner fa-spin mr-1"></i>{uploadProgress}%</>
                                ) : (
                                    <><i className="fa-solid fa-spinner fa-spin mr-1"></i>Posting...</>
                                )
                            ) : (
                                <><i className="fa-solid fa-paper-plane mr-1"></i>Post</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Posts list */}
            {posts.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                    <i className="fa-regular fa-comments text-6xl mb-3"></i>
                    <p>Belum ada diskusi. Mulai diskusi pertama!</p>
                </div>
            ) : (
                <ul className="space-y-6">
                    {posts.map((p) => (
                        <ForumPostItem
                            key={p.id}
                            post={p}
                            classId={classId}
                            currentUserId={currentUserId}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}

function ForumPostItem({ post, classId, currentUserId, isReply = false }) {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyBody, setReplyBody] = useState("");
    const [replyFile, setReplyFile] = useState(null);
    const [editing, setEditing] = useState(false);
    const [editBody, setEditBody] = useState(post.body);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [replyProgress, setReplyProgress] = useState(0);
    const replyFileRef = useRef(null);

    const isOwner = post.user_id === currentUserId;

    const handleReplyFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            alert("File must be smaller than 10 MB.");
            e.target.value = "";
            return;
        }
        setReplyFile(file);
    };

    const submitReply = () => {
        if (submitting) return;
        if (!replyBody.trim()) return;
        setSubmitting(true);
        setReplyProgress(0);
        router.post(
            `/classes/${classId}/forum`,
            { body: replyBody, parent_id: post.id, file: replyFile },
            {
                forceFormData: true,
                preserveScroll: true,
                preserveState: true,
                only: ["forumPosts"],
                onProgress: (event) => {
                    if (event && typeof event.percentage === "number") {
                        setReplyProgress(event.percentage);
                    }
                },
                onSuccess: () => {
                    setReplyBody("");
                    setReplyFile(null);
                    setShowReplyBox(false);
                    if (replyFileRef.current) replyFileRef.current.value = "";
                },
                onFinish: () => {
                    setSubmitting(false);
                    setReplyProgress(0);
                },
            }
        );
    };

    const handleEditSave = () => {
        if (!editBody.trim()) return;
        setSubmitting(true);
        router.put(
            `/forum/${post.id}`,
            { body: editBody },
            {
                preserveScroll: true,
                preserveState: true,
                only: ["forumPosts"],
                onSuccess: () => setEditing(false),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const handleDelete = () => {
        router.delete(`/forum/${post.id}`, {
            preserveScroll: true,
            preserveState: true,
            only: ["forumPosts"],
            onSuccess: () => setConfirmDelete(false),
        });
    };

    const handleInsight = () => {
        router.post(
            `/forum/${post.id}/insight`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ["forumPosts"],
            }
        );
    };

    return (
        <li
            className={`flex gap-3 ${
                isReply
                    ? ""
                    : "p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm"
            }`}
        >
            {post.user?.avatar_url ? (
                <img
                    src={post.user.avatar_url}
                    alt={post.user.name}
                    className={`${isReply ? "w-8 h-8" : "w-11 h-11"} rounded-full object-cover flex-shrink-0`}
                />
            ) : (
                <div
                    className={`${isReply ? "w-8 h-8 text-sm" : "w-11 h-11"} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-300 flex-shrink-0`}
                >
                    {(post.user?.name || post.user?.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                </div>
            )}

            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {post.user?.name || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelative(post.created_at)}
                        {post.updated_at !== post.created_at && (
                            <span className="italic ml-1">(edited)</span>
                        )}
                    </span>
                </div>

                {editing ? (
                    <div className="mt-2">
                        <textarea
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border text-sm resize-none
                                bg-white text-gray-900
                                dark:bg-gray-900 dark:border-gray-700 dark:text-white
                                focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(false);
                                    setEditBody(post.body);
                                }}
                                className="px-3 py-1 rounded-md text-xs font-semibold
                                    text-gray-700 dark:text-gray-200
                                    hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleEditSave}
                                disabled={submitting || !editBody.trim()}
                                className="px-3 py-1 rounded-md text-xs font-semibold
                                    bg-[#01A9F2] text-white hover:opacity-90
                                    disabled:opacity-40"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                            {post.body}
                        </p>
                        {post.file_url && (
                            <FileAttachmentChip
                                url={post.file_url}
                                name={post.file_name}
                                size={post.file_size}
                            />
                        )}
                    </>
                )}

                {!editing && (
                    <div className="flex items-center gap-4 mt-3 text-xs">
                        <button
                            type="button"
                            onClick={handleInsight}
                            className={`inline-flex items-center gap-1 hover:opacity-70 transition
                                ${post.has_insight
                                    ? "text-yellow-500 font-semibold"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                            title={post.has_insight ? "Remove insight" : "Mark as insightful"}
                        >
                            <i className={post.has_insight ? "fa-solid fa-lightbulb" : "fa-regular fa-lightbulb"}></i>
                            {post.insights_count > 0 ? `${post.insights_count} Insight${post.insights_count > 1 ? "s" : ""}` : "Insight"}
                        </button>

                        <button
                            type="button"
                            onClick={() => setShowReplyBox(!showReplyBox)}
                            className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-[#01A9F2] transition"
                        >
                            <i className="fa-solid fa-reply"></i>
                            Reply
                        </button>

                        {isOwner && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditing(true);
                                        setEditBody(post.body);
                                    }}
                                    className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-[#01A9F2] transition"
                                >
                                    <i className="fa-solid fa-pen"></i>
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setConfirmDelete(true)}
                                    className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition"
                                >
                                    <i className="fa-solid fa-trash"></i>
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                )}

                {showReplyBox && (
                    <div className={`mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700
                        ${submitting ? "opacity-95 pointer-events-none" : ""}`}>
                        <textarea
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            placeholder={`Reply to ${post.user?.name || "user"}...`}
                            rows={2}
                            readOnly={submitting}
                            className={`w-full px-3 py-2 rounded-lg border text-sm resize-none
                                bg-white text-gray-900 placeholder-gray-400
                                dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-[#01A9F2]
                                ${submitting ? "opacity-60" : ""}`}
                        />

                        <input
                            ref={replyFileRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.webp,.zip,.txt,.csv"
                            onChange={handleReplyFileChange}
                            className="hidden"
                        />

                        {replyFile && (
                            <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded-lg
                                bg-[#BAFFFE]/30 dark:bg-[#172D9D]/20
                                border border-[#01A9F2]/40 text-xs">
                                <i className={fileIcon(replyFile.name)}></i>
                                <span className="text-gray-700 dark:text-gray-200 truncate max-w-xs">
                                    {replyFile.name}
                                </span>
                                {!submitting && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReplyFile(null);
                                            if (replyFileRef.current) replyFileRef.current.value = "";
                                        }}
                                        className="text-red-500 hover:text-red-600"
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                )}
                            </div>
                        )}

                        {submitting && replyFile && (
                            <div className="mt-3 p-2 rounded-lg bg-[#BAFFFE]/30 dark:bg-[#172D9D]/20 border border-[#01A9F2]/40">
                                <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="font-semibold text-gray-700 dark:text-gray-200 inline-flex items-center gap-1.5">
                                        <i className="fa-solid fa-cloud-arrow-up text-[#01A9F2]"></i>
                                        Uploading...
                                    </span>
                                    <span className="font-bold text-[#01A9F2] dark:text-[#797CFF]">
                                        {replyProgress}%
                                    </span>
                                </div>
                                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-linear-to-r from-[#00E2E0] to-[#797CFF] transition-all duration-200"
                                        style={{ width: `${replyProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center mt-2">
                            <button
                                type="button"
                                onClick={() => replyFileRef.current?.click()}
                                disabled={submitting}
                                className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#01A9F2] inline-flex items-center gap-1
                                    disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <i className="fa-solid fa-paperclip"></i>
                                Attach
                            </button>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowReplyBox(false);
                                        setReplyBody("");
                                        setReplyFile(null);
                                    }}
                                    disabled={submitting}
                                    className="px-3 py-1 rounded-md text-xs font-semibold
                                        text-gray-700 dark:text-gray-200
                                        hover:bg-gray-100 dark:hover:bg-gray-700
                                        disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={submitReply}
                                    disabled={submitting || !replyBody.trim()}
                                    className="px-3 py-1 rounded-md text-xs font-semibold
                                        bg-[#01A9F2] text-white hover:opacity-90
                                        disabled:opacity-40 disabled:cursor-not-allowed
                                        min-w-[60px]"
                                >
                                    {submitting ? (
                                        replyFile ? `${replyProgress}%` : "..."
                                    ) : "Reply"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {post.replies?.length > 0 && (
                    <ul className="mt-4 space-y-4 pl-2 border-l-2 border-gray-100 dark:border-gray-700">
                        {post.replies.map((r) => (
                            <ForumPostItem
                                key={r.id}
                                post={r}
                                classId={classId}
                                currentUserId={currentUserId}
                                isReply
                            />
                        ))}
                    </ul>
                )}

                {confirmDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-[90%] max-w-sm
                            border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                                Delete post?
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Akan menghapus semua reply dan file terlampir. Tidak bisa dibatalkan.
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
            </div>
        </li>
    );
}
