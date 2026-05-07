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
                        w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl
                        p-20 flex flex-col md:flex-row items-center gap-10
                        dark:bg-gray-900/70
                    ">

                        <div className="flex-1">

                            <h1 className="text-4xl md:text-3xl font-bold text-gray-900 leading-tight dark:text-white">
                                Empowering the Way Students <br/>
                                Stay Focused and Learn Better
                            </h1>

                            <p className="mt-4 text-gray-700 text-lg max-w-xl dark:text-white">
                                Monitor your study focus, save important materials, and find
                                the best videos from the student community.
                            </p>

                            {!user && (
                                <>
                                    <Link
                                href="/register"
                                className="
                                    w-62.5 mt-6 px-8 py-3 bg-[#01A9F2] hover:bg-blue-500 text-white
                                    font-semibold rounded-full shadow-md transition inline-block text-center
                                    dark:bg-[#213A58] dark:hover:bg-gray-800
                                "
                                >
                                Sign Up
                            </Link>
                                </>
                            )}
                            {user && (
                                <>
                                    <Link
                                href="/explore"
                                className="
                                    w-62.5 mt-6 px-8 py-3 bg-[#01A9F2] hover:bg-blue-500 text-white
                                    font-semibold rounded-full shadow-md transition inline-block text-center
                                    dark:bg-[#213A58] dark:hover:bg-gray-800
                                "
                                >
                                Explore
                            </Link>
                                </>
                            )}

                        </div>

                        <div className="flex-1 flex justify-center">
                            <img src={Logo} alt="Logo" className="w-64 md:w-80 object-contain"/>
                        </div>

                    </div>
                </section>

                {/* Feature section */}
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

                        {/* CARD 3 */}
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
