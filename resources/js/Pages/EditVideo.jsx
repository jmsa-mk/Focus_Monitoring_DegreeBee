import { Head, useForm, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import toast, { Toaster } from "react-hot-toast";

export default function EditVideo() {
    const { component, video, flash } = usePage().props;

    const { data, setData, put, processing, errors } = useForm({
        youtube_link: video.youtube_link,
        topic: video.topic,
        notes: video.notes ?? "",
    });

    function submit(e) {
        e.preventDefault();
        put(`/videos/${video.id}`);
    }

    function getYoutubeId(link) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#&?]*).*/;
        const match = link.match(regExp);
        return match && match[2].length === 11 ? match[2] : null;
    }

    const ytId = getYoutubeId(data.youtube_link);
    const thumbnail = ytId ? `https://img.youtube.com/vi/${ytId}/0.jpg` : null;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
    }, [flash?.success]);

    const inputCls = "w-full mb-1 px-5 py-4 rounded-xl border " +
        "bg-white text-gray-900 placeholder-gray-400 " +
        "dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 " +
        "focus:outline-none focus:ring-2 focus:ring-[#01A9F2]";

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
                        p-10 md:p-16 flex flex-col md:flex-row items-center gap-12
                        dark:bg-gray-900/70">

                        <div className="flex-1 flex flex-col items-center gap-6">
                            {thumbnail ? (
                                <img
                                    src={thumbnail}
                                    alt="Thumbnail"
                                    className="w-full h-74 object-cover rounded-2xl border border-gray-200 dark:border-gray-700"
                                />
                            ) : (
                                <div className="w-full h-74 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500">
                                    <i className="fa-regular fa-image text-5xl"></i>
                                </div>
                            )}
                        </div>

                        <form
                            onSubmit={submit}
                            className="flex-1 w-full max-w-md"
                        >
                            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                                Edit Video
                            </h2>

                            <input
                                type="text"
                                placeholder="YouTube Link"
                                value={data.youtube_link}
                                onChange={(e) => setData("youtube_link", e.target.value)}
                                className={inputCls + " mb-5"}
                            />
                            {errors.youtube_link && (
                                <div className="text-red-500 text-sm mb-3">{errors.youtube_link}</div>
                            )}

                            <input
                                type="text"
                                placeholder="Topic"
                                value={data.topic}
                                onChange={(e) => setData("topic", e.target.value)}
                                className={inputCls + " mb-5"}
                            />
                            {errors.topic && (
                                <div className="text-red-500 text-sm mb-3">{errors.topic}</div>
                            )}

                            <textarea
                                placeholder="Notes"
                                value={data.notes}
                                onChange={(e) => setData("notes", e.target.value)}
                                className={inputCls + " h-32 resize-none mb-6"}
                            />

                            <button
                                disabled={processing}
                                className="w-full py-4 bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                    dark:from-[#213A58] dark:to-[#172D9D]
                                    text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
                            >
                                {processing ? "Updating..." : "Save Changes"}
                            </button>
                        </form>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}
