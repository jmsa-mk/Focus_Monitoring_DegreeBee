import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";

const COLORS = [
    {
        key: "yellow",
        label: "Yellow",
        light: "bg-yellow-100 border-yellow-200",
        dark: "dark:bg-yellow-900/40 dark:border-yellow-800",
        swatch: "bg-yellow-300",
        text: "text-yellow-950 dark:text-yellow-50",
        subtle: "text-yellow-800/70 dark:text-yellow-200/60",
    },
    {
        key: "blue",
        label: "Cyan",
        light: "bg-[#BAFFFE] border-[#00E2E0]/40",
        dark: "dark:bg-[#172D9D]/40 dark:border-[#797CFF]/40",
        swatch: "bg-[#00E2E0]",
        text: "text-[#0C2D34] dark:text-[#BAFFFE]",
        subtle: "text-[#0C2D34]/70 dark:text-[#BAFFFE]/60",
    },
    {
        key: "purple",
        label: "Purple",
        light: "bg-purple-100 border-purple-200",
        dark: "dark:bg-purple-900/40 dark:border-purple-800",
        swatch: "bg-[#797CFF]",
        text: "text-purple-950 dark:text-purple-50",
        subtle: "text-purple-800/70 dark:text-purple-200/60",
    },
    {
        key: "pink",
        label: "Pink",
        light: "bg-pink-100 border-pink-200",
        dark: "dark:bg-pink-900/40 dark:border-pink-800",
        swatch: "bg-pink-300",
        text: "text-pink-950 dark:text-pink-50",
        subtle: "text-pink-800/70 dark:text-pink-200/60",
    },
    {
        key: "green",
        label: "Green",
        light: "bg-emerald-100 border-emerald-200",
        dark: "dark:bg-emerald-900/40 dark:border-emerald-800",
        swatch: "bg-emerald-300",
        text: "text-emerald-950 dark:text-emerald-50",
        subtle: "text-emerald-800/70 dark:text-emerald-200/60",
    },
    {
        key: "orange",
        label: "Orange",
        light: "bg-orange-100 border-orange-200",
        dark: "dark:bg-orange-900/40 dark:border-orange-800",
        swatch: "bg-orange-300",
        text: "text-orange-950 dark:text-orange-50",
        subtle: "text-orange-800/70 dark:text-orange-200/60",
    },
];

function getColor(key) {
    return COLORS.find((c) => c.key === key) || COLORS[0];
}

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

