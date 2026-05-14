import { useState } from "react";
import { router, Head } from "@inertiajs/react";
import Navbar from "../Component/Navbar";

import Container from "@/assets/Background/Container.png";

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
                bg-[url('/resources/js/assets/Background/Background2.png')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark2.png')]"
            >
                <Navbar />

                <section className="w-full flex justify-center px-6 py-10">

                    <div className="w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl p-10 md:p-14
                        dark:bg-gray-900/70">

                        <div
                            className="relative w-full rounded-3xl px-10 py-16 overflow-hidden bg-cover bg-center text-center
                                dark:bg-linear-to-r dark:from-[#213A58] dark:to-[#172D9D]"
                            style={{ backgroundImage: `url(${Container})` }}
                        >
                            <h1 className="text-white text-4xl md:text-5xl font-semibold">
                                Join a Class
                            </h1>

                            <p className="text-white/80 mt-3">
                                Enter the class code provided by your instructor
                            </p>
                        </div>

                        <form onSubmit={submit} className="mt-14 max-w-xl mx-auto">
                            <div className="flex items-center bg-white dark:bg-gray-800 rounded-full px-6 py-4 shadow-lg
                                border border-transparent dark:border-gray-700">
                                <input
                                    type="text"
                                    placeholder="Enter Class Code"
                                    className="w-full outline-none text-gray-700 placeholder-gray-400 bg-transparent uppercase
                                        dark:text-white dark:placeholder-gray-400"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                />
                            </div>

                            <button
                                className="w-full mt-6 py-4 rounded-full text-white font-semibold
                                    bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                    dark:from-[#213A58] dark:to-[#172D9D]
                                    hover:opacity-90 transition shadow-md"
                            >
                                Join Class
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </>
    );
}
