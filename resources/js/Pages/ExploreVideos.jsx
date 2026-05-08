import { Head, usePage, router } from "@inertiajs/react";
import Navbar from "../Component/Navbar";
import StarRating from "../Component/StarRating";

import Container from '@/assets/Background/Container.png';

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
                bg-[url('/resources/js/assets/Background/Background2.png')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark2.png')]
                "
            >
                <Navbar/>

                <section className="w-full flex justify-center px-6 py-6">

                    <div
                        className="w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-8 md:p-12
                        dark:bg-gray-900/70"
                    >


                        <div
                            className="relative w-full rounded-3xl px-10 py-14 overflow-hidden bg-cover bg-center
                                dark:bg-linear-to-r dark:from-[#213A58] dark:to-[#172D9D]"
                            style={{ backgroundImage: `url(${Container})` }}
                        >
                            <a
                                href="/uploadVideo"
                                className="text-white/90 underline text-sm absolute top-6 left-8 hover:opacity-70"
                            >
                                Upload Video
                            </a>

                            <h1 className="text-white text-4xl md:text-5xl font-semibold text-center">
                                Hi {user?.name} !
                            </h1>

                            <form onSubmit={submitSearch} className="flex justify-center mt-10">
                                <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-6 py-4 w-full max-w-3xl shadow-lg">
                                    <i className="fa-solid fa-magnifying-glass text-gray-500 dark:text-gray-400"></i>
                                    <input
                                        type="text"
                                        placeholder="What do you want to learn?"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent ml-3
                                            dark:text-white dark:placeholder-gray-400"
                                    />
                                </div>
                            </form>
                        </div>

                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

                            {videoList.map(video => {
                                const id = getYoutubeId(video.youtube_link);

                                return (
                                    <div
                                        key={video.id}
                                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition"
                                    >
                                        <div className="w-full aspect-video bg-black">
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
                                                    className="w-full h-full object-cover cursor-pointer hover:opacity-80"
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
