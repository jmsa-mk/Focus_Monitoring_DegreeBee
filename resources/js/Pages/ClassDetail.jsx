import { Head, Link, usePage, useForm, router } from "@inertiajs/react";
import { useState } from "react";
import Navbar from "../Component/Navbar";
import ForumSection from "../Component/ForumSection";

export default function ClassDetail() {
    const [activeTab, setActiveTab] = useState("description");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const { class: classData, isCreator, isEnrolled, forumPosts, auth } = usePage().props;

    const { data, setData, post, processing, reset } = useForm({
        youtube_link: "",
        topic: "",
        notes: "",
    });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        post(`/classes/${classData.id}/videos`, {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setSidebarOpen(false);
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

    const inputCls = "w-full mb-4 px-4 py-3 rounded-xl border " +
        "bg-white text-gray-900 placeholder-gray-400 " +
        "dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 " +
        "focus:outline-none focus:ring-2 focus:ring-[#01A9F2]";

    return (
        <>
            <Head>
                <title>{classData.title}</title>
            </Head>

            <div
                className="w-full min-h-screen bg-cover bg-top bg-no-repeat relative
                bg-[url('/resources/js/assets/Background/Background2.png')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark2.png')]"
            >
                <Navbar />

                {/* TOGGLE BUTTON */}
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="fixed top-24 left-6 z-40 bg-white dark:bg-gray-800 dark:text-white shadow-md px-4 py-2 rounded-xl"
                >
                    <i className="fa-solid fa-floppy-disk"></i>
                </button>

                {/* OVERLAY */}
                {sidebarOpen && (
                    <div
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/40 z-30"
                    />
                )}

                {/* SIDEBAR */}
                <div
                    className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl z-40 p-8 transform transition-transform duration-300 border-r border-gray-200 dark:border-gray-700 ${
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Overview</h2>

                    <button
                        onClick={() => handleTabClick("description")}
                        className="block mb-4 font-semibold text-gray-900 dark:text-white hover:text-[#01A9F2] dark:hover:text-[#01A9F2]"
                    >
                        Description
                    </button>

                    <button
                        onClick={() => handleTabClick("resources")}
                        className="block mb-4 font-semibold text-gray-900 dark:text-white hover:text-[#01A9F2] dark:hover:text-[#01A9F2]"
                    >
                        Learning Resources
                    </button>

                    <button
                        onClick={() => handleTabClick("forum")}
                        className="block mb-4 font-semibold text-gray-900 dark:text-white hover:text-[#01A9F2] dark:hover:text-[#01A9F2]"
                    >
                        Forum
                    </button>

                    <button className="block mb-4 font-semibold text-gray-400 dark:text-gray-500">
                        Notes
                    </button>

                    <button className="block font-semibold text-gray-400 dark:text-gray-500">
                        Question Bank
                    </button>

                    <hr className="my-6 border-gray-200 dark:border-gray-700" />

                    {isCreator && (
                        <>
                            <Link
                                href={`/classes/${classData.id}/edit`}
                                className="block mb-4 font-semibold text-[#01A9F2] hover:text-[#00E2E0]"
                            >
                                Edit Class
                            </Link>

                            <button
                                onClick={() => {
                                    setDeleteModalOpen(true);
                                    setSidebarOpen(false);
                                }}
                                className="block w-full text-left text-red-500 font-semibold hover:text-red-600"
                            >
                                Delete Class
                            </button>
                        </>
                    )}

                    {!isCreator && isEnrolled && (
                        <button
                            onClick={() => {
                                router.delete(`/classes/${classData.id}/unenroll`);
                                setSidebarOpen(false);
                            }}
                            className="w-full text-left text-red-500 font-semibold hover:text-red-600"
                        >
                            Unenroll
                        </button>
                    )}
                </div>

                <section className="w-full flex justify-center px-6 py-16">
                    <div className="w-full max-w-7xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-10
                        dark:bg-gray-900/70">

                        {activeTab === "description" && (
                            <>
                                <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
                                    Description
                                </h1>

                                {classData.thumbnail_url && (
                                    <img
                                        src={classData.thumbnail_url}
                                        alt={classData.title}
                                        className="w-full h-72 object-cover rounded-3xl mb-8"
                                    />
                                )}

                                <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                                    {classData.title}
                                </h2>

                                <p className="text-gray-600 dark:text-gray-300 mb-6">
                                    {classData.description}
                                </p>

                                <h3 className="font-bold text-gray-900 dark:text-white">Creator</h3>
                                <p className="text-gray-700 dark:text-gray-300 mb-6">
                                    {classData.creator?.name}
                                </p>

                                {classData.code && isCreator && (
                                    <>
                                        <h3 className="font-bold text-gray-900 dark:text-white">Class Code</h3>
                                        <p className="font-mono text-2xl tracking-widest bg-gray-100 dark:bg-gray-800 dark:text-white inline-block px-4 py-2 rounded-xl mt-2">
                                            {classData.code}
                                        </p>
                                    </>
                                )}
                            </>
                        )}

                        {activeTab === "resources" && (
                            <>
                                <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                                    Learning Resources
                                </h1>

                                <form
                                    onSubmit={handleSubmit}
                                    className="mb-10 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
                                >
                                    <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
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

                                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {classData.videos?.length === 0 && (
                                        <p className="text-gray-500 dark:text-gray-400">
                                            No learning resources yet.
                                        </p>
                                    )}

                                    {classData.videos?.map(video => {
                                        const id = getYoutubeId(video.youtube_link);
                                        return (
                                            <div
                                                key={video.id}
                                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
                                            >
                                                <div className="w-full aspect-video bg-black">
                                                    <img
                                                        src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                                                        className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                                                        onClick={() => router.get(`/videos/${video.id}`)}
                                                    />
                                                </div>

                                                <div className="p-5 relative">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                                        {video.topic}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                        {video.notes}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">
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
                    </div>

                    {deleteModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center
                                border border-gray-200 dark:border-gray-700">
                                <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                                    Delete Class?
                                </h2>

                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    This action cannot be undone.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteModalOpen(false)}
                                        className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        Cancel
                                    </button>

                                    <button
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
                </section>
            </div>
        </>
    );
}
