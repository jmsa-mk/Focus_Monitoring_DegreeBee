import { router } from "@inertiajs/react";
import { useState, useRef, useEffect } from "react";

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

function countAll(comments) {
    let n = 0;
    for (const c of comments) {
        n += 1 + (c.replies?.length || 0);
    }
    return n;
}

export default function CommentSection({ comments = [], videoId, currentUserId }) {
    const [newBody, setNewBody] = useState("");
    const [posting, setPosting] = useState(false);

    const total = countAll(comments);

    const handlePost = () => {
        const body = newBody.trim();
        if (!body) return;
        setPosting(true);
        router.post(
            `/videos/${videoId}/comments`,
            { body },
            {
                preserveScroll: true,
                preserveState: true,
                only: ["comments"],
                onSuccess: () => setNewBody(""),
                onFinish: () => setPosting(false),
            }
        );
    };

    return (
        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white inline-flex items-center gap-2">
                <i className="fa-regular fa-comment"></i>
                Comments
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({total})
                </span>
            </h2>

            {/* Composer */}
            <div className="mb-8 flex gap-3">
                <div className="flex-1">
                    <textarea
                        value={newBody}
                        onChange={(e) => setNewBody(e.target.value)}
                        placeholder="Add a comment..."
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border resize-none
                            bg-white text-gray-900 placeholder-gray-400
                            dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                    />
                    <div className="flex justify-end mt-2 gap-2">
                        {newBody && (
                            <button
                                type="button"
                                onClick={() => setNewBody("")}
                                className="px-4 py-2 rounded-lg text-sm font-semibold
                                    text-gray-700 dark:text-gray-200
                                    hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handlePost}
                            disabled={!newBody.trim() || posting}
                            className="px-5 py-2 rounded-lg text-sm font-semibold
                                bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                dark:from-[#213A58] dark:to-[#172D9D]
                                text-white shadow-md hover:opacity-90
                                disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            {posting ? (
                                <><i className="fa-solid fa-spinner fa-spin mr-1"></i>Posting...</>
                            ) : (
                                "Post Comment"
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Comments list */}
            {comments.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <i className="fa-regular fa-comments text-5xl mb-3"></i>
                    <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
            ) : (
                <ul className="space-y-6">
                    {comments.map((c) => (
                        <CommentItem
                            key={c.id}
                            comment={c}
                            videoId={videoId}
                            currentUserId={currentUserId}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
}

function CommentItem({ comment, videoId, currentUserId, isReply = false }) {
    const [showReplyBox, setShowReplyBox] = useState(false);
    const [replyBody, setReplyBody] = useState("");
    const [editing, setEditing] = useState(false);
    const [editBody, setEditBody] = useState(comment.body);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const isOwner = comment.user_id === currentUserId;

    const replyTo = (parentId, body, cb) => {
        if (!body.trim()) return;
        setSubmitting(true);
        router.post(
            `/videos/${videoId}/comments`,
            { body, parent_id: parentId },
            {
                preserveScroll: true,
                preserveState: true,
                only: ["comments"],
                onSuccess: () => cb && cb(),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const handleEditSave = () => {
        if (!editBody.trim()) return;
        setSubmitting(true);
        router.put(
            `/comments/${comment.id}`,
            { body: editBody },
            {
                preserveScroll: true,
                preserveState: true,
                only: ["comments"],
                onSuccess: () => setEditing(false),
                onFinish: () => setSubmitting(false),
            }
        );
    };

    const handleDelete = () => {
        router.delete(`/comments/${comment.id}`, {
            preserveScroll: true,
            preserveState: true,
            only: ["comments"],
            onSuccess: () => setConfirmDelete(false),
        });
    };

    const handleLike = () => {
        router.post(
            `/comments/${comment.id}/like`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                only: ["comments"],
            }
        );
    };

    return (
        <li className="flex gap-3">
            {/* Avatar */}
            {comment.user?.avatar_url ? (
                <img
                    src={comment.user.avatar_url}
                    alt={comment.user.name}
                    className={`${isReply ? "w-8 h-8" : "w-10 h-10"} rounded-full object-cover flex-shrink-0`}
                />
            ) : (
                <div
                    className={`${isReply ? "w-8 h-8 text-sm" : "w-10 h-10"} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-300 flex-shrink-0`}
                >
                    {(comment.user?.name || comment.user?.email || "?")
                        .charAt(0)
                        .toUpperCase()}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {comment.user?.name || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelative(comment.created_at)}
                        {comment.updated_at !== comment.created_at && (
                            <span className="italic ml-1">(edited)</span>
                        )}
                    </span>
                </div>

                {/* Body or Edit */}
                {editing ? (
                    <div className="mt-2">
                        <textarea
                            value={editBody}
                            onChange={(e) => setEditBody(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border text-sm resize-none
                                bg-white text-gray-900
                                dark:bg-gray-800 dark:border-gray-700 dark:text-white
                                focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setEditing(false);
                                    setEditBody(comment.body);
                                }}
                                className="px-3 py-1 rounded-md text-xs font-semibold
                                    text-gray-700 dark:text-gray-200
                                    hover:bg-gray-100 dark:hover:bg-gray-800"
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
                    <p className="mt-1 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
                        {comment.body}
                    </p>
                )}

                {/* Actions */}
                {!editing && (
                    <div className="flex items-center gap-4 mt-2 text-xs">
                        <button
                            type="button"
                            onClick={handleLike}
                            className={`inline-flex items-center gap-1 hover:opacity-70 transition
                                ${comment.is_liked
                                    ? "text-[#01A9F2] font-semibold"
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                            title={comment.is_liked ? "Unlike" : "Like"}
                        >
                            <i className={comment.is_liked ? "fa-solid fa-thumbs-up" : "fa-regular fa-thumbs-up"}></i>
                            {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
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
                                        setEditBody(comment.body);
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

                {/* Reply composer */}
                {showReplyBox && (
                    <div className="mt-3">
                        <textarea
                            value={replyBody}
                            onChange={(e) => setReplyBody(e.target.value)}
                            placeholder={`Reply to ${comment.user?.name || "user"}...`}
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border text-sm resize-none
                                bg-white text-gray-900 placeholder-gray-400
                                dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400
                                focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowReplyBox(false);
                                    setReplyBody("");
                                }}
                                className="px-3 py-1 rounded-md text-xs font-semibold
                                    text-gray-700 dark:text-gray-200
                                    hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    replyTo(comment.id, replyBody, () => {
                                        setReplyBody("");
                                        setShowReplyBox(false);
                                    })
                                }
                                disabled={submitting || !replyBody.trim()}
                                className="px-3 py-1 rounded-md text-xs font-semibold
                                    bg-[#01A9F2] text-white hover:opacity-90
                                    disabled:opacity-40"
                            >
                                {submitting ? "Posting..." : "Reply"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Replies */}
                {comment.replies?.length > 0 && (
                    <ul className="mt-4 space-y-4">
                        {comment.replies.map((r) => (
                            <CommentItem
                                key={r.id}
                                comment={r}
                                videoId={videoId}
                                currentUserId={currentUserId}
                                isReply
                            />
                        ))}
                    </ul>
                )}

                {/* Delete confirm modal */}
                {confirmDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 w-[90%] max-w-sm
                            border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                                Delete comment?
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                This will also delete all replies. This action cannot be undone.
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
