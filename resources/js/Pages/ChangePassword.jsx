import { Head, useForm, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import toast, { Toaster } from "react-hot-toast";

export default function ChangePassword() {
    const { component, props } = usePage();
    const flash = props.flash || {};

    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
    }, [flash.success]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/profile/change-password", {
            preserveScroll: true,
            onSuccess: () => reset(),
        });
    };

    const inputClasses = "w-full mb-1 px-5 py-4 rounded-xl border " +
        "bg-white text-gray-900 placeholder-gray-400 " +
        "dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 " +
        "focus:outline-none focus:ring-2 focus:ring-[#01A9F2]";

    const labelClasses = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    return (
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
                <Navbar />
                <Toaster position="top-right" />

                <section className="flex-1 w-full flex justify-center items-center px-6 py-10">
                    <div className="w-full max-w-xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-10 dark:bg-gray-900/70">
                        <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Change Password</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                            Use a strong password you don't reuse on other sites.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <label className={labelClasses}>Current password</label>
                            <input
                                type="password"
                                value={data.current_password}
                                onChange={(e) => setData("current_password", e.target.value)}
                                className={inputClasses}
                                autoComplete="current-password"
                            />
                            {errors.current_password && (
                                <p className="text-red-500 text-sm mb-3">{errors.current_password}</p>
                            )}

                            <label className={labelClasses + " mt-4"}>New password</label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                className={inputClasses}
                                autoComplete="new-password"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mb-3">{errors.password}</p>
                            )}

                            <label className={labelClasses + " mt-4"}>Confirm new password</label>
                            <input
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                className={inputClasses + " mb-6"}
                                autoComplete="new-password"
                            />

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                    dark:from-[#213A58] dark:to-[#172D9D]
                                    text-white font-semibold rounded-xl shadow-md hover:opacity-90 disabled:opacity-50 transition"
                            >
                                {processing ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}
