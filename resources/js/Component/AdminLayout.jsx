import { Head, Link, usePage, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Logo from "@/assets/images/logo_backgroundless.png";

const NAV = [
    { href: "/admin", icon: "fa-gauge-high", label: "Dashboard" },
    { href: "/admin/users", icon: "fa-users", label: "Users" },
    { href: "/admin/videos", icon: "fa-film", label: "Videos" },
    { href: "/admin/classes", icon: "fa-chalkboard-user", label: "Classes" },
    { href: "/admin/reports", icon: "fa-flag", label: "Reports", badgeKey: "reports" },
    { href: "/admin/transactions", icon: "fa-receipt", label: "Transactions" },
];

export default function AdminLayout({ title, icon, subtitle, actions, children }) {
    const { auth, flash, admin } = usePage().props;
    const currentUrl = usePage().url;
    const user = auth?.user;
    const pendingReports = admin?.pending_reports || 0;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const stored = localStorage.getItem("theme") || "light";
        setTheme(stored);
        document.documentElement.classList.toggle("dark", stored === "dark");
    }, []);

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash?.success, flash?.error]);

    const toggleTheme = () => {
        const next = theme === "light" ? "dark" : "light";
        setTheme(next);
        document.documentElement.classList.toggle("dark", next === "dark");
        localStorage.setItem("theme", next);
    };

    const isActive = (href) =>
        href === "/admin" ? currentUrl === "/admin" : currentUrl.startsWith(href);

    return (
        <>
            <Head title={title ? `${title} · Admin` : "Admin Panel"} />
            <Toaster position="top-right" />

            <div
                className="w-full min-h-screen bg-cover bg-top bg-no-repeat bg-fixed
                bg-[url('/resources/js/assets/Background/Background.jpg')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark.jpg')]"
            >
                {/* Mobile toggle */}
                <button
                    onClick={() => setSidebarOpen((v) => !v)}
                    className="lg:hidden fixed top-4 left-4 z-50 w-11 h-11 rounded-xl bg-white dark:bg-gray-800
                        shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-200"
                    aria-label="Toggle sidebar"
                >
                    <i className={`fa-solid ${sidebarOpen ? "fa-xmark" : "fa-bars"}`}></i>
                </button>

                {/* Backdrop */}
                {sidebarOpen && (
                    <div
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/40 z-30"
                    ></div>
                )}

                {/* Sidebar */}
                <aside
                    className={`fixed top-0 left-0 h-screen w-72 z-40 flex flex-col
                        bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl
                        border-r border-gray-200 dark:border-gray-700 shadow-xl
                        transform transition-transform duration-300
                        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
                >
                    {/* Brand */}
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
                        <Link href="/admin" className="flex items-center gap-3">
                            <img src={Logo} alt="DegreeBee" className="w-10 h-10 object-contain" />
                            <div>
                                <p className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                                    DegreeBee
                                </p>
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider
                                    text-[#01A9F2]">
                                    <i className="fa-solid fa-shield-halved"></i>
                                    Admin Panel
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
                        <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            Management
                        </p>
                        {NAV.map((item) => {
                            const showBadge = item.badgeKey === "reports" && pendingReports > 0;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                                        ${
                                            active
                                                ? "bg-linear-to-r from-[#01A9F2] to-[#797CFF] text-white shadow-md"
                                                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        }`}
                                >
                                    <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                                    {item.label}
                                    {showBadge && (
                                        <span className={`ml-auto min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold
                                            flex items-center justify-center
                                            ${active ? "bg-white/25 text-white" : "bg-red-500 text-white"}`}>
                                            {pendingReports}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}

                        <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

                        <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            Navigation
                        </p>
                        <Link
                            href="/"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            <i className="fa-solid fa-house w-5 text-center"></i>
                            Back to Site
                        </Link>
                        <Link
                            href="/explore"
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            <i className="fa-solid fa-compass w-5 text-center"></i>
                            Explore Videos
                        </Link>
                        <button
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                                text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        >
                            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                            {theme === "light" ? "Dark Mode" : "Light Mode"}
                        </button>
                    </nav>

                    {/* User card */}
                    <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50 dark:bg-gray-800">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-[#01A9F2] text-white flex items-center justify-center font-semibold">
                                    {(user?.name || user?.email || "A").charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                    {user?.name || "Administrator"}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                            </div>
                            <button
                                onClick={() => router.post("/logout")}
                                title="Logout"
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500
                                    hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                            >
                                <i className="fa-solid fa-right-from-bracket"></i>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main content */}
                <main className="lg:pl-72">
                    <div className="px-5 md:px-10 py-8 pt-20 lg:pt-8 max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 dark:text-white inline-flex items-center gap-3">
                                    {icon && <i className={`fa-solid ${icon} text-[#01A9F2]`}></i>}
                                    {title}
                                </h1>
                                {subtitle && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
                                )}
                            </div>
                            {actions}
                        </div>

                        {children}
                    </div>
                </main>
            </div>
        </>
    );
}
