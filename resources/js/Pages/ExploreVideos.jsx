import { Head, usePage, router } from "@inertiajs/react";
import Navbar from "../Component/Navbar";
import StarRating from "../Component/StarRating";

import { useState, useEffect, useRef } from "react";

export default function ExploreVideos(){
    const { component } = usePage();
    const { videos, user } = usePage().props;

    const [videoList, setVideoList] = useState(videos.data);
    const [nextPage, setNextPage] = useState(videos.next_page_url);

    const [playVideo, setPlayVideo] = useState(null);
    const loadRef = useRef();

    const { filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search || "");

    useEffect(() => {
        if (window.location.search.includes("page=")) {
            window.history.replaceState({}, "", "/explore");
            window.location.reload();
        }
    }, []);

    const loadMore = () => {
        if (!nextPage) return;

        router.get(
            nextPage,
            {},
            {
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    setVideoList((prev) => [
                        ...prev,
                        ...page.props.videos.data,
                    ]);
                    setNextPage(page.props.videos.next_page_url);
                },
            }
        );
    };

    useEffect(() => {
        if (!nextPage) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 1 }
        );

        if (loadRef.current) {
            observer.observe(loadRef.current);
        }

        return () => observer.disconnect();
    }, [nextPage]);

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

    function submitSearch(e) {
        e.preventDefault();
        router.get(
            "/explore",
            { search },
            {
                preserveState: true,
                replace: true,
                onSuccess: (page) => {
                    setVideoList(page.props.videos.data);
                    setNextPage(page.props.videos.next_page_url);
                }
            }
        );
    }

    return (
        <>
            <Head>
                <title>{component}</title>
            </Head>

            <div
                className="w-full min-h-screen bg-cover bg-top bg-no-repeat bg-fixed
                bg-[url('/resources/js/assets/Background/Background.jpg')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark.jpg')]
                "
            >
                <Navbar/>

                <section className="w-full flex justify-center px-6 py-6">

                    <div
                        className="w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-8 md:p-12
                        dark:bg-gray-900/70"
                    >


                        <div className="relative w-full rounded-3xl px-10 py-16 overflow-hidden shadow-xl
                            bg-linear-to-br from-[#01A9F2] via-[#00E2E0] to-[#797CFF]
                            dark:from-[#213A58] dark:via-[#172D9D] dark:to-[#0F172A]">

                            {/* Decorative blobs */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
                            <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#BAFFFE]/20 blur-3xl pointer-events-none"></div>
                            <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-[#797CFF]/30 blur-2xl pointer-events-none"></div>

                            <a
                                href="/uploadVideo"
                                className="absolute top-6 left-8 inline-flex items-center gap-2 px-4 py-2 rounded-full
                                    bg-white/15 backdrop-blur-md border border-white/30
                                    text-white text-sm font-semibold hover:bg-white/25 transition shadow-lg z-10"
                            >
                                <i className="fa-solid fa-cloud-arrow-up"></i>
                                Upload Video
                            </a>

                            <div className="relative z-10">
                                <h1 className="text-white text-4xl md:text-5xl font-bold text-center drop-shadow-lg">
                                    Hi {user?.name}!
                                </h1>
                                <p className="text-white/85 text-center mt-2 text-sm md:text-base">
                                    Let's find something great to learn today
                                </p>

                                <form onSubmit={submitSearch} className="flex justify-center mt-8">
                                    <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-6 py-4 w-full max-w-3xl shadow-2xl
                                        ring-4 ring-white/20 focus-within:ring-white/40 transition">
                                        <i className="fa-solid fa-magnifying-glass text-gray-500 dark:text-gray-400"></i>
                                        <input
                                            type="text"
                                            placeholder="What do you want to learn?"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent ml-3
                                                dark:text-white dark:placeholder-gray-400"
                                        />
                                        <button
                                            type="submit"
                                            className="ml-3 px-4 py-2 rounded-full bg-linear-to-r from-[#01A9F2] to-[#797CFF]
                                                dark:from-[#213A58] dark:to-[#172D9D]
                                                text-white text-sm font-semibold hover:opacity-90 transition shadow-md"
                                        >
                                            Search
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                            {videoList.map(video => {
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
                                            {playVideo === video.id ? (
                                                <iframe
                                                    className="w-full h-full"
                                                    loading="lazy"
                                                    src={`https://www.youtube-nocookie.com/embed/${id}`}
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <img
                                                    src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
                                                    className="w-full h-full object-cover cursor-pointer
                                                        group-hover:scale-110 transition-transform duration-500"
                                                    onClick={() => router.get(`/videos/${video.id}`)}
                                                />
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
                                                    // Optimistic update
                                                    setVideoList((prev) =>
                                                        prev.map((v) =>
                                                            v.id === video.id
                                                                ? { ...v, is_bookmarked: !v.is_bookmarked }
                                                                : v
                                                        )
                                                    );
                                                    router.post(`/bookmark/${video.id}`, {}, {
                                                        preserveScroll: true,
                                                        preserveState: true,
                                                        onError: () => {
                                                            // Rollback on error
                                                            setVideoList((prev) =>
                                                                prev.map((v) =>
                                                                    v.id === video.id
                                                                        ? { ...v, is_bookmarked: !v.is_bookmarked }
                                                                        : v
                                                                )
                                                            );
                                                        },
                                                    });
                                                }}
                                                className="absolute bottom-3 right-3 w-10 h-10 flex items-center justify-center hover:scale-125 transition-transform cursor-pointer text-2xl z-10"
                                                title={video.is_bookmarked ? "Remove bookmark" : "Save to bookmarks"}
                                            >
                                                <i
                                                    className={
                                                        video.is_bookmarked
                                                            ? "fa-solid fa-bookmark text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]"
                                                            : "fa-regular fa-bookmark text-gray-400 dark:text-gray-500 hover:text-yellow-400"
                                                    }
                                                ></i>
                                            </button>
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
            </div>
        </>
    );
}
