import { Link, usePage } from "@inertiajs/react";
import AdminLayout from "../../Component/AdminLayout";

function formatCurrency(n) {
    return "Rp " + new Intl.NumberFormat("id-ID").format(n || 0);
}

function StatCard({ icon, label, value, accent, to }) {
    const inner = (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-100 dark:border-gray-800
            p-5 flex items-center gap-4 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg shadow ${accent}`}>
                <i className={`fa-solid ${icon}`}></i>
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
        </div>
    );
    return to ? <Link href={to}>{inner}</Link> : inner;
}

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

const REASON_LABEL = {
    inappropriate: "Konten tidak pantas",
    spam: "Spam / menyesatkan",
    copyright: "Hak cipta",
    harassment: "Pelecehan",
    other: "Lainnya",
};

export default function AdminDashboard() {
    const { stats, recentUsers, recentTransactions, recentReports } = usePage().props;

    return (
        <AdminLayout
            title="Dashboard"
            icon="fa-gauge-high"
            subtitle="Ringkasan aktivitas seluruh platform DegreeBee"
        >
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-4 mb-8">
                <StatCard icon="fa-users" label="Total Users" value={stats.total_users} accent="bg-[#01A9F2]" to="/admin/users" />
                <StatCard icon="fa-crown" label="Premium Users" value={stats.premium_users} accent="bg-amber-500" to="/admin/users" />
                <StatCard icon="fa-shield-halved" label="Admins" value={stats.admin_users} accent="bg-purple-500" to="/admin/users" />
                <StatCard icon="fa-film" label="Total Videos" value={stats.total_videos} accent="bg-rose-500" to="/admin/videos" />
                <StatCard icon="fa-chalkboard-user" label="Total Classes" value={stats.total_classes} accent="bg-emerald-500" to="/admin/classes" />
                <StatCard icon="fa-clock" label="Study Hours Logged" value={`${stats.study_hours}h`} accent="bg-[#797CFF]" />
                <StatCard icon="fa-flag" label="Pending Reports" value={stats.pending_reports} accent="bg-red-500" to="/admin/reports" />
                <StatCard icon="fa-receipt" label="Transactions" value={stats.total_transactions} accent="bg-cyan-600" to="/admin/transactions" />
                <StatCard icon="fa-sack-dollar" label="Revenue (mock)" value={formatCurrency(stats.total_revenue)} accent="bg-green-600" to="/admin/transactions" />
                <StatCard icon="fa-chart-line" label="Focus Sessions" value={stats.total_focus_logs} accent="bg-indigo-500" />
            </div>

            {recentReports && recentReports.length > 0 && (
                <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur rounded-2xl shadow-md
                    border border-red-200 dark:border-red-900/50 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900 dark:text-white inline-flex items-center gap-2">
                            <i className="fa-solid fa-flag text-red-500"></i> Laporan Menunggu Tinjauan
                        </h2>
                        <Link href="/admin/reports" className="text-xs font-semibold text-[#01A9F2] hover:underline">
                            Kelola semua
                        </Link>
                    </div>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {recentReports.map((r) => (
                            <li key={r.id} className="flex items-center gap-3 py-3">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0
                                    ${r.kind === "video" ? "bg-rose-500" : "bg-emerald-500"}`}>
                                    <i className={`fa-solid ${r.kind === "video" ? "fa-film" : "fa-chalkboard-user"}`}></i>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {r.target?.title || "(Konten dihapus)"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {REASON_LABEL[r.reason] || r.reason}
                                        {r.reporter?.name && <span> · oleh {r.reporter.name}</span>}
                                    </p>
                                </div>
                                <Link
                                    href="/admin/reports"
                                    className="text-xs font-semibold text-red-500 hover:underline shrink-0"
                                >
                                    Tinjau
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent users */}
                <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur rounded-2xl shadow-md
                    border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900 dark:text-white inline-flex items-center gap-2">
                            <i className="fa-solid fa-user-plus text-[#01A9F2]"></i> Pengguna Terbaru
                        </h2>
                        <Link href="/admin/users" className="text-xs font-semibold text-[#01A9F2] hover:underline">
                            Lihat semua
                        </Link>
                    </div>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {recentUsers.map((u) => (
                            <li key={u.id} className="flex items-center gap-3 py-3">
                                {u.avatar_url ? (
                                    <img src={u.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-semibold text-gray-600 dark:text-gray-200">
                                        {(u.name || u.email || "?").charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {u.name || "(Tanpa nama)"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    {u.is_premium && <i className="fa-solid fa-crown text-amber-500 text-xs" title="Premium"></i>}
                                    <RoleBadge role={u.role} />
                                </div>
                            </li>
                        ))}
                        {recentUsers.length === 0 && (
                            <li className="py-6 text-center text-sm text-gray-400">Belum ada pengguna.</li>
                        )}
                    </ul>
                </div>

                <div className="bg-white/90 dark:bg-gray-900/80 backdrop-blur rounded-2xl shadow-md
                    border border-gray-100 dark:border-gray-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-bold text-gray-900 dark:text-white inline-flex items-center gap-2">
                            <i className="fa-solid fa-receipt text-[#01A9F2]"></i> Transaksi Terbaru
                        </h2>
                        <Link href="/admin/transactions" className="text-xs font-semibold text-[#01A9F2] hover:underline">
                            Lihat semua
                        </Link>
                    </div>
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                        {recentTransactions.map((t) => (
                            <li key={t.id} className="flex items-center gap-3 py-3">
                                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-300">
                                    <i className="fa-solid fa-credit-card"></i>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {t.user?.name || t.user?.email || "Unknown"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{t.reference_code}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {t.amount > 0 ? formatCurrency(t.amount) : "-"}
                                    </p>
                                    <p className="text-[11px] capitalize text-gray-400">{t.event}</p>
                                </div>
                            </li>
                        ))}
                        {recentTransactions.length === 0 && (
                            <li className="py-6 text-center text-sm text-gray-400">Belum ada transaksi.</li>
                        )}
                    </ul>
                </div>
            </div>
        </AdminLayout>
    );
}
