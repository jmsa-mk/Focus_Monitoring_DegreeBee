import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import AdminLayout from "../../Component/AdminLayout";
import Pagination from "../../Component/AdminPagination";

function getYoutubeId(link) {
    if (!link) return null;
    const m = link.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/);
    return m && m[2].length === 11 ? m[2] : null;
}

export default function AdminVideos() {
    const { videos, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search || "");
    const [confirmDelete, setConfirmDelete] = useState(null);

    const submitSearch = (e) => {
        e.preventDefault();
        router.get("/admin/videos", { search }, { preserveState: true, replace: true });
    };

    const doDelete = () => {
        router.delete(`/admin/videos/${confirmDelete.id}`, {
            preserveScroll: true,
            onFinish: () => setConfirmDelete(null),
        });
    };

    return (
        <AdminLayout
            title="Videos"
            icon="fa-film"
            subtitle={`Moderasi ${videos.total} video di platform`}
            actions={
                <form onSubmit={submitSearch} className="flex gap-2">
                    <div className="relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari judul / topik..."
                            className="pl-9 pr-3 py-2 rounded-xl text-sm w-56 bg-white dark:bg-gray-800
                                border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100
                                focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                        />
                    </div>
                    <button className="px-4 py-2 rounded-xl bg-[#01A9F2] text-white text-sm font-semibold hover:opacity-90">
                        Cari
                    </button>
                </form>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {videos.data.map((v) => {
                    const id = getYoutubeId(v.youtube_link);
                    return (
                        <div key={v.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden
                            border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300 group">
                            <div className="aspect-video bg-black relative">
                                {id ? (
                                    <img
                                        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                                        alt={v.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                                        <i className="fa-regular fa-image text-3xl"></i>
                                    </div>
                                )}
                                <a
                                    href={v.youtube_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="absolute top-2 right-2 w-8 h-8 rounded-lg bg-black/60 text-white
                                        flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                    title="Buka di YouTube"
                                >
                                    <i className="fa-solid fa-up-right-from-square text-xs"></i>
                                </a>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug">
                                    {v.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    {v.topic && (
                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800">{v.topic}</span>
                                    )}
                                    <span className="inline-flex items-center gap-1">
                                        <i className="fa-solid fa-star text-amber-400"></i>
                                        {v.ratings_count}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate inline-flex items-center gap-1.5">
                                        <i className="fa-solid fa-user text-gray-400"></i>
                                        {v.user?.name || v.user?.email || "Unknown"}
                                    </span>
                                    <button
                                        onClick={() => setConfirmDelete(v)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center transition
                                            bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600
                                            dark:bg-gray-800 dark:text-gray-400"
                                        title="Hapus video"
                                    >
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {videos.data.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <i className="fa-solid fa-film text-5xl mb-3 block"></i>
                    Tidak ada video ditemukan.
                </div>
            )}

            <div className="bg-white/60 dark:bg-gray-900/40 rounded-2xl mt-5">
                <Pagination links={videos.links} />
            </div>

            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7 w-full max-w-md
                        border border-gray-200 dark:border-gray-700 text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-4">
                            <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Hapus video?</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                            "{confirmDelete.title}" akan dihapus permanen.
                        </p>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600
                                    text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Batal
                            </button>
                            <button
                                onClick={doDelete}
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
