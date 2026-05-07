import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useMemo, useRef, useState } from "react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import toast, { Toaster } from "react-hot-toast";

import Image from "@/assets/images/Learning2.png";

export default function EditProfile() {
    const { component, props } = usePage();
    const user = props.auth.user;
    const flash = props.flash || {};

    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(user.avatar_url || null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: user.name || "",
        email: user.email || "",
        avatar: null,
        university: user.university || "",
        major: user.major || "",
        bio: user.bio || "",
    });

    const handleAvatarChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be smaller than 2 MB.");
            e.target.value = "";
            return;
        }

        setData("avatar", file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/profile/update", {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (flash?.success) toast.success(flash.success);
                reset("avatar");
            },
        });
    };

    const displayedAvatar = useMemo(
        () => previewUrl || user.avatar_url || null,
        [previewUrl, user.avatar_url]
    );

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
                className="w-full min-h-screen bg-cover bg-top bg-no-repeat
                bg-[url('/resources/js/assets/Background/Background.jpg')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark.jpg')]
                "
            >
                <Navbar />
                <Toaster position="top-right" />

                <section className="w-full flex justify-center px-6 py-10">
                    <div className="w-full max-w-7xl bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-12
                        dark:bg-gray-900/70">

                        <div className="flex-1 flex flex-col items-center gap-6">
                            <div className="relative">
                                {displayedAvatar ? (
                                    <img
                                        src={displayedAvatar}
                                        alt="Avatar"
                                        className="w-40 h-40 rounded-full object-cover border-4 border-white shadow dark:border-gray-700"
                                    />
                                ) : (
                                    <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-400 border-4 border-white shadow dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
                                        {(user.name || user.email || "?")
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-1 right-1 bg-[#01A9F2] hover:bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-md
                                        dark:bg-[#213A58] dark:hover:bg-[#172D9D]"
                                    title="Change avatar"
                                >
                                    <i className="fa-solid fa-camera"></i>
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />

                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-xs">
                                JPG, PNG or WEBP. Max 2 MB.
                            </p>

                            {errors.avatar && (
                                <p className="text-red-500 text-sm">{errors.avatar}</p>
                            )}

                            <img
                                src={Image}
                                alt="Illustration"
                                className="w-56 md:w-72 object-contain opacity-90"
                            />
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="flex-1 w-full max-w-md"
                        >
                            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                                Edit Profile
                            </h2>

                            <label className={labelClasses}>Full Name</label>
                            <input
                                type="text"
                                placeholder="Your name"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className={inputClasses}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm mb-3">{errors.name}</p>
                            )}

                            <label className={labelClasses + " mt-4"}>Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                className={inputClasses}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm mb-3">{errors.email}</p>
                            )}

                            <label className={labelClasses + " mt-4"}>University</label>
                            <input
                                type="text"
                                placeholder="University"
                                value={data.university}
                                onChange={(e) => setData("university", e.target.value)}
                                className={inputClasses}
                            />

                            <label className={labelClasses + " mt-4"}>Major</label>
                            <input
                                type="text"
                                placeholder="Major"
                                value={data.major}
                                onChange={(e) => setData("major", e.target.value)}
                                className={inputClasses}
                            />

                            <label className={labelClasses + " mt-4"}>Bio</label>
                            <textarea
                                placeholder="Tell us about yourself"
                                value={data.bio}
                                onChange={(e) => setData("bio", e.target.value)}
                                className="w-full mb-6 px-5 py-4 rounded-xl border h-28 resize-none
                                    bg-white text-gray-900 placeholder-gray-400
                                    dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400
                                    focus:outline-none focus:ring-2 focus:ring-[#01A9F2]"
                            />

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full py-4 bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                    dark:from-[#213A58] dark:to-[#172D9D]
                                    text-white font-semibold rounded-xl shadow-md hover:opacity-90 disabled:opacity-50 transition"
                            >
                                {processing ? "Saving..." : "Save Changes"}
                            </button>

                            <Link
                                href="/profile/change-password"
                                className="block text-center text-[#01A9F2] hover:underline mt-4 text-sm"
                            >
                                Change password →
                            </Link>
                        </form>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}
