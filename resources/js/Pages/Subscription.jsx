import { Head, Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import toast, { Toaster } from "react-hot-toast";

function formatCurrency(n) {
    return "Rp " + new Intl.NumberFormat("id-ID").format(n) + ",00";
}

function formatDate(iso) {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export default function Subscription() {
    const { component, props } = usePage();
    const { plans, auth, flash } = props;
    const user = auth?.user;

    const [confirmPlan, setConfirmPlan] = useState(null);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
    }, [flash?.success]);

    const currentTier = user?.subscription_tier || "free";
    const isPremium = user?.is_premium === true;
    const daysLeft = user?.subscription_days_left;
    const expiresAt = user?.subscription_expires_at;

    const handleSubscribe = (plan) => {
        if (!user) {
            router.get("/login");
            return;
        }
        setConfirmPlan(plan);
    };

    const confirmSubscribe = () => {
        if (!confirmPlan || processing) return;
        setProcessing(true);
        router.post(
            "/subscription/subscribe",
            { plan: confirmPlan },
            {
                preserveScroll: true,
                onSuccess: () => setConfirmPlan(null),
                onFinish: () => setProcessing(false),
            }
        );
    };

    const handleCancel = () => {
        if (processing) return;
        setProcessing(true);
        router.post(
            "/subscription/cancel",
            {},
            {
                preserveScroll: true,
                onSuccess: () => setConfirmCancel(false),
                onFinish: () => setProcessing(false),
            }
        );
    };

    return (
        <>
            <Head>
                <title>{component}</title>
            </Head>

            <div
                className="w-full min-h-screen bg-cover bg-top bg-no-repeat
                bg-[url('/resources/js/assets/Background/Background.jpg')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark.jpg')]"
            >
                <Navbar />
                <Toaster position="top-right" />

                <section className="w-full flex justify-center px-6 py-20">
                    <div className="w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-10 md:p-16 dark:bg-gray-900/70">

                        <h1 className="text-center text-4xl font-bold text-gray-900 mb-4 dark:text-white">
                            Premium
                        </h1>
                        <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
                            Upgrade untuk membuka semua fitur DegreeBee tanpa batas.
                        </p>

                        {user && (
                            <div className={`mb-12 rounded-2xl p-5 border-2 flex flex-col md:flex-row items-start md:items-center justify-between gap-4
                                ${isPremium
                                    ? "border-[#01A9F2] bg-[#BAFFFE]/30 dark:bg-[#172D9D]/30 dark:border-[#797CFF]"
                                    : "border-gray-300 bg-gray-50 dark:bg-gray-800 dark:border-gray-700"
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl
                                        ${isPremium
                                            ? "bg-linear-to-br from-[#00E2E0] to-[#797CFF] text-white"
                                            : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                        }`}
                                    >
                                        <i className={isPremium ? "fa-solid fa-crown" : "fa-solid fa-user"}></i>
                                    </div>
                                    <div>
                                        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">
                                            Current Plan
                                        </div>
                                        <div className="font-bold text-lg text-gray-900 dark:text-white">
                                            {user.subscription_label}
                                        </div>
                                        {isPremium && (
                                            <div className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                                                Berlaku sampai {formatDate(expiresAt)}
                                                <span className="ml-2 px-2 py-0.5 rounded-full bg-[#01A9F2]/10 text-[#01A9F2] text-[10px] font-semibold">
                                                    {daysLeft} hari lagi
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isPremium && (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmCancel(true)}
                                        disabled={processing}
                                        className="px-4 py-2 rounded-lg text-sm font-semibold
                                            text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700
                                            hover:bg-red-50 dark:hover:bg-red-900/20 transition
                                            disabled:opacity-40 inline-flex items-center gap-2"
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                        Cancel Subscription
                                    </button>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                            <PlanCard
                                title="Free"
                                price={formatCurrency(0)}
                                period="/mo"
                                features={[
                                    "Limited Focus Monitoring",
                                    "Akses semua video komunitas",
                                    "Bookmark video",
                                    "Komentar di video",
                                ]}
                                isCurrent={currentTier === "free"}
                                actionLabel={currentTier === "free" ? "Currently Owned" : null}
                                disabled
                            />

                            <PlanCard
                                title="Monthly"
                                price={formatCurrency(plans?.monthly?.price ?? 50000)}
                                period="/mo"
                                features={[
                                    "Unlimited Focus Monitoring",
                                    "Dashboard Focus Progress lengkap",
                                    "Classes management tanpa batas",
                                    "Eye Tracking + Virtual Background",
                                    "Question Bank tanpa batas",
                                ]}
                                isCurrent={currentTier === "monthly" && isPremium}
                                actionLabel={
                                    currentTier === "monthly" && isPremium
                                        ? "Currently Owned"
                                        : "Buy Now!"
                                }
                                onClick={() => handleSubscribe("monthly")}
                                disabled={currentTier === "monthly" && isPremium}
                            />

                            <PlanCard
                                title="Yearly"
                                price={formatCurrency(plans?.yearly?.price ?? 400000)}
                                period="/year"
                                subnote="Hemat Rp 200.000 per tahun"
                                features={[
                                    "Unlimited Focus Monitoring",
                                    "Dashboard Focus Progress lengkap",
                                    "Classes management tanpa batas",
                                    "Eye Tracking + Virtual Background",
                                    "Question Bank tanpa batas",
                                    "Priority support",
                                ]}
                                highlight
                                isCurrent={currentTier === "yearly" && isPremium}
                                actionLabel={
                                    currentTier === "yearly" && isPremium
                                        ? "Currently Owned"
                                        : "Buy Now!"
                                }
                                onClick={() => handleSubscribe("yearly")}
                                disabled={currentTier === "yearly" && isPremium}
                            />
                        </div>

                        <div className="mt-16 max-w-3xl mx-auto">
                            <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                                Pertanyaan yang sering ditanyakan
                            </h2>
                            <div className="space-y-3">
                                <FaqItem
                                    q="Bisakah saya membatalkan kapan saja?"
                                    a="Ya, kamu bisa membatalkan subscription kapan saja dari halaman ini. Akses Premium akan langsung berhenti setelah cancel."
                                />
                                <FaqItem
                                    q="Apa yang membedakan Free dan Premium?"
                                    a="Free Plan mendapat akses dasar dengan batasan pada Focus Monitoring (durasi terbatas) dan beberapa fitur lanjutan seperti Eye Tracking. Premium membuka semua fitur tanpa batas."
                                />
                                <FaqItem
                                    q="Apakah pembayaran aman?"
                                    a="Saat ini DegreeBee dalam tahap PKM-KC, jadi pembayaran disimulasi tanpa transaksi nyata. Versi production akan menggunakan payment gateway resmi (Midtrans/Xendit) dengan enkripsi end-to-end."
                                />
                                <FaqItem
                                    q="Bagaimana jika saya upgrade dari Monthly ke Yearly?"
                                    a="Sisa hari di Monthly akan otomatis dijumlahkan dengan masa Yearly, jadi tidak ada hari yang terbuang."
                                />
                            </div>
                        </div>
                    </div>
                </section>

                <Footer />

                {confirmPlan && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => !processing && setConfirmPlan(null)}
                    >
                        <div
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md
                                border border-gray-200 dark:border-gray-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="text-center mb-5">
                                    <div className="w-16 h-16 mx-auto rounded-full bg-linear-to-br from-[#00E2E0] to-[#797CFF] flex items-center justify-center text-white text-2xl mb-3">
                                        <i className="fa-solid fa-crown"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        Confirm Subscription
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Kamu akan berlangganan paket {plans?.[confirmPlan]?.label}
                                    </p>
                                </div>

                                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-5 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">Paket</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {plans?.[confirmPlan]?.label}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-300">Durasi</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {plans?.[confirmPlan]?.duration_days} hari
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-300">Total</span>
                                        <span className="font-bold text-lg text-[#01A9F2] dark:text-[#797CFF]">
                                            {formatCurrency(plans?.[confirmPlan]?.price ?? 0)}
                                        </span>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 text-center italic">
                                    Demo mode: pembayaran disimulasi, tidak ada transaksi nyata.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setConfirmPlan(null)}
                                        disabled={processing}
                                        className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600
                                            text-gray-700 dark:text-gray-200
                                            hover:bg-gray-100 dark:hover:bg-gray-800 font-semibold
                                            disabled:opacity-40"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={confirmSubscribe}
                                        disabled={processing}
                                        className="flex-1 py-3 rounded-xl text-white font-semibold
                                            bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                            dark:from-[#213A58] dark:to-[#172D9D]
                                            shadow-md hover:opacity-90 transition
                                            disabled:opacity-40 disabled:cursor-not-allowed
                                            inline-flex items-center justify-center gap-2"
                                    >
                                        {processing ? (
                                            <><i className="fa-solid fa-spinner fa-spin"></i>Processing</>
                                        ) : (
                                            <><i className="fa-solid fa-credit-card"></i>Confirm & Pay</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {confirmCancel && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => !processing && setConfirmCancel(false)}
                    >
                        <div
                            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm
                                border border-gray-200 dark:border-gray-700 p-6 text-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-2xl text-red-600 dark:text-red-400 mb-3">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Batalkan Premium?
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                                Akses fitur Premium akan langsung berhenti dan kamu kembali ke Free Plan.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setConfirmCancel(false)}
                                    disabled={processing}
                                    className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600
                                        text-gray-700 dark:text-gray-200
                                        hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-semibold
                                        disabled:opacity-40"
                                >
                                    Keep Premium
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={processing}
                                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white
                                        rounded-xl text-sm font-semibold disabled:opacity-40
                                        inline-flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <><i className="fa-solid fa-spinner fa-spin"></i>...</>
                                    ) : (
                                        "Cancel"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

function PlanCard({
    title,
    price,
    period,
    subnote,
    features,
    highlight = false,
    isCurrent = false,
    actionLabel,
    onClick,
    disabled = false,
}) {
    if (highlight) {
        return (
            <div className="rounded-3xl border-2 border-[#797CFF] dark:border-[#172D9D] overflow-hidden shadow-lg flex flex-col">
                <div className="bg-[#797CFF] dark:bg-[#172D9D] text-white text-center py-3 font-semibold text-sm">
                    <i className="fa-solid fa-star mr-1"></i>
                    Most Popular!
                </div>
                <div className="bg-linear-to-br from-[#BAFFFE] to-[#797CFF]/40 dark:from-[#213A58] dark:to-[#172D9D] p-10 text-center flex-1 flex flex-col">
                    <h2 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                        {title}
                    </h2>
                    <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                        {price}
                    </p>
                    <p className="text-gray-900 dark:text-white text-sm font-bold">
                        {period}
                    </p>
                    {subnote && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 mb-2">
                            {subnote}
                        </p>
                    )}
                    {actionLabel && (
                        <button
                            type="button"
                            onClick={onClick}
                            disabled={disabled}
                            className={`mx-auto mt-6 mb-8 px-6 py-2 rounded-full text-sm font-semibold shadow-md transition
                                ${isCurrent
                                    ? "bg-linear-to-r from-[#01A9F2] to-[#00E2E0] text-white cursor-default"
                                    : "bg-white hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white text-gray-900"
                                }
                                disabled:opacity-60 disabled:cursor-not-allowed`}
                        >
                            {isCurrent && <i className="fa-solid fa-check mr-1"></i>}
                            {actionLabel}
                        </button>
                    )}
                    <ul className="text-gray-800 dark:text-white text-sm space-y-3 text-left">
                        {features.map((f) => (
                            <li key={f} className="flex items-start gap-3">
                                <i className="fa-solid fa-check text-[#01A9F2] mt-0.5"></i>
                                <span>{f}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-gray-300 dark:border-gray-700 p-10 text-center shadow-sm dark:bg-gray-800 flex flex-col">
            <h2 className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">
                {title}
            </h2>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                {price}
            </p>
            <p className="text-gray-900 dark:text-white text-sm font-bold mb-2">
                {period}
            </p>
            {subnote && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{subnote}</p>
            )}
            {actionLabel && (
                <button
                    type="button"
                    onClick={onClick}
                    disabled={disabled}
                    className={`mx-auto mt-6 mb-8 px-6 py-2 rounded-full text-sm font-semibold shadow-md transition
                        ${isCurrent
                            ? "bg-linear-to-r from-[#01A9F2] to-[#00E2E0] text-white cursor-default"
                            : "bg-linear-to-r from-[#00E2E0] to-[#797CFF] dark:from-[#213A58] dark:to-[#172D9D] text-white hover:opacity-90"
                        }
                        disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                    {isCurrent && <i className="fa-solid fa-check mr-1"></i>}
                    {actionLabel}
                </button>
            )}
            <ul className="text-gray-600 dark:text-white text-sm space-y-3 text-left flex-1">
                {features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                        <i className="fa-solid fa-check text-[#01A9F2] mt-0.5"></i>
                        <span>{f}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full px-5 py-4 text-left flex items-center justify-between gap-3
                    hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
            >
                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                    {q}
                </span>
                <i className={`fa-solid fa-chevron-down transition-transform text-gray-500 dark:text-gray-400
                    ${open ? "rotate-180" : ""}`}></i>
            </button>
            {open && (
                <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {a}
                </div>
            )}
        </div>
    );
}
