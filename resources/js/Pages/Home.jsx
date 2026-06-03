import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import Bg from '@/assets/Background/Background.jpg';
import BgDark from '@/assets/Background/Background_Dark.jpg';
import Logo from '@/assets/images/logo_backgroundless.png';
import CommunityImg from '@/assets/images/community_background.png'
import Navbar from "../Component/Navbar";
import { Head, Link, usePage } from "@inertiajs/react";
import Footer from "../Component/Footer";

// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";



export default function Home(){

    const { component } = usePage();

    const { auth } = usePage().props;
    const user = auth?.user;

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
                // style={{ backgroundImage: `url(${Bg})`,}}
            >

                <Navbar/>

                <section className="w-full flex justify-center px-6 pb-15 pt-15">

                    <div className="
                        relative w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl
                        p-12 md:p-20 flex flex-col md:flex-row items-center gap-10
                        dark:bg-gray-900/70 overflow-hidden
                    ">
                        {/* Decorative gradient blobs */}
                        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#00E2E0]/20 dark:bg-[#172D9D]/30 blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-[#797CFF]/20 dark:bg-[#213A58]/30 blur-3xl pointer-events-none"></div>

                        <div className="flex-1 relative z-10">

                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold
                                bg-[#BAFFFE] text-[#0C2D34] dark:bg-[#172D9D]/40 dark:text-[#BAFFFE] mb-4">
                                <i className="fa-solid fa-sparkles"></i>
                                Focus better with AI
                            </span>

                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight dark:text-white">
                                Empowering the Way Students <br/>
                                <span className="bg-linear-to-r from-[#01A9F2] to-[#797CFF] bg-clip-text text-transparent">
                                    Stay Focused and Learn Better
                                </span>
                            </h1>

                            <p className="mt-4 text-gray-700 text-lg max-w-xl dark:text-gray-200">
                                Monitor your study focus, save important materials, and find
                                the best videos from the student community.
                            </p>

                            {!user && (
                                <Link
                                    href="/register"
                                    className="mt-6 px-8 py-3
                                        bg-linear-to-r from-[#01A9F2] to-[#797CFF]
                                        dark:from-[#213A58] dark:to-[#172D9D]
                                        text-white font-semibold rounded-full shadow-md
                                        hover:shadow-2xl hover:opacity-90
                                        transition-all duration-200 inline-flex items-center gap-2"
                                >
                                    Sign Up
                                    <i className="fa-solid fa-arrow-right"></i>
                                </Link>
                            )}
                            {user && (
                                <Link
                                    href="/explore"
                                    className="mt-6 px-8 py-3
                                        bg-linear-to-r from-[#01A9F2] to-[#797CFF]
                                        dark:from-[#213A58] dark:to-[#172D9D]
                                        text-white font-semibold rounded-full shadow-md
                                        hover:shadow-2xl hover:opacity-90
                                        transition-all duration-200 inline-flex items-center gap-2"
                                >
                                    Explore Videos
                                    <i className="fa-solid fa-arrow-right"></i>
                                </Link>
                            )}

                        </div>

                        <div className="flex-1 flex justify-center relative z-10">
                            <div className="relative">
                                <div className="absolute inset-0 bg-linear-to-br from-[#00E2E0]/30 to-[#797CFF]/30 blur-3xl"></div>
                                <img src={Logo} alt="Logo" className="relative w-64 md:w-80 object-contain drop-shadow-2xl"/>
                            </div>
                        </div>

                    </div>
                </section>

                <section className="w-full flex justify-center px-6 pb-15">

                <div
                    className="w-full max-w-7xl rounded-3xl p-12 shadow-xl text-white
                            bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                            dark:bg-linear-to-r dark:from-[#213A58] dark:to-[#172D9D]
                    "
                >


                    <h2 className="text-center text-3xl font-bold mb-10">
                        Our Features
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        <div className="
                            bg-white text-gray-900
                            rounded-2xl p-6
                            shadow-lg
                        ">

                            <div className="text-3xl mb-4">
                                {/* <FontAwesomeIcon icon="fa-solid fa-arrows-to-eye" /> */}
                                <i className="fa-solid fa-arrows-to-eye"></i>
                            </div>

                            <h3 className="font-bold text-lg mb-2">
                            Focus Monitoring
                            </h3>

                            <p className="text-gray-600 text-sm leading-relaxed">
                            The system monitors learning focus based on tab
                            activity and interaction, then alerts when
                            distractions are detected.
                            </p>

                        </div>

                        <div className="
                            bg-white text-gray-900
                            rounded-2xl p-6
                            shadow-lg
                        ">

                            <div className="text-3xl mb-4">
                                {/* <FontAwesomeIcon icon="fa-solid fa-user-group" /> */}
                                <i className="fa-solid fa-user-group"></i>
                            </div>

                            <h3 className="font-bold text-lg mb-2">
                            Community-Based Video Learning
                            </h3>

                            <p className="text-gray-600 text-sm leading-relaxed">
                            This feature is used to allow users to share videos
                            that are relevant for learning
                            </p>

                        </div>

                        <div className="
                            bg-white text-gray-900
                            rounded-2xl p-6
                            shadow-lg
                        ">

                            <div className="text-3xl mb-4">
                                {/* <FontAwesomeIcon icon="fa-regular fa-note-sticky" /> */}
                                <i className="fa-regular fa-note-sticky"></i>
                            </div>

                            <h3 className="font-bold text-lg mb-3">
                                Other Learning Support Tools
                            </h3>

                            <ul className="space-y-2 text-sm text-gray-700">

                            <li className="flex items-center gap-2">
                                {/* <FontAwesomeIcon icon="fa-regular fa-circle-check" /> */}
                                <i className="fa-regular fa-circle-check"></i>
                                Classes
                            </li>

                            <li className="flex items-center gap-2">
                                {/* <FontAwesomeIcon icon="fa-regular fa-circle-check" /> */}
                                <i className="fa-regular fa-circle-check"></i>
                                Notes & Important Links Collection
                            </li>

                            <li className="flex items-center gap-2">
                                {/* <FontAwesomeIcon icon="fa-regular fa-circle-check" /> */}
                                <i className="fa-regular fa-circle-check"></i>
                                Question Bank
                            </li>

                            <li className="flex items-center gap-2">
                                {/* <FontAwesomeIcon icon="fa-regular fa-circle-check" /> */}
                                <i className="fa-regular fa-circle-check"></i>
                                And More!
                            </li>

                            </ul>

                        </div>

                    </div>
                </div>
                </section>


                <section className="w-full flex justify-center px-6 pb-24">
                    <div className="
                        w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl
                        p-10 flex flex-col md:flex-row items-center gap-10
                        dark:bg-gray-900/70
                    ">

                        <div className="flex-1">

                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            Join Our Community
                        </h2>

                        <h3 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                            Connect with Fellow Professionals
                        </h3>

                        <p className="mt-3 text-gray-700 max-w-xl leading-relaxed dark:text-white">
                            Join our Telegram community to network, share experiences,
                            and stay updated with the latest opportunities.
                        </p>

                        <button className="
                            flex items-center gap-3 bg-black hover:bg-gray-800 text-white
                            px-6 py-3 mt-6 rounded-full font-semibold shadow-md transition
                            dark:bg-[#213A58] dark:hover:bg-gray-800
                        ">
                            {/* <FontAwesomeIcon icon={faTelegram} /> */}
                            Join Discord Group
                        </button>

                    </div>

                    <div className="flex-1 flex justify-center">
                        <img src={CommunityImg} alt="Community" className="w-full max-w-md rounded-2xl shadow-lg object-cover"/>
                    </div>

                    </div>
                </section>

                <Footer/>

            </div>
        </>
    );
}
