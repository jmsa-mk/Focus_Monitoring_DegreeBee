import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import AdminLayout from "../../Component/AdminLayout";
import Pagination from "../../Component/AdminPagination";

export default function AdminClasses() {
    const { classes, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search || "");
    const [confirmDelete, setConfirmDelete] = useState(null);

    const submitSearch = (e) => {
        e.preventDefault();
        router.get("/admin/classes", { search }, { preserveState: true, replace: true });
    };

    const doDelete = () => {
        router.delete(`/admin/classes/${confirmDelete.id}`, {
            preserveScroll: true,
            onFinish: () => setConfirmDelete(null),
        });
    };

    return (
        <AdminLayout
            title="Classes"
            icon="fa-chalkboard-user"
            subtitle={`Kelola ${classes.total} kelas di platform`}
            actions={
                <form onSubmit={submitSearch} className="flex gap-2">
                    <div className="relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari judul / kode..."
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
                {classes.data.map((c) => (
                    <div key={c.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-md overflow-hidden
                        border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-all duration-300">
                        <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
                            {c.thumbnail_url ? (
                                <img src={c.thumbnail_url} alt={c.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400
                                    bg-linear-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
                                    <i className="fa-solid fa-chalkboard text-3xl opacity-50"></i>
                                </div>
                            )}
                            <span className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 text-white
                                text-[11px] font-mono tracking-wider">
                                {c.code}
                            </span>
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{c.title}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 min-h-8">
                                {c.description}
                            </p>
                            <div className="flex items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1">
                                    <i className="fa-solid fa-users"></i> {c.students_count}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <i className="fa-solid fa-film"></i> {c.videos_count}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate inline-flex items-center gap-1.5">
                                    <i className="fa-solid fa-user-tie text-gray-400"></i>
                                    {c.creator?.name || c.creator?.email || "Unknown"}
                                </span>
                                <button
                                    onClick={() => setConfirmDelete(c)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition
                                        bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600
                                        dark:bg-gray-800 dark:text-gray-400"
                                    title="Hapus kelas"
                                >
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {classes.data.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <i className="fa-solid fa-chalkboard text-5xl mb-3 block"></i>
                    Tidak ada kelas ditemukan.
                </div>
            )}

            <div className="bg-white/60 dark:bg-gray-900/40 rounded-2xl mt-5">
                <Pagination links={classes.links} />
            </div>

            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7 w-full max-w-md
                        border border-gray-200 dark:border-gray-700 text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-4">
                            <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Hapus kelas?</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            "{confirmDelete.title}" beserta forum, notes, dan question bank di dalamnya akan dihapus permanen.
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
