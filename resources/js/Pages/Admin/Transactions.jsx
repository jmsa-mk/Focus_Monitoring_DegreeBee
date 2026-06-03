import { usePage } from "@inertiajs/react";
import AdminLayout from "../../Component/AdminLayout";
import Pagination from "../../Component/AdminPagination";

function formatCurrency(n) {
    if (!n) return "-";
    return "Rp " + new Intl.NumberFormat("id-ID").format(n);
}

function formatDateTime(iso) {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("id-ID", {
        year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
}

function StatusBadge({ status }) {
    const map = {
        completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", icon: "fa-circle-check" },
        pending: { label: "Pending", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300", icon: "fa-clock" },
        failed: { label: "Failed", cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300", icon: "fa-circle-xmark" },
    };
    const m = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${m.cls}`}>
            <i className={`fa-solid ${m.icon}`}></i> {m.label}
        </span>
    );
}

function EventBadge({ event }) {
    const map = {
        subscribe: { label: "Subscribe", icon: "fa-circle-plus", color: "text-[#01A9F2]" },
        renewal: { label: "Renewal", icon: "fa-rotate-right", color: "text-[#797CFF]" },
        cancel: { label: "Cancel", icon: "fa-circle-xmark", color: "text-red-500" },
        refund: { label: "Refund", icon: "fa-rotate-left", color: "text-orange-500" },
    };
    const m = map[event] || { label: event, icon: "fa-circle-info", color: "text-gray-500" };
    return (
        <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${m.color}`}>
            <i className={`fa-solid ${m.icon}`}></i> {m.label}
        </span>
    );
}

export default function AdminTransactions() {
    const { transactions } = usePage().props;
    const data = transactions?.data || [];

    return (
        <AdminLayout
            title="Transactions"
            icon="fa-receipt"
            subtitle={`${transactions.total} transaksi langganan tercatat`}
        >
            <div className="bg-white/95 dark:bg-gray-900/85 backdrop-blur rounded-2xl shadow-md
                border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                            <tr>
                                <th className="text-left px-4 py-3 font-semibold">User</th>
                                <th className="text-left px-4 py-3 font-semibold">Reference</th>
                                <th className="text-left px-4 py-3 font-semibold">Event</th>
                                <th className="text-left px-4 py-3 font-semibold">Plan</th>
                                <th className="text-right px-4 py-3 font-semibold">Amount</th>
                                <th className="text-center px-4 py-3 font-semibold">Status</th>
                                <th className="text-left px-4 py-3 font-semibold">Tanggal</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((t) => (
                                <tr key={t.id} className="border-t border-gray-100 dark:border-gray-800
                                    hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                                    <td className="px-4 py-3">
                                        <p className="font-medium text-gray-900 dark:text-white truncate">
                                            {t.user?.name || "(Tanpa nama)"}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{t.user?.email}</p>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{t.reference_code}</td>
                                    <td className="px-4 py-3"><EventBadge event={t.event} /></td>
                                    <td className="px-4 py-3 capitalize text-gray-700 dark:text-gray-200">{t.plan || "-"}</td>
                                    <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(t.amount)}
                                    </td>
                                    <td className="px-4 py-3 text-center"><StatusBadge status={t.status} /></td>
                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{formatDateTime(t.created_at)}</td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                                        <i className="fa-solid fa-receipt text-4xl mb-3 block"></i>
                                        Belum ada transaksi.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination links={transactions.links} />
            </div>
        </AdminLayout>
    );
}
