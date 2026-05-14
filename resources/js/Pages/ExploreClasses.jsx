import { Head, usePage, router } from "@inertiajs/react";
import Navbar from "../Component/Navbar";

export default function MyClasses(){

    const { component } = usePage();
    const { classes } = usePage().props;

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
                <Navbar />

                <section className="w-full flex justify-center px-6 py-10">
                    <div className="w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-10
                        dark:bg-gray-900/70">

                        <h1 className="text-5xl font-bold text-center text-gray-900 dark:text-white">
                            Classes
                        </h1>

                        <div className="flex justify-between mt-10 px-20">
                            <button
                                onClick={() => router.get('/join')}
                                className="px-10 py-3 rounded-full border-2 border-[#01A9F2] text-[#01A9F2] font-semibold
                                    hover:bg-[#01A9F2] hover:text-white transition
                                    dark:border-[#01A9F2] dark:text-[#01A9F2] dark:hover:bg-[#01A9F2] dark:hover:text-white"
                            >
                                Join Class
                            </button>

                            <button
                                onClick={() => router.get('/classes/create')}
                                className="px-10 py-3 rounded-full border-2 border-[#01A9F2] text-[#01A9F2] font-semibold
                                    hover:bg-[#01A9F2] hover:text-white transition
                                    dark:border-[#01A9F2] dark:text-[#01A9F2] dark:hover:bg-[#01A9F2] dark:hover:text-white"
                            >
                                Create Class
                            </button>
                        </div>

                        <div className="mt-12 bg-[#01A9F2] rounded-3xl p-10
                            dark:bg-linear-to-r dark:from-[#213A58] dark:to-[#172D9D]">

                            <h2 className="text-white font-semibold mb-6">
                                My Classes
                            </h2>

                            {classes.length === 0 ? (
                                <div className="text-center text-white py-20">
                                    <p className="text-lg opacity-80">
                                        You don't have any classes yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {classes.map(cls => (
                                        <div
                                            key={cls.id}
                                            onClick={() => router.get(`/classes/${cls.id}`)}
                                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
                                        >
                                            <div className="h-40 bg-gray-200 dark:bg-gray-700">
                                                {cls.thumbnail_url ? (
                                                    <img
                                                        src={cls.thumbnail_url}
                                                        alt={cls.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                                        No Thumbnail
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-5">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    {cls.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                    Creator: {cls.creator?.name}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
