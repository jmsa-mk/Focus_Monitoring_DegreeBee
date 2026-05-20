import { Head, Link, router, usePage } from "@inertiajs/react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";

function formatCurrency(n) {
    if (!n) return "Rp 0,00";
    return "Rp " + new Intl.NumberFormat("id-ID").format(n) + ",00";
}

function formatDateTime(iso) {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("id-ID", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function StatusBadge({ status }) {
    const map = {
        completed: {
            label: "Completed",
            cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
            icon: "fa-circle-check",
        },
        pending: {
            label: "Pending",
            cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
            icon: "fa-clock",
        },
        failed: {
            label: "Failed",
            cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
            icon: "fa-circle-xmark",
        },
    };
    const m = map[status] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${m.cls}`}>
            <i className={`fa-solid ${m.icon}`}></i>
            {m.label}
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
            <i className={`fa-solid ${m.icon}`}></i>
            {m.label}
        </span>
    );
}

export default function TransactionHistory() {
    const { transactions } = usePage().props;
    const data = transactions?.data || [];
    const currentPage = transactions?.current_page || 1;
    const lastPage = transactions?.last_page || 1;

    const goToPage = (p) => {
        if (p < 1 || p > lastPage || p === currentPage) return;
        router.get(
            "/subscription/transactions",
            { page: p },
            { preserveScroll: true, preserveState: true }
        );
    };

    return (
        <>
            <Head>
                <title>Riwayat Transaksi</title>
            </Head>

            <div
                className="w-full min-h-screen bg-cover bg-top bg-no-repeat
                bg-[url('/resources/js/assets/Background/Background.jpg')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark.jpg')]"
            >
                <Navbar />

                <section className="w-full flex justify-center px-6 py-10">
                    <div className="w-full max-w-7xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl
                        p-8 md:p-12 dark:bg-gray-900/70 border border-white/40 dark:border-gray-700">

                        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white inline-flex items-center gap-3">
                                    <i className="fa-solid fa-receipt text-[#01A9F2]"></i>
                                    Riwayat Transaksi
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Semua transaksi langganan kamu ditampilkan di sini
                                </p>
                            </div>
                            <Link
                                href="/premium"
                                className="px-4 py-2 rounded-lg text-sm font-semibold
                                    border border-[#01A9F2] text-[#01A9F2]
                                    hover:bg-[#01A9F2] hover:text-white transition
                                    inline-flex items-center gap-2"
                            >
                                <i className="fa-solid fa-arrow-left"></i>
                                Kembali ke Premium
                            </Link>
                        </div>

                        {data.length === 0 ? (
                            <div className="text-center py-20 text-gray-500 dark:text-gray-400">
                                <i className="fa-solid fa-receipt text-7xl mb-4 text-gray-300 dark:text-gray-600"></i>
                                <p className="text-lg font-medium">Belum ada transaksi</p>
                                <p className="text-sm mt-1">
                                    Riwayat transaksi akan muncul setelah kamu berlangganan paket Premium.
                                </p>
                                <Link
                                    href="/premium"
                                    className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl
                                        bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                        dark:from-[#213A58] dark:to-[#172D9D]
                                        text-white text-sm font-semibold shadow-md hover:opacity-90"
                                >
                                    <i className="fa-solid fa-crown"></i>
                                    Lihat Paket Premium
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                                            <tr>
                                                <th className="text-left px-4 py-3 font-semibold">Reference</th>
                                                <th className="text-left px-4 py-3 font-semibold">Event</th>
                                                <th className="text-left px-4 py-3 font-semibold">Plan</th>
                                                <th className="text-right px-4 py-3 font-semibold">Amount</th>
                                                <th className="text-center px-4 py-3 font-semibold">Status</th>
                                                <th className="text-left px-4 py-3 font-semibold">Payment Method</th>
                                                <th className="text-left px-4 py-3 font-semibold">Tanggal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-900">
                                            {data.map((t) => (
                                                <tr
                                                    key={t.id}
                                                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                                                >
                                                    <td className="px-4 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                                                        {t.reference_code}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <EventBadge event={t.event} />
                                                    </td>
                                                    <td className="px-4 py-3 capitalize text-gray-700 dark:text-gray-200">
                                                        {t.plan || "-"}
                                                    </td>
                                                    <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-semibold">
                                                        {t.amount > 0 ? formatCurrency(t.amount) : "-"}
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <StatusBadge status={t.status} />
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <i className="fa-solid fa-credit-card text-gray-400"></i>
                                                            {t.payment_method === "mock_payment"
                                                                ? "Mock Payment"
                                                                : t.payment_method}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                                                        {formatDateTime(t.created_at)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {lastPage > 1 && (
                                    <div className="flex items-center justify-between mt-5">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Menampilkan halaman <strong>{currentPage}</strong> dari {lastPage}
                                            <span className="ml-2">
                                                ({transactions.total} total transaksi)
                                            </span>
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => goToPage(currentPage - 1)}
                                                disabled={currentPage <= 1}
                                                className="px-4 py-2 rounded-lg text-sm font-medium
                                                    text-gray-700 dark:text-gray-200
                                                    bg-gray-100 dark:bg-gray-800
                                                    hover:bg-gray-200 dark:hover:bg-gray-700
                                                    disabled:opacity-40 disabled:cursor-not-allowed
                                                    inline-flex items-center gap-2 transition"
                                            >
                                                <i className="fa-solid fa-chevron-left"></i>
                                                Prev
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => goToPage(currentPage + 1)}
                                                disabled={currentPage >= lastPage}
                                                className="px-4 py-2 rounded-lg text-sm font-medium
                                                    text-gray-700 dark:text-gray-200
                                                    bg-gray-100 dark:bg-gray-800
                                                    hover:bg-gray-200 dark:hover:bg-gray-700
                                                    disabled:opacity-40 disabled:cursor-not-allowed
                                                    inline-flex items-center gap-2 transition"
                                            >
                                                Next
                                                <i className="fa-solid fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}
