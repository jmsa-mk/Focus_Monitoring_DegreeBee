import { Head, usePage, useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";

export default function UploadVideo(){
    const { component } = usePage();
    const { user, flash } = usePage().props;

    const { data, setData, post, errors, processing } = useForm({
        youtube_link: "",
        topic: "",
        notes: "",
    });

    const handleSubmit = (e)=>{
        e.preventDefault();
        post("/videos/upload");
    }

    const [showFlash, setShowFlash] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 3000);
        }
    }, [flash?.success]);

    const inputCls = "w-full mb-1 px-5 py-4 rounded-xl border " +
        "bg-white text-gray-900 placeholder-gray-400 " +
        "dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 " +
        "focus:outline-none focus:ring-2 focus:ring-[#01A9F2]";

    return(
        <>
            <Head>
                <title>{component}</title>
            </Head>

            <div
                className="w-full min-h-screen bg-cover bg-top bg-no-repeat
                bg-[url('/resources/js/assets/Background/Background.jpg')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark.jpg')]"
            >
                <Navbar/>

                <section className="w-full flex justify-center px-6 py-5">

                    <div className="w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl
                        p-10 md:p-16 flex flex-col md:flex-row items-center gap-12
                        dark:bg-gray-900/70">

                        <div className="flex-1 w-full">
                            <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                                Upload Learning Video
                            </h1>

                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Share useful educational videos with other students.
                                Add topic, notes, and help others learn more effectively.
                            </p>

                            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                                Uploaded by:
                                <span className="font-semibold text-gray-800 dark:text-white ml-2">
                                    {user?.name}
                                </span>
                            </div>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="flex-1 w-full max-w-md"
                        >
                            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                                Video Details
                            </h2>

                            <input
                                type="text"
                                placeholder="YouTube Link"
                                value={data.youtube_link}
                                onChange={e => setData("youtube_link", e.target.value)}
                                className={inputCls + " mb-5"}
                            />
                            {errors.youtube_link && (
                                <p className="text-red-500 text-sm mb-3">{errors.youtube_link}</p>
                            )}

                            <input
                                type="text"
                                placeholder="Topic (e.g. Math, Programming)"
                                value={data.topic}
                                onChange={e => setData("topic", e.target.value)}
                                className={inputCls + " mb-5"}
                            />
                            {errors.topic && (
                                <p className="text-red-500 text-sm mb-3">{errors.topic}</p>
                            )}

                            <textarea
                                placeholder="Notes / Summary about this video"
                                value={data.notes}
                                onChange={e => setData("notes", e.target.value)}
                                className={inputCls + " min-h-30 resize-none mb-6"}
                            />
                            {errors.notes && (
                                <p className="text-red-500 text-sm mb-3">{errors.notes}</p>
                            )}

                            <button
                                disabled={processing}
                                className="w-full py-4 bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                    dark:from-[#213A58] dark:to-[#172D9D]
                                    text-white rounded-xl hover:opacity-90 transition disabled:opacity-50"
                            >
                                {processing ? "Uploading..." : "Upload Video"}
                            </button>
                        </form>
                    </div>
                </section>

                <Footer/>

                {showFlash && (
                    <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
                        <div className="bg-white/80 dark:bg-gray-800/90 backdrop-blur-md border border-white/40 dark:border-gray-700 shadow-xl rounded-2xl px-6 py-4 flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center">
                                <i className="fa-solid fa-check"></i>
                            </div>
                            <p className="font-semibold text-gray-700 dark:text-white">
                                {flash.success}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
