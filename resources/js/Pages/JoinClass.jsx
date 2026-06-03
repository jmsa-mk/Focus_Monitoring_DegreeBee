import { useState } from "react";
import { router, Head } from "@inertiajs/react";
import Navbar from "../Component/Navbar";

export default function JoinClass() {
    const [code, setCode] = useState("");

    const submit = (e) => {
        e.preventDefault();
        router.post("/classes/join", { code });
    };

    return (
        <>
            <Head>
                <title>Join Class</title>
            </Head>

            <div
                className="w-full min-h-screen bg-cover bg-top bg-no-repeat bg-fixed
                bg-[url('/resources/js/assets/Background/Background.jpg')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark.jpg')]"
            >
                <Navbar />

                <section className="w-full flex justify-center px-6 py-10">

                    <div className="w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-10 md:p-14
                        dark:bg-gray-900/70">

                        <div className="relative w-full rounded-3xl px-10 py-16 overflow-hidden shadow-xl text-center
                            bg-linear-to-br from-[#01A9F2] via-[#00E2E0] to-[#797CFF]
                            dark:from-[#213A58] dark:via-[#172D9D] dark:to-[#0F172A]">

                            {/* Decorative blobs */}
                            <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10 blur-3xl pointer-events-none"></div>
                            <div className="absolute -bottom-20 -left-12 w-64 h-64 rounded-full bg-[#BAFFFE]/20 blur-3xl pointer-events-none"></div>

                            <div className="relative z-10">
                                <div className="inline-flex w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md
                                    items-center justify-center text-white text-2xl mb-4 shadow-lg">
                                    <i className="fa-solid fa-graduation-cap"></i>
                                </div>
                                <h1 className="text-white text-4xl md:text-5xl font-bold drop-shadow-lg">
                                    Join a Class
                                </h1>
                                <p className="text-white/85 mt-3 max-w-xl mx-auto">
                                    Enter the class code provided by your instructor to start learning together
                                </p>
                            </div>
                        </div>

                        <form onSubmit={submit} className="mt-14 max-w-xl mx-auto">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2 text-center">
                                Class Code
                            </label>
                            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-6 py-4 shadow-lg
                                border border-gray-200 dark:border-gray-700
                                focus-within:ring-4 focus-within:ring-[#01A9F2]/30 transition">
                                <i className="fa-solid fa-key text-gray-400 dark:text-gray-500 mr-3"></i>
                                <input
                                    type="text"
                                    placeholder="Enter 6-character code"
                                    className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent uppercase
                                        tracking-widest text-center font-mono text-lg
                                        dark:text-white dark:placeholder-gray-400"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    maxLength={6}
                                />
                            </div>

                            <button
                                className="w-full mt-6 py-4 rounded-full text-white font-semibold
                                    bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                    dark:from-[#213A58] dark:to-[#172D9D]
                                    hover:opacity-90 hover:shadow-2xl transition-all duration-200 shadow-md
                                    inline-flex items-center justify-center gap-2"
                            >
                                <i className="fa-solid fa-right-to-bracket"></i>
                                Join Class
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </>
    );
}