export default function NotesSection({ notes = [], classId, currentUserId }) {
    const [showComposer, setShowComposer] = useState(false);

    return (
        <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white inline-flex items-center gap-3">
                        <i className="fa-solid fa-note-sticky text-yellow-400"></i>
                        Notes
                        <span className="text-base font-normal text-gray-500 dark:text-gray-400">
                            ({notes.length})
                        </span>
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Sticky notes untuk berbagi ide, ringkasan, atau pengingat dengan kelas.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowComposer(true)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold
                        bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                        dark:from-[#213A58] dark:to-[#172D9D]
                        text-white shadow-md hover:opacity-90 transition
                        inline-flex items-center gap-2"
                >
                    <i className="fa-solid fa-plus"></i>
                    Add Note
                </button>
            </div>

            {/* Composer modal */}
            {showComposer && (
                <NoteComposer
                    classId={classId}
                    onClose={() => setShowComposer(false)}
                />
            )}

            {/* Empty state */}
            {notes.length === 0 ? (
                <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                    <i className="fa-regular fa-note-sticky text-7xl mb-4 text-gray-300 dark:text-gray-600"></i>
                    <p className="text-lg font-medium">Belum ada notes</p>
                    <p className="text-sm mt-1">Jadilah yang pertama untuk berbagi catatan!</p>
                </div>
            ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 [column-fill:_balance]">
                    {notes.map((n) => (
                        <NoteCard
                            key={n.id}
                            note={n}
                            classId={classId}
                            currentUserId={currentUserId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function NoteCard({ note, classId, currentUserId }) {
    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const c = getColor(note.color);
    const isOwner = note.user_id === currentUserId;

    const handleDelete = () => {
        router.delete(`/notes/${note.id}`, {
            preserveScroll: true,
            preserveState: true,
            only: ["notes"],
            onSuccess: () => setConfirmDelete(false),
        });
    };

    if (editing) {
        return (
            <NoteComposer
                classId={classId}
                existing={note}
                onClose={() => setEditing(false)}
            />
        );
    }

    return (
        <>
            <div
                className={`mb-4 break-inside-avoid p-4 rounded-2xl border shadow-sm
                    hover:shadow-md transition group relative
                    ${c.light} ${c.dark}`}
            >
                {/* Body */}
                <p className={`${c.text} text-sm whitespace-pre-wrap break-words leading-relaxed mb-3`}>
                    {note.body}
                </p>

                {/* Footer: author + actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-current/10">
                    <div className={`text-xs ${c.subtle} inline-flex items-center gap-1.5 min-w-0`}>
                        {note.user?.avatar_url ? (
                            <img
                                src={note.user.avatar_url}
                                alt={note.user.name}
                                className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                {(note.user?.name || "?").charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="truncate">
                            {note.user?.name || "Anonymous"}
                        </span>
                        <span className="opacity-60 flex-shrink-0">
                            {formatRelative(note.created_at)}
                        </span>
                    </div>

                    {isOwner && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                            <button
                                type="button"
                                onClick={() => setEditing(true)}
                                className={`${c.subtle} hover:opacity-100 p-1.5 rounded-md hover:bg-current/10`}
                                title="Edit"
                            >
                                <i className="fa-solid fa-pen text-xs"></i>
                            </button>
                            <button
                                type="button"
                                onClick={() => setConfirmDelete(true)}
                                className={`${c.subtle} hover:text-red-500 p-1.5 rounded-md hover:bg-current/10`}
                                title="Delete"
                            >
                                <i className="fa-solid fa-trash text-xs"></i>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete confirmation */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-[90%] max-w-sm
                        border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                            Delete note?
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Note ini akan dihapus permanen.
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

function NoteComposer({ classId, existing = null, onClose }) {
    const [body, setBody] = useState(existing?.body || "");
    const [color, setColor] = useState(existing?.color || "yellow");
    const [submitting, setSubmitting] = useState(false);

    const isEdit = !!existing;
    const c = getColor(color);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && !submitting) onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose, submitting]);

    const handleSubmit = () => {
        if (submitting || !body.trim()) return;
        setSubmitting(true);

        const config = {
            preserveScroll: true,
            preserveState: true,
            only: ["notes"],
            onSuccess: () => onClose(),
            onFinish: () => setSubmitting(false),
        };

        if (isEdit) {
            router.put(`/notes/${existing.id}`, { body, color }, config);
        } else {
            router.post(`/classes/${classId}/notes`, { body, color }, config);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => !submitting && onClose()}
        >
            <div
                className={`w-full max-w-md rounded-2xl shadow-2xl border-2 transition
                    ${c.light} ${c.dark}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className={`font-bold text-lg ${c.text}`}>
                            {isEdit ? "Edit Note" : "New Note"}
                        </h3>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className={`w-8 h-8 rounded-md flex items-center justify-center
                                ${c.subtle} hover:bg-current/10 disabled:opacity-40`}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Tulis catatan kamu di sini..."
                        rows={6}
                        autoFocus
                        readOnly={submitting}
                        className={`w-full px-3 py-2 rounded-lg bg-white/60 dark:bg-black/20
                            border border-current/20 resize-none text-sm
                            placeholder:opacity-50 ${c.text}
                            focus:outline-none focus:ring-2 focus:ring-current/30`}
                    />

                    {/* Color palette */}
                    <div className="mt-4">
                        <div className={`text-xs font-semibold mb-2 ${c.subtle}`}>
                            <i className="fa-solid fa-palette mr-1"></i>
                            Color
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {COLORS.map((option) => (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => setColor(option.key)}
                                    disabled={submitting}
                                    title={option.label}
                                    className={`w-8 h-8 rounded-lg ${option.swatch}
                                        border-2 transition
                                        ${color === option.key
                                            ? "border-gray-900 dark:border-white ring-2 ring-offset-2 ring-current/30"
                                            : "border-transparent hover:scale-110"
                                        }
                                        disabled:opacity-40`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 mt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold
                                ${c.subtle} hover:bg-current/10 disabled:opacity-40`}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting || !body.trim()}
                            className="px-5 py-2 rounded-lg text-sm font-semibold
                                bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                dark:from-[#213A58] dark:to-[#172D9D]
                                text-white shadow hover:opacity-90 transition
                                disabled:opacity-40 disabled:cursor-not-allowed
                                inline-flex items-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    {isEdit ? "Saving..." : "Posting..."}
                                </>
                            ) : (
                                <>
                                    <i className={`fa-solid ${isEdit ? "fa-check" : "fa-paper-plane"}`}></i>
                                    {isEdit ? "Save" : "Post Note"}
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
