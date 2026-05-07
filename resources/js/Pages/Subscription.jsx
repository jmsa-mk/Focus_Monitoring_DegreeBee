import Bg from '@/assets/Background/Background.jpg';
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import { Head, usePage } from "@inertiajs/react";

export default function Subscription(){

    const { component } = usePage();

    return (
        <>
            <Head>
                <title>{component}</title>
            </Head>

            <div
                className="w-full min-h-screen bg-cover bg-top bg-no-repeat
                bg-[url('/resources/js/assets/Background/Background.jpg')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark.jpg')]
                "
                // style={{ backgroundImage: `url(${Bg})` }}
            >

                <Navbar/>

                <section className="w-full flex justify-center px-6 py-20">

                    <div className="
                        w-full max-w-7xl
                        bg-white/70 backdrop-blur-md
                        rounded-3xl shadow-xl
                        p-16
                        dark:bg-gray-900/70
                    ">

                        <h1 className="text-center text-4xl font-bold text-gray-900 mb-14 dark:text-white">
                            Premium
                        </h1>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                            <div className="
                                bg-white
                                rounded-3xl
                                border border-gray-300
                                p-10
                                text-center
                                shadow-sm
                                dark:bg-gray-800

                            ">

                                <h2 className="text-4xl font-bold mb-6 mt-12 dark:text-white">
                                    Free
                                </h2>

                                <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                                    Rp 0,00
                                </p>

                                <p className="text-gray-900 text-m font-bold mb-6 dark:text-white">
                                    /mo
                                </p>

                                <button className="
                                    bg-linear-to-r from-[#01A9F2] to-[#00E2E0]
                                    text-white text-sm
                                    px-5 py-2 rounded-full
                                    shadow-md mb-8
                                    mt-6
                                ">
                                    Currently Owned
                                </button>

                                <ul className="text-gray-600 text-sm space-y-3 text-left dark:text-white">

                                    <li className="flex items-center gap-2">
                                        <i className="fa-solid fa-check text-[#01A9F2]"></i>
                                        Limited Focus Monitoring
                                    </li>

                                    <li className="flex items-center gap-2">
                                        <i className="fa-solid fa-check text-[#01A9F2]"></i>
                                        All Access to Video
                                    </li>

                                </ul>
                            </div>

                            <div className="
                                bg-white
                                rounded-3xl
                                border border-gray-300
                                p-10
                                text-center
                                shadow-sm
                                dark:bg-gray-800
                            ">

                                <h2 className="text-4xl font-bold mb-6 mt-12 dark:text-white">
                                    Monthly
                                </h2>

                                <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                                    Rp 50.000,00
                                </p>

                                <p className="text-gray-900 text-m font-bold mb-6 dark:text-white">
                                    /mo
                                </p>

                                <button className="
                                    bg-white hover:bg-gray-200
                                    text-gray-800 text-sm
                                    px-6 py-2 rounded-full
                                    shadow mb-8 transition
                                    mt-6
                                ">
                                    Buy Now!
                                </button>

                                <ul className="text-gray-600 text-sm space-y-3 text-left dark:text-white">

                                    <li className="flex items-center gap-2">
                                        <i className="fa-solid fa-check text-[#01A9F2]"></i>
                                        Unlimited Focus Monitoring
                                    </li>

                                    <li className="flex items-center gap-2">
                                        <i className="fa-solid fa-check text-[#01A9F2]"></i>
                                        Dashboard Focus Progress
                                    </li>

                                    <li className="flex items-center gap-2">
                                        <i className="fa-solid fa-check text-[#01A9F2]"></i>
                                        Classes management
                                    </li>

                                </ul>
                            </div>

                            <div className="
                                rounded-3xl
                                border-2 border-[#797CFF]
                                dark:border-[#172D9D]
                                overflow-hidden
                                shadow-lg
                            ">

 
                                <div className="
                                    bg-[#797CFF] dark:bg-[#172D9D]
                                    text-white
                                    text-center
                                    py-3
                                    font-semibold
                                    text-sm
                                ">
                                    Most Popular!
                                </div>

                                {/* BODY */}
                                <div className="
                                    bg-linear-to-br from-[#BAFFFE] to-[#797CFF]/40
                                    dark:from-[#213A58] dark:to-[#172D9D]
                                    p-10
                                    text-center
                                ">

                                    <h2 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                                        Yearly
                                    </h2>

                                    <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                                        Rp 400.000,00
                                    </p>

                                    <p className="text-gray-900 dark:text-white text-m font-bold">
                                        /mo
                                    </p>

                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 mb-6">
                                        Save 17k every month
                                    </p>

                                    <button className="
                                        bg-white hover:bg-gray-100
                                        dark:bg-gray-900 dark:hover:bg-gray-800 dark:text-white
                                        text-gray-900 text-sm
                                        px-6 py-2 rounded-full
                                        shadow-md mb-8 transition
                                    ">
                                        Buy Now!
                                    </button>

                                    <ul className="text-gray-800 dark:text-white text-sm space-y-4 text-left">

                                        <li className="flex items-center gap-3">
                                            <i className="fa-solid fa-check text-[#01A9F2]"></i>
                                            Unlimited Focus Monitoring
                                        </li>

                                        <li className="flex items-center gap-3">
                                            <i className="fa-solid fa-check text-[#01A9F2]"></i>
                                            Dashboard Focus Progress
                                        </li>

                                        <li className="flex items-center gap-3">
                                            <i className="fa-solid fa-check text-[#01A9F2]"></i>
                                            Classes management
                                        </li>

                                    </ul>

                                    <div className="pb-12"></div>
                                </div>

                            </div>

                        </div>
                    </div>
                </section>

                <Footer/>

            </div>
        </>
    );
}
