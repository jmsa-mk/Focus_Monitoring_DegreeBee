import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";
import toast, { Toaster } from "react-hot-toast";

export default function EditClass() {
    const { component, class: classData, flash } = usePage().props;

    const fileRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(classData.thumbnail_url || null);

    const [thumbnailMode, setThumbnailMode] = useState(
        classData.thumbnail_url ? "existing" : "empty"
    );

    const { data, setData, post, errors, processing } = useForm({
        title: classData.title || "",
        description: classData.description || "",
        visibility: classData.visibility || "private",
        thumbnail: null,
        remove_thumbnail: false,
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
    }, [flash?.success]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/classes/${classData.id}/edit`, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 4 * 1024 * 1024) {
            toast.error("Thumbnail must be smaller than 4 MB.");
            e.target.value = "";
            return;
        }

        setData("thumbnail", file);
        setData("remove_thumbnail", false);
        setPreviewUrl(URL.createObjectURL(file));
        setThumbnailMode("preview");
    };

    const removeThumbnail = () => {
        setData("thumbnail", null);
        setData("remove_thumbnail", true);
        setPreviewUrl(null);
        setThumbnailMode("empty");
        if (fileRef.current) fileRef.current.value = "";
    };

    const inputCls = "w-full mb-1 px-5 py-4 rounded-xl border " +
        "bg-white text-gray-900 placeholder-gray-400 " +
        "dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400 " +
        "focus:outline-none focus:ring-2 focus:ring-[#01A9F2]";

    return (
        <>
            <Head title={`Edit ${classData.title}`} />

            <div
                className="w-full min-h-screen bg-cover bg-top bg-no-repeat
                bg-[url('/resources/js/assets/Background/Background.jpg')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark.jpg')]"
            >
                <Navbar />
                <Toaster position="top-right" />

                <section className="w-full flex justify-center px-6 py-5">
                    <div className="w-full max-w-7xl bg-white/70 backdrop-blur-md rounded-3xl shadow-xl
                        p-10 md:p-16 flex flex-col md:flex-row items-start gap-12
                        dark:bg-gray-900/70">

                        <div className="flex-1 w-full">
                            <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
                                Edit Class
                            </h1>

                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Update the details of your class. Changes will be visible to everyone
                                who has access.
                            </p>

                            <div className="mt-8">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                    Thumbnail
                                </label>

                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleThumbnailChange}
                                    className="hidden"
                                />

                                {thumbnailMode !== "empty" && previewUrl ? (
                                    <div className="relative group">
                                        <img
                                            src={previewUrl}
                                            alt="Thumbnail"
                                            className="w-full aspect-video object-cover rounded-2xl shadow-md border border-gray-200 dark:border-gray-700"
                                        />
                                        {thumbnailMode === "preview" && (
                                            <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold
                                                bg-[#01A9F2] text-white shadow">
                                                New
                                            </span>
                                        )}
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileRef.current?.click()}
                                                className="w-9 h-9 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md
                                                    hover:bg-white dark:hover:bg-gray-700 flex items-center justify-center
                                                    text-gray-700 dark:text-gray-200"
                                                title="Replace"
                                            >
                                                <i className="fa-solid fa-pen"></i>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={removeThumbnail}
                                                className="w-9 h-9 rounded-full bg-red-500/90 backdrop-blur-sm shadow-md
                                                    hover:bg-red-600 flex items-center justify-center text-white"
                                                title="Remove"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => fileRef.current?.click()}
                                        className="w-full aspect-video rounded-2xl
                                            border-2 border-dashed border-gray-300 dark:border-gray-600
                                            hover:border-[#01A9F2] dark:hover:border-[#01A9F2]
                                            flex flex-col items-center justify-center gap-2
                                            text-gray-500 dark:text-gray-400 hover:text-[#01A9F2]
                                            transition cursor-pointer
                                            bg-gray-50/50 dark:bg-gray-800/30"
                                    >
                                        <i className="fa-solid fa-cloud-arrow-up text-4xl"></i>
                                        <span className="font-semibold">Click to upload thumbnail</span>
                                        <span className="text-xs">JPG, PNG or WEBP. Max 4 MB.</span>
                                    </button>
                                )}

                                {errors.thumbnail && (
                                    <p className="text-red-500 text-sm mt-2">{errors.thumbnail}</p>
                                )}
                            </div>

                            <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
                                Class Code:
                                <span className="font-mono font-semibold text-gray-800 dark:text-white ml-2">
                                    {classData.code}
                                </span>
                            </div>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="flex-1 w-full max-w-md"
                        >
                            <h2 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
                                Class Details
                            </h2>

                            <input
                                type="text"
                                placeholder="Class Title"
                                value={data.title}
                                onChange={e => setData("title", e.target.value)}
                                className={inputCls + " mb-5"}
                            />
                            {errors.title && (
                                <p className="text-red-500 text-sm mb-3">{errors.title}</p>
                            )}

                            <textarea
                                placeholder="Class Description"
                                value={data.description}
                                onChange={e => setData("description", e.target.value)}
                                className={inputCls + " min-h-32 resize-none mb-5"}
                            />
                            {errors.description && (
                                <p className="text-red-500 text-sm mb-3">{errors.description}</p>
                            )}

                            <select
                                value={data.visibility}
                                onChange={e => setData("visibility", e.target.value)}
                                className={inputCls + " mb-6"}
                            >
                                <option value="private">Private</option>
                                <option value="public">Public</option>
                            </select>

                            <div className="flex gap-3">
                                <Link
                                    href={`/classes/${classData.id}`}
                                    className="flex-1 py-4 text-center rounded-xl border border-gray-300 dark:border-gray-600
                                        text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
                                        font-semibold transition"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 py-4 bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                        dark:from-[#213A58] dark:to-[#172D9D]
                                        text-white font-semibold rounded-xl hover:opacity-90 transition disabled:opacity-50"
                                >
                                    {processing ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}
