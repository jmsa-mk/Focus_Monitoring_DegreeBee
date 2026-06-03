import { router } from "@inertiajs/react";

/**
 * Renders a Laravel paginator `links` array.
 * Uses Inertia partial visits while preserving scroll + state.
 */
export default function AdminPagination({ links }) {
    if (!links || links.length <= 3) return null;

    const go = (url) => {
        if (!url) return;
        router.get(url, {}, { preserveScroll: true, preserveState: true });
    };

    return (
        <div className="flex flex-wrap items-center justify-center gap-1 px-4 py-4
            border-t border-gray-100 dark:border-gray-800">
            {links.map((link, i) => {
                const label = link.label
                    .replace("&laquo;", "‹")
                    .replace("&raquo;", "›")
                    .replace("Previous", "‹")
                    .replace("Next", "›");

                if (!link.url) {
                    return (
                        <span
                            key={i}
                            className="min-w-9 h-9 px-3 flex items-center justify-center text-sm rounded-lg
                                text-gray-300 dark:text-gray-600 cursor-not-allowed"
                            dangerouslySetInnerHTML={{ __html: label }}
                        />
                    );
                }

                return (
                    <button
                        key={i}
                        onClick={() => go(link.url)}
                        className={`min-w-9 h-9 px-3 flex items-center justify-center text-sm rounded-lg font-medium transition
                            ${
                                link.active
                                    ? "bg-linear-to-r from-[#01A9F2] to-[#797CFF] text-white shadow"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                            }`}
                        dangerouslySetInnerHTML={{ __html: label }}
                    />
                );
            })}
        </div>
    );
}
