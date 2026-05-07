import { Head, usePage, useForm } from "@inertiajs/react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";

import Image from '@/assets/images/Learning1.png';

export default function Register(){
    const { component } = usePage();

    const { data, setData, post, processing, errors } = useForm({
        email: "",
        password: "",
        password_confirmation: ""
    });

    const handleSubmit = (e)=>{
        e.preventDefault();
        post("/register");
    }

    return(
        <>
            <Head>
                <title>{component}</title>
            </Head>

            <div
                className="w-full min-h-screen flex flex-col bg-cover bg-top bg-no-repeat
                bg-[url('/resources/js/assets/Background/Background.jpg')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark.jpg')]
                "
            >
                <Navbar/>

                <section className="flex-1 w-full flex justify-center items-center px-6 py-10">

                    <div className="w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl
                        p-10 md:p-16 flex flex-col md:flex-row items-center gap-12
                        dark:bg-gray-900/70
                    ">

                        <div className="flex-1 flex justify-center">
                            <img src={Image} alt="Logo" className="w-56 md:w-80 object-contain"/>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="flex-1 w-full max-w-md"
                        >

                            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                                Sign up
                            </h2>

                            <input
                                type="email"
                                placeholder="Email"
                                value={data.email}
                                onChange={e => setData("email", e.target.value)}
                                className="w-full mb-1 px-5 py-4 rounded-xl border
                                    bg-white text-gray-900 placeholder-gray-400
                                    dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400
                                    focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                                autoComplete="email"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mb-3">{errors.email}</p>
                            )}

                            <input
                                type="password"
                                placeholder="Password"
                                value={data.password}
                                onChange={e => setData("password", e.target.value)}
                                className="w-full mb-1 mt-4 px-5 py-4 rounded-xl border
                                    bg-white text-gray-900 placeholder-gray-400
                                    dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400
                                    focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                                autoComplete="new-password"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mb-3">{errors.password}</p>
                            )}

                            <input
                                type="password"
                                placeholder="Confirm password"
                                value={data.password_confirmation}
                                onChange={e => setData("password_confirmation", e.target.value)}
                                className="w-full mb-5 mt-4 px-5 py-4 rounded-xl border
                                    bg-white text-gray-900 placeholder-gray-400
                                    dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400
                                    focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                                autoComplete="new-password"
                            />

                            <button
                                disabled={processing}
                                className="w-full py-4 bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                    dark:from-[#213A58] dark:to-[#172D9D]
                                    text-white rounded-xl disabled:opacity-50 hover:opacity-90 transition"
                            >
                                {processing ? "Creating account..." : "Sign Up"}
                            </button>

                            <div className="flex items-center gap-4 my-8">
                                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"/>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    Other Log in options
                                </span>
                                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"/>
                            </div>

                            <div className="flex justify-center gap-6 mb-6">
                                <button type="button" className="border rounded-xl p-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white">
                                    <i className="fa-brands fa-google"></i>
                                </button>
                                <button type="button" className="border rounded-xl p-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white">
                                    <i className="fa-brands fa-facebook"></i>
                                </button>
                                <button type="button" className="border rounded-xl p-3 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white">
                                    <i className="fa-brands fa-apple"></i>
                                </button>
                            </div>

                            <p className="text-center text-sm text-gray-600 dark:text-gray-300">
                                Already have an account?{" "}
                                <a href="/login" className="text-[#01A9F2] font-semibold hover:underline">
                                    Log in
                                </a>
                            </p>
                        </form>

                    </div>
                </section>

                <Footer/>
            </div>
        </>
    );
}
