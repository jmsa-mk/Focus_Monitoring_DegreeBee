import { Head, Link, usePage, useForm, router } from "@inertiajs/react";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import ForumSection from "../Component/ForumSection";
import NotesSection from "../Component/NotesSection";
import QuestionBankSection from "../Component/QuestionBankSection";
import ReportModal from "../Component/ReportModal";

import Logo from "@/assets/images/logo_backgroundless.png";

export default function ClassDetail() {
    const [activeTab, setActiveTab] = useState("description");
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [reportModalOpen, setReportModalOpen] = useState(false);

    const { class: classData, isCreator, isEnrolled, forumPosts, notes, questionBankFiles, auth } = usePage().props;
    const user = auth?.user;

    const { data, setData, post, processing, reset } = useForm({
        youtube_link: "",
        topic: "",
        notes: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/classes/${classData.id}/videos`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setMobileSidebarOpen(false);
    };

    function getYoutubeId(link) {
        try {
            const url = new URL(link);
            if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
            if (url.pathname.includes("/shorts/")) return url.pathname.split("/shorts/")[1];
            if (url.pathname.includes("/live/")) return url.pathname.split("/live/")[1];
            return url.searchParams.get("v");
        } catch {
            return null;
        }
    }

    const inputCls =
        "w-full mb-4 px-4 py-3 rounded-xl border " +
        "bg-white text-gray-900 placeholder-gray-400 " +
        "dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 " +
        "focus:outline-none focus:ring-2 focus:ring-[#01A9F2]";

    const TABS = [
        { id: "description", label: "Description", icon: "fa-circle-info" },
        { id: "resources", label: "Learning Resources", icon: "fa-graduation-cap" },
        { id: "forum", label: "Forum", icon: "fa-comments" },
        { id: "notes", label: "Notes", icon: "fa-note-sticky" },
        { id: "questionBank", label: "Question Bank", icon: "fa-folder-open" },
    ];

    return (
        <>
            <Head>
                <title>{classData.title}</title>
            </Head>

            <div
                className="w-full min-h-screen bg-cover bg-top bg-no-repeat
                bg-[url('/resources/js/assets/Background/Background.jpg')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark.jpg')]"
            >
                <Toaster position="top-right" />

                <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(true)}
                    className="lg:hidden fixed top-4 left-4 z-40 w-11 h-11
                        bg-white dark:bg-gray-800 rounded-xl shadow-lg
                        flex items-center justify-center text-gray-700 dark:text-gray-200"
                    aria-label="Open menu"
                >
                    <i className="fa-solid fa-bars"></i>
                </button>

                {mobileSidebarOpen && (
                    <div
                        onClick={() => setMobileSidebarOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    />
                )}

                <aside
                    className={`fixed top-0 left-0 h-full w-72 z-50
                        bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
                        border-r border-gray-200 dark:border-gray-800
                        flex flex-col
                        transform transition-transform duration-300
                        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                        lg:translate-x-0`}
                >
                    <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3">
                            <img src={Logo} alt="DegreeBee" className="w-9 h-9 object-contain" />
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                DegreeBee
                            </span>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMobileSidebarOpen(false)}
                            className="lg:hidden w-8 h-8 rounded-md flex items-center justify-center
                                text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                            aria-label="Close menu"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                        <div>
                            <h3 className="px-2 text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 mb-2">
                                Navigation
                            </h3>
                            <NavItem href="/" icon="fa-house" label="Home" />
                            <NavItem href="/classes" icon="fa-layer-group" label="My Classes" />
                        </div>

                        <div>
                            <h3 className="px-2 text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 mb-2">
                                Overview
                            </h3>

                            <div className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 mb-3">
                                <div className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 font-semibold">
                                    Class
                                </div>
                                <div className="font-bold text-sm text-gray-900 dark:text-white truncate">
                                    {classData.title}
                                </div>
                            </div>

                            <div className="space-y-1">
                                {TABS.map((t) => (
                                    <TabButton
                                        key={t.id}
                                        active={activeTab === t.id}
                                        onClick={() => handleTabClick(t.id)}
                                        icon={t.icon}
                                        label={t.label}
                                    />
                                ))}
                            </div>
                        </div>

                        {(isCreator || isEnrolled) && (
                            <div>
                                <h3 className="px-2 text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 mb-2">
                                    Actions
                                </h3>
                                <div className="space-y-1">
                                    {isCreator && (
                                        <>
                                            <Link
                                                href={`/classes/${classData.id}/edit`}
                                                className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                                                    text-[#01A9F2] dark:text-[#797CFF] font-semibold text-sm
                                                    hover:bg-[#BAFFFE]/30 dark:hover:bg-[#172D9D]/30 transition"
                                            >
                                                <i className="fa-solid fa-pen w-5"></i>
                                                Edit Class
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={() => setDeleteModalOpen(true)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                                    text-red-500 font-semibold text-sm text-left
                                                    hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                            >
                                                <i className="fa-solid fa-trash w-5"></i>
                                                Delete Class
                                            </button>
                                        </>
                                    )}
                                    {!isCreator && isEnrolled && (
                                        <button
                                            type="button"
                                            onClick={() => router.delete(`/classes/${classData.id}/unenroll`)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                                text-red-500 font-semibold text-sm text-left
                                                hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                        >
                                            <i className="fa-solid fa-right-from-bracket w-5"></i>
                                            Unenroll
                                        </button>
                                    )}
                                    {!isCreator && (
                                        <button
                                            type="button"
                                            onClick={() => setReportModalOpen(true)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                                text-gray-500 dark:text-gray-400 font-semibold text-sm text-left
                                                hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition"
                                        >
                                            <i className="fa-regular fa-flag w-5"></i>
                                            Report Class
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {user && (
                        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
                            <Link
                                href="/profile"
                                className="flex items-center gap-3 px-2 py-2 rounded-xl
                                    hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                            >
                                {user.avatar_url ? (
                                    <img
                                        src={user.avatar_url}
                                        alt={user.name}
                                        className="w-9 h-9 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-500 dark:text-gray-300">
                                        {(user.name || user.email || "?").charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white truncate inline-flex items-center gap-1">
                                        {user.name || "Unnamed"}
                                        {user.is_premium && (
                                            <i className="fa-solid fa-crown text-yellow-500 text-xs"></i>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                        {user.email}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}
                </aside>

                <main className="lg:pl-72 min-h-screen">
                    <section className="px-6 py-10 lg:py-16">
                        <div className="max-w-6xl mx-auto bg-white/85 backdrop-blur-md rounded-3xl shadow-xl p-8 md:p-12
                            dark:bg-gray-900/70 border border-white/40 dark:border-gray-700">

                            {activeTab === "description" && (
                                <>
                                    <div className="flex items-center gap-3 mb-6">
                                        <i className="fa-solid fa-circle-info text-[#01A9F2] text-2xl"></i>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            Description
                                        </h1>
                                    </div>

                                    {classData.thumbnail_url && (
                                        <img
                                            src={classData.thumbnail_url}
                                            alt={classData.title}
                                            className="w-full h-72 object-cover rounded-3xl mb-8 shadow-lg"
                                        />
                                    )}

                                    <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                                        {classData.title}
                                    </h2>

                                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed whitespace-pre-wrap">
                                        {classData.description}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                            <h3 className="font-bold text-gray-900 dark:text-white inline-flex items-center gap-2 mb-2">
                                                <i className="fa-solid fa-user text-[#01A9F2]"></i>
                                                Creator
                                            </h3>
                                            <div className="flex items-center gap-3">
                                                {classData.creator?.avatar_url ? (
                                                    <img
                                                        src={classData.creator.avatar_url}
                                                        alt={classData.creator?.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center font-bold text-gray-600 dark:text-gray-300">
                                                        {(classData.creator?.name || "?").charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <span className="text-gray-700 dark:text-gray-200 font-medium">
                                                    {classData.creator?.name}
                                                </span>
                                            </div>
                                        </div>

                                        {classData.code && isCreator && (
                                            <div className="p-4 rounded-2xl bg-linear-to-br from-[#BAFFFE] to-[#797CFF]/30
                                                dark:from-[#213A58] dark:to-[#172D9D]
                                                border border-[#01A9F2]/30">
                                                <h3 className="font-bold text-gray-900 dark:text-white inline-flex items-center gap-2 mb-2">
                                                    <i className="fa-solid fa-key text-[#01A9F2] dark:text-[#797CFF]"></i>
                                                    Class Code
                                                </h3>
                                                <p className="font-mono text-2xl tracking-widest font-bold text-gray-900 dark:text-white">
                                                    {classData.code}
                                                </p>
                                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                                                    Bagikan kode ini ke anggota
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            {activeTab === "resources" && (
                                <>
                                    <div className="flex items-center gap-3 mb-8">
                                        <i className="fa-solid fa-graduation-cap text-[#01A9F2] text-2xl"></i>
                                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                            Learning Resources
                                        </h1>
                                    </div>

                                    <form
                                        onSubmit={handleSubmit}
                                        className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
                                    >
                                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white inline-flex items-center gap-2">
                                            <i className="fa-solid fa-plus text-[#01A9F2]"></i>
                                            Add Resource
                                        </h2>

                                        <input
                                            type="text"
                                            placeholder="YouTube Link"
                                            value={data.youtube_link}
                                            onChange={(e) => setData("youtube_link", e.target.value)}
                                            className={inputCls}
                                        />

                                        <input
                                            type="text"
                                            placeholder="Topic"
                                            value={data.topic}
                                            onChange={(e) => setData("topic", e.target.value)}
                                            className={inputCls}
                                        />

                                        <textarea
                                            placeholder="Notes"
                                            value={data.notes}
                                            onChange={(e) => setData("notes", e.target.value)}
                                            className={inputCls + " resize-none"}
                                        />

                                        <button
                                            disabled={processing}
                                            className="px-6 py-3 bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                                dark:from-[#213A58] dark:to-[#172D9D]
                                                text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
                                        >
                                            {processing ? "Adding..." : "Add Resource"}
                                        </button>
                                    </form>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {classData.videos?.length === 0 && (
                                            <p className="text-gray-500 dark:text-gray-400 col-span-full text-center py-10">
                                                No learning resources yet.
                                            </p>
                                        )}

                                        {classData.videos?.map((video) => {
                                            const id = getYoutubeId(video.youtube_link);
                                            return (
                                                <div
                                                    key={video.id}
                                                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden
                                                        border border-gray-200 dark:border-gray-700
                                                        hover:shadow-2xl hover:border-[#01A9F2] dark:hover:border-[#797CFF]
                                                        hover:-translate-y-1 transition-all duration-300"
                                                >
                                                    <div className="w-full aspect-video bg-black overflow-hidden">
                                                        <img
                                                            src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                                                            className="w-full h-full object-cover cursor-pointer
                                                                group-hover:scale-110 transition-transform duration-500"
                                                            onClick={() => router.get(`/videos/${video.id}`)}
                                                        />
                                                    </div>

                                                    <div className="p-5 relative">
                                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                                            {video.topic}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                                            {video.notes}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                            Recommender: {video.user?.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}

                            {activeTab === "forum" && (
                                <ForumSection
                                    posts={forumPosts || []}
                                    classId={classData.id}
                                    currentUserId={auth?.user?.id}
                                />
                            )}

                            {activeTab === "notes" && (
                                <NotesSection
                                    notes={notes || []}
                                    classId={classData.id}
                                    currentUserId={auth?.user?.id}
                                />
                            )}

                            {activeTab === "questionBank" && (
                                <QuestionBankSection
                                    files={questionBankFiles || []}
                                    classId={classData.id}
                                    currentUserId={auth?.user?.id}
                                />
                            )}
                        </div>
                    </section>
                </main>

                {deleteModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center
                            border border-gray-200 dark:border-gray-700">
                            <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-2xl text-red-600 dark:text-red-400 mb-3">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                                Delete Class?
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setDeleteModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        router.delete(`/classes/${classData.id}`, {
                                            onSuccess: () => setDeleteModalOpen(false),
                                        });
                                    }}
                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {reportModalOpen && (
                    <ReportModal
                        type="class"
                        id={classData.id}
                        title={classData.title}
                        onClose={() => setReportModalOpen(false)}
                    />
                )}
            </div>
        </>
    );
}

function NavItem({ href, icon, label }) {
    return (
        <Link
            href={href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                text-gray-700 dark:text-gray-200 text-sm font-medium
                hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
            <i className={`fa-solid ${icon} w-5 text-gray-500 dark:text-gray-400`}></i>
            {label}
        </Link>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition
                ${active
                    ? "bg-linear-to-r from-[#00E2E0]/30 to-[#797CFF]/30 dark:from-[#213A58] dark:to-[#172D9D] text-[#01A9F2] dark:text-white border border-[#01A9F2]/30 dark:border-[#797CFF]/50 shadow-sm"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
        >
            <i className={`fa-solid ${icon} w-5 ${active ? "text-[#01A9F2] dark:text-[#797CFF]" : "text-gray-500 dark:text-gray-400"}`}></i>
            {label}
        </button>
    );
}
