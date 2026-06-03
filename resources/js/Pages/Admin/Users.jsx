import { router, usePage } from "@inertiajs/react";
import { useState } from "react";
import AdminLayout from "../../Component/AdminLayout";
import Pagination from "../../Component/AdminPagination";

function RoleBadge({ role }) {
    return role === "admin" ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold
            bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            <i className="fa-solid fa-shield-halved"></i> Admin
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold
            bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <i className="fa-solid fa-user"></i> Student
        </span>
    );
}

export default function AdminUsers() {
    const { users, filters, auth } = usePage().props;
    const meId = auth?.user?.id;
    const [search, setSearch] = useState(filters?.search || "");
    const [confirmDelete, setConfirmDelete] = useState(null);

    const submitSearch = (e) => {
        e.preventDefault();
        router.get("/admin/users", { search }, { preserveState: true, replace: true });
    };

    const togglePremium = (u) =>
        router.post(`/admin/users/${u.id}/premium`, {}, { preserveScroll: true });

    const toggleRole = (u) =>
        router.post(`/admin/users/${u.id}/role`, {}, { preserveScroll: true });

    const doDelete = () => {
        router.delete(`/admin/users/${confirmDelete.id}`, {
            preserveScroll: true,
            onFinish: () => setConfirmDelete(null),
        });
    };

    return (
        <AdminLayout
            title="Users"
            icon="fa-users"
            subtitle={`Kelola ${users.total} pengguna terdaftar`}
            actions={
                <form onSubmit={submitSearch} className="flex gap-2">
                    <div className="relative">
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama / email..."
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
            <div className="bg-white/95 dark:bg-gray-900/85 backdrop-blur rounded-2xl shadow-md
                border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold">User</th>
                                <th className="text-left px-4 py-3 font-semibold">Role</th>
                                <th className="text-left px-4 py-3 font-semibold">Subscription</th>
                                <th className="text-center px-4 py-3 font-semibold">Videos</th>
                                <th className="text-center px-4 py-3 font-semibold">Classes</th>
                                <th className="text-right px-4 py-3 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.map((u) => {
                                const isSelf = u.id === meId;
                                return (
                                    <tr key={u.id} className="border-t border-gray-100 dark:border-gray-800
                                        hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {u.avatar_url ? (
                                                    <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-semibold text-gray-600 dark:text-gray-200">
                                                        {(u.name || u.email || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-white truncate flex items-center gap-1.5">
                                                        {u.name || "(Tanpa nama)"}
                                                        {isSelf && (
                                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#01A9F2]/10 text-[#01A9F2] font-bold">
                                                                YOU
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                                        <td className="px-4 py-3">
                                            {u.is_premium ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold
                                                    bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                                                    <i className="fa-solid fa-crown"></i> {u.subscription_label}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">Free</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-200">{u.videos_count}</td>
                                        <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-200">{u.classes_created_count}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => togglePremium(u)}
                                                    title={u.is_premium ? "Cabut premium" : "Beri premium 30 hari"}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition
                                                        ${
                                                            u.is_premium
                                                                ? "bg-amber-100 text-amber-600 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300"
                                                                : "bg-gray-100 text-gray-500 hover:bg-amber-100 hover:text-amber-600 dark:bg-gray-800 dark:text-gray-400"
                                                        }`}
                                                >
                                                    <i className="fa-solid fa-crown"></i>
                                                </button>
                                                <button
                                                    onClick={() => toggleRole(u)}
                                                    disabled={isSelf}
                                                    title={isSelf ? "Tidak bisa ubah role sendiri" : u.role === "admin" ? "Jadikan student" : "Jadikan admin"}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition
                                                        disabled:opacity-30 disabled:cursor-not-allowed
                                                        ${
                                                            u.role === "admin"
                                                                ? "bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
                                                                : "bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-purple-600 dark:bg-gray-800 dark:text-gray-400"
                                                        }`}
                                                >
                                                    <i className="fa-solid fa-shield-halved"></i>
                                                </button>
                                                <button
                                                    onClick={() => setConfirmDelete(u)}
                                                    disabled={isSelf}
                                                    title={isSelf ? "Tidak bisa hapus akun sendiri" : "Hapus pengguna"}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition
                                                        bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600
                                                        dark:bg-gray-800 dark:text-gray-400
                                                        disabled:opacity-30 disabled:cursor-not-allowed"
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                                        <i className="fa-solid fa-users-slash text-4xl mb-3 block"></i>
                                        Tidak ada pengguna ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={users.links} />
            </div>

            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7 w-full max-w-md
                        border border-gray-200 dark:border-gray-700 text-center">
                        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-4">
                            <i className="fa-solid fa-triangle-exclamation text-2xl text-red-500"></i>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Hapus pengguna?</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            <strong>{confirmDelete.email}</strong> beserta semua video & kelas miliknya akan dihapus permanen.
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
