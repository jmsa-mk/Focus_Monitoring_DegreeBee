import { Head, usePage, router } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import StarRating from "../Component/StarRating";
import toast, { Toaster } from "react-hot-toast";

export default function ManageVideo() {
    const { component, videos, flash } = usePage().props;

    const [deleteId, setDeleteId] = useState(null);
    const [videoList, setVideoList] = useState(videos.data);
    const [nextPage, setNextPage] = useState(videos.next_page_url);

    const loadRef = useRef();

    useEffect(() => {
        if (window.location.search.includes("page=")) {
            window.history.replaceState({}, "", "/manageVideos");
            window.location.reload();
        }
    }, []);

    function loadMore() {
        if (!nextPage) return;

        router.get(nextPage, {}, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: (page) => {
                setVideoList((prev) => [...prev, ...page.props.videos.data]);
                setNextPage(page.props.videos.next_page_url);
            },
        });
    }

    useEffect(() => {
        if (!nextPage) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) loadMore();
        }, { threshold: 1 });

        if (loadRef.current) observer.observe(loadRef.current);
        return () => observer.disconnect();
    }, [nextPage]);

    function handleDelete() {
        router.delete(`/videos/${deleteId}`, {
            preserveScroll: true,
            onSuccess: () => {
                setVideoList((prev) => prev.filter((v) => v.id !== deleteId));
                setDeleteId(null);
            },
        });
    }

    function getYoutubeId(link) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
        const match = link.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    }

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
    }, [flash?.success]);

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

                <section className="w-full flex justify-center px-6 py-10">
                    <div className="w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl
                        p-10 md:p-14 dark:bg-gray-900/70">

                        <h1 className="text-3xl font-bold mb-10 text-gray-900 dark:text-white">
                            Manage My Videos
                        </h1>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {videoList.map((video) => {
                                const ytId = getYoutubeId(video.youtube_link);
                                const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/0.jpg` : null;

                                return (
                                    <div
                                        key={video.id}
                                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition
                                            border border-gray-200 dark:border-gray-700"
                                    >
                                        {thumbnail && (
                                            <img
                                                src={thumbnail}
                                                className="w-full h-44 object-cover"
                                                alt={video.title}
                                            />
                                        )}

                                        <div className="p-5">
                                            <h2 className="font-semibold text-lg line-clamp-2 text-gray-900 dark:text-white">
                                                {video.title}
                                            </h2>

                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                Topic: {video.topic}
                                            </p>

                                            <div className="text-sm mt-1">
                                                {video.ratings_count > 0 ? (
                                                    <StarRating
                                                        value={video.avg_rating}
                                                        size="text-sm"
                                                        showCount
                                                        count={video.ratings_count}
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500 italic">
                                                        No ratings yet
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex gap-3 mt-5">
                                                <button
                                                    onClick={() => router.visit(`/edit-video/${video.id}`)}
                                                    className="flex-1 py-2 bg-[#01A9F2] text-white rounded-lg hover:opacity-90 transition
                                                        dark:bg-[#01A9F2] dark:hover:bg-[#172D9D]"
                                                >
                                                    <i className="fa-solid fa-pen mr-2"></i>
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => setDeleteId(video.id)}
                                                    className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                >
                                                    <i className="fa-solid fa-trash mr-2"></i>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div ref={loadRef} className="h-20 flex justify-center items-center">
                            {nextPage
                                ? <p className="text-gray-500 dark:text-gray-400">Loading more videos...</p>
                                : <p className="text-gray-400 dark:text-gray-500">No more videos</p>
                            }
                        </div>
                    </div>
                </section>

                <Footer />

                {/* DELETE MODAL */}
                {deleteId && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-[90%] max-w-md text-center
                            border border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                                Delete Video?
                            </h2>

                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                This action cannot be undone.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600
                                        text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleDelete}
                                    className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
