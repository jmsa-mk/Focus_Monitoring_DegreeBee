import { Link, router, usePage } from "@inertiajs/react";
import { useState } from "react";
import AdminLayout from "../../Component/AdminLayout";
import Pagination from "../../Component/AdminPagination";

function getYoutubeId(link) {
    if (!link) return null;
    const m = link.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/);
    return m && m[2].length === 11 ? m[2] : null;
}

function formatDateTime(iso) {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("id-ID", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function StatusBadge({ status }) {
    const map = {
        pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300", icon: "fa-clock" },
        reviewed: { label: "Reviewed", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", icon: "fa-circle-check" },
        dismissed: { label: "Dismissed", cls: "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300", icon: "fa-ban" },
    };
    const m = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${m.cls}`}>
            <i className={`fa-solid ${m.icon}`}></i> {m.label}
        </span>
    );
}

const REASON_ICON = {
    inappropriate: "fa-ban",
    spam: "fa-envelope-open-text",
    copyright: "fa-copyright",
    harassment: "fa-hand-fist",
    other: "fa-circle-question",
};

const FILTERS = [
    { key: "all", label: "Semua" },
    { key: "pending", label: "Pending" },
    { key: "reviewed", label: "Reviewed" },
    { key: "dismissed", label: "Dismissed" },
];

export default function AdminReports() {
    const { reports, filters, counts } = usePage().props;
    const [confirmDeleteContent, setConfirmDeleteContent] = useState(null);

    const setFilter = (status) =>
        router.get("/admin/reports", { status }, { preserveState: true, replace: true });

    const setStatus = (report, status) =>
        router.patch(`/admin/reports/${report.id}`, { status }, { preserveScroll: true });

    const deleteReport = (report) =>
        router.delete(`/admin/reports/${report.id}`, { preserveScroll: true });

    const deleteContent = () =>
        router.delete(`/admin/reports/${confirmDeleteContent.id}/content`, {
            preserveScroll: true,
            onFinish: () => setConfirmDeleteContent(null),
        });

    return (
        <AdminLayout
            title="Reports"
            icon="fa-flag"
            subtitle="Konten yang dilaporkan pengguna sebagai mencurigakan"
        >
            <div className="flex flex-wrap gap-2 mb-6">
                {FILTERS.map((f) => {
                    const active = (filters?.status || "all") === f.key;
                    return (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition inline-flex items-center gap-2
                                ${
                                    active
                                        ? "bg-linear-to-r from-[#01A9F2] to-[#797CFF] text-white shadow"
                                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
                                }`}
                        >
                            {f.label}
                            <span className={`min-w-5 px-1.5 rounded-full text-[11px] font-bold
                                ${active ? "bg-white/25" : "bg-gray-100 dark:bg-gray-700"}`}>
                                {counts?.[f.key] ?? 0}
                            </span>
                        </button>
                    );
                })}
            </div>

            {reports.data.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <i className="fa-solid fa-flag-checkered text-6xl mb-4 block"></i>
                    <p className="font-medium">Tidak ada laporan di kategori ini.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reports.data.map((r) => {
                        const ytId = r.kind === "video" ? getYoutubeId(r.target?.youtube_link) : null;
                        return (
                            <div key={r.id} className="bg-white/95 dark:bg-gray-900/85 backdrop-blur rounded-2xl shadow-md
                                border border-gray-100 dark:border-gray-800 p-5 flex flex-col md:flex-row gap-5">

                                <div className="md:w-56 shrink-0">
                                    {!r.target ? (
                                        <div className="aspect-video rounded-xl bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-400">
                                            <i className="fa-solid fa-trash-can text-2xl mb-1"></i>
                                            <span className="text-xs">Konten sudah dihapus</span>
                                        </div>
                                    ) : r.kind === "video" ? (
                                        <div className="rounded-xl overflow-hidden bg-black aspect-video">
                                            {ytId ? (
                                                <img src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                    <i className="fa-regular fa-image text-2xl"></i>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="rounded-xl overflow-hidden aspect-video bg-gray-200 dark:bg-gray-700">
                                            {r.target.thumbnail_url ? (
                                                <img src={r.target.thumbnail_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400
                                                    bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                                                    <i className="fa-solid fa-chalkboard text-2xl"></i>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 flex-wrap">
                                        <div className="min-w-0">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide mb-1
                                                ${r.kind === "video"
                                                    ? "bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300"
                                                    : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300"}`}>
                                                <i className={`fa-solid ${r.kind === "video" ? "fa-film" : "fa-chalkboard-user"}`}></i>
                                                {r.kind === "video" ? "Video" : "Kelas"}
                                            </span>
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                                {r.target?.title || "(Konten dihapus)"}
                                            </h3>
                                            {r.target?.owner && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    Pemilik: {r.target.owner}
                                                    {r.target.code && <span className="ml-2 font-mono">· {r.target.code}</span>}
                                                </p>
                                            )}
                                        </div>
                                        <StatusBadge status={r.status} />
                                    </div>


                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
                                            bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300">
                                            <i className={`fa-solid ${REASON_ICON[r.reason] || "fa-flag"}`}></i>
                                            {r.reason_label}
                                        </span>
                                    </div>

                                    {r.description && (
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg px-3 py-2">
                                            "{r.description}"
                                        </p>
                                    )}

                                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                                        <span className="inline-flex items-center gap-1">
                                            <i className="fa-solid fa-user"></i>
                                            {r.reporter?.name || r.reporter?.email || "Unknown"}
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <i className="fa-solid fa-clock"></i>
                                            {formatDateTime(r.created_at)}
                                        </span>
                                    </div>


                                    <div className="mt-4 flex flex-wrap items-center gap-2">
                                        {r.target && (
                                            <Link
                                                href={r.target.url}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5
                                                    border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300
                                                    hover:bg-gray-100 dark:hover:bg-gray-800"
                                            >
                                                <i className="fa-solid fa-up-right-from-square"></i> Lihat konten
                                            </Link>
                                        )}
                                        {r.status !== "reviewed" && (
                                            <button
                                                onClick={() => setStatus(r, "reviewed")}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5
                                                    bg-emerald-50 text-emerald-600 hover:bg-emerald-100
                                                    dark:bg-emerald-900/30 dark:text-emerald-300"
                                            >
                                                <i className="fa-solid fa-check"></i> Tandai ditinjau
                                            </button>
                                        )}
                                        {r.status !== "dismissed" && (
                                            <button
                                                onClick={() => setStatus(r, "dismissed")}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5
                                                    bg-gray-100 text-gray-600 hover:bg-gray-200
                                                    dark:bg-gray-800 dark:text-gray-300"
                                            >
                                                <i className="fa-solid fa-ban"></i> Abaikan
                                            </button>
                                        )}
                                        {r.status !== "pending" && (
                                            <button
                                                onClick={() => setStatus(r, "pending")}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5
                                                    bg-yellow-50 text-yellow-600 hover:bg-yellow-100
                                                    dark:bg-yellow-900/30 dark:text-yellow-300"
                                            >
                                                <i className="fa-solid fa-rotate-left"></i> Buka lagi
                                            </button>
                                        )}
                                        {r.target && (
                                            <button
                                                onClick={() => setConfirmDeleteContent(r)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5
                                                    bg-red-500 text-white hover:bg-red-600"
                                            >
                                                <i className="fa-solid fa-trash"></i> Hapus {r.kind === "video" ? "video" : "kelas"}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteReport(r)}
                                            title="Hapus laporan ini"
                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5
                                                text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 ml-auto"
                                        >
                                            <i className="fa-solid fa-xmark"></i> Hapus laporan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <Pagination links={reports.links} />
                </div>
            )}


            {confirmDeleteContent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7 w-full max-w-md
                        border border-gray-200 dark:border-gray-700 text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-4">
                            <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Hapus {confirmDeleteContent.kind === "video" ? "video" : "kelas"} ini?
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            "{confirmDeleteContent.target?.title}" akan dihapus permanen beserta semua laporan terkait.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setConfirmDeleteContent(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600
                                    text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Batal
                            </button>
                            <button
                                onClick={deleteContent}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600"
                            >
                                Hapus
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
