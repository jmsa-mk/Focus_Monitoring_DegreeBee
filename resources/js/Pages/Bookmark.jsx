import { Head, usePage, router } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import StarRating from "../Component/StarRating";

export default function Bookmark() {
    const { component, videos } = usePage().props;

    const [videoList, setVideoList] = useState(videos.data);
    const [nextPage, setNextPage] = useState(videos.next_page_url);

    const loadRef = useRef();

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

    function getYoutubeId(link) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
        const match = link.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    }

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

                <section className="w-full flex justify-center px-6 py-10">
                    <div className="w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl
                        p-10 md:p-14 dark:bg-gray-900/70">

                        <h1 className="text-3xl font-bold mb-10 text-gray-900 dark:text-white inline-flex items-center gap-3">
                            <i className="fa-solid fa-bookmark text-[#01A9F2]"></i>
                            Saved Videos
                        </h1>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {videoList.map((video) => {
                                const id = getYoutubeId(video.youtube_link);

                                return (
                                    <div
                                        key={video.id}
                                        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden
                                            border border-gray-200 dark:border-gray-700
                                            hover:shadow-2xl hover:border-[#01A9F2] dark:hover:border-[#797CFF]
                                            hover:-translate-y-1 transition-all duration-300"
                                    >
                                        <div className="w-full aspect-video bg-black">
                                            {id ? (
                                                <img
                                                    src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                                                    className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                                                    onClick={() => router.get(`/videos/${video.id}`)}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                    <i className="fa-regular fa-image text-4xl"></i>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 relative">
                                            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                                                {video.title}
                                            </h3>

                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                Topic: {video.topic}
                                            </p>

                                            <p className="text-sm text-gray-600 dark:text-gray-300">
                                                Recommender: {video.user?.name}
                                            </p>

                                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                                {video.ratings_count > 0 ? (
                                                    <StarRating
                                                        value={video.avg_rating}
                                                        size="text-sm"
                                                        showCount
                                                        count={video.ratings_count}
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 dark:text-gray-500 italic">
                                                        No reviews yet
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.post(`/bookmark/${video.id}`, {}, {
                                                        preserveScroll: true,
                                                        onSuccess: () => {
                                                            setVideoList((prev) =>
                                                                prev.filter((v) => v.id !== video.id)
                                                            );
                                                        },
                                                    });
                                                }}
                                                className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center
                                                    text-2xl hover:scale-125 transition-transform cursor-pointer z-10"
                                                title="Remove bookmark"
                                            >
                                                <i className="fa-solid fa-bookmark text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]"></i>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {videoList.length === 0 && (
                            <div className="text-center py-20">
                                <i className="fa-regular fa-bookmark text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                                <p className="text-gray-500 dark:text-gray-400">
                                    No saved videos yet. Bookmark videos to see them here.
                                </p>
                            </div>
                        )}

                        <div ref={loadRef} className="h-20 flex justify-center items-center">
                            {nextPage
                                ? <p className="text-gray-500 dark:text-gray-400">Loading more videos...</p>
                                : videoList.length > 0 && <p className="text-gray-400 dark:text-gray-500">No more videos</p>
                            }
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}
