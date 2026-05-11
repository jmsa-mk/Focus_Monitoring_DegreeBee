import { Head, Link, usePage, router } from "@inertiajs/react";
import Navbar from "../Component/Navbar";
import Footer from "../Component/Footer";

function formatDuration(seconds) {
    if (!seconds || seconds < 1) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m`;
    return `${seconds}s`;
}

function formatRelative(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return d.toLocaleDateString();
}

function getYoutubeId(link) {
    if (!link) return null;
    try {
        const url = new URL(link);
        if (url.hostname.includes("youtu.be")) return url.pathname.slice(1);
        if (url.pathname.includes("/shorts/")) return url.pathname.split("/shorts/")[1];
        if (url.pathname.includes("/live/")) return url.pathname.split("/live/")[1];
        return url.searchParams.get("v");
    } catch {
        return null;
    }
}

function focusRating(score) {
    if (score >= 90) return { label: "Excellent", color: "text-emerald-600 dark:text-emerald-400" };
    if (score >= 75) return { label: "Great", color: "text-[#01A9F2]" };
    if (score >= 60) return { label: "Good", color: "text-[#797CFF]" };
    if (score >= 40) return { label: "Fair", color: "text-yellow-500" };
    return { label: "Needs improvement", color: "text-red-500" };
}

export default function Profile() {
    const props = usePage().props;
    const {
        profile_user: user,
        stats,
        focus,
        level,
        recent_sessions: recentSessions,
        daily_stats: dailyStats,
        achievements,
    } = props;

    const rating = focusRating(focus.avg_focus_score);
    const maxDailyFocus = Math.max(1, ...dailyStats.map((d) => d.total_focus));

    const sessionData = recentSessions?.data || [];
    const sessionPage = recentSessions?.current_page || 1;
    const sessionLastPage = recentSessions?.last_page || 1;

    const goToSessionPage = (page) => {
        if (page < 1 || page > sessionLastPage || page === sessionPage) return;
        router.reload({
            only: ["recent_sessions"],
            data: { session_page: page },
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            <Head>
                <title>My Profile</title>
            </Head>

            <div
                className="w-full min-h-screen bg-cover bg-top bg-no-repeat
                bg-[url('/resources/js/assets/Background/Background.jpg')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark.jpg')]"
            >
                <Navbar />

                <section className="w-full flex justify-center px-6 py-10">
                    <div className="w-full max-w-7xl space-y-8">

                        {/* ============== HERO CARD ============== */}
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8 md:p-12
                            dark:bg-gray-900/70 border border-white/40 dark:border-gray-700">

                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                                {/* Avatar */}
                                <div className="relative">
                                    {user.avatar_url ? (
                                        <img
                                            src={user.avatar_url}
                                            alt={user.name}
                                            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-5xl font-bold text-gray-400 border-4 border-white dark:border-gray-600 shadow-lg">
                                            {(user.name || user.email || "?").charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    {/* Level badge */}
                                    <div
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full
                                            text-white text-xs font-semibold shadow-md whitespace-nowrap
                                            inline-flex items-center gap-1.5"
                                        style={{ backgroundColor: level.color }}
                                    >
                                        <i className={level.icon}></i>
                                        {level.name}
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                                        {user.name || "Unnamed"}
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400">{user.email}</p>

                                    <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                                        {user.role && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold
                                                bg-[#BAFFFE] text-[#0C2D34]
                                                dark:bg-[#213A58] dark:text-[#BAFFFE]">
                                                {user.role}
                                            </span>
                                        )}
                                        {user.university && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold
                                                bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300
                                                inline-flex items-center gap-1.5">
                                                <i className="fa-solid fa-building-columns"></i>
                                                {user.university}
                                            </span>
                                        )}
                                        {user.major && (
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold
                                                bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                {user.major}
                                            </span>
                                        )}
                                    </div>

                                    {user.bio && (
                                        <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                                            {user.bio}
                                        </p>
                                    )}

                                    <div className="flex gap-3 mt-6 justify-center md:justify-start flex-wrap">
                                        <Link
                                            href="/editProfile"
                                            className="px-5 py-2 rounded-full text-sm font-semibold
                                                bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                                dark:from-[#213A58] dark:to-[#172D9D]
                                                text-white shadow-md hover:opacity-90 transition"
                                        >
                                            Edit Profile
                                        </Link>
                                        <Link
                                            href="/profile/change-password"
                                            className="px-5 py-2 rounded-full text-sm font-semibold
                                                border border-[#01A9F2] text-[#01A9F2]
                                                hover:bg-[#01A9F2] hover:text-white transition"
                                        >
                                            Change Password
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ============== FOCUS SUMMARY ============== */}
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8
                            dark:bg-gray-900/70 border border-white/40 dark:border-gray-700">

                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Focus Summary
                                </h2>
                                <span className={`text-sm font-semibold ${rating.color}`}>
                                    {rating.label}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <SummaryCard
                                    label="Avg Focus Score"
                                    value={`${focus.avg_focus_score}%`}
                                    accent="from-[#00E2E0] to-[#797CFF]"
                                />
                                <SummaryCard
                                    label="Total Focused"
                                    value={formatDuration(focus.total_focus_seconds)}
                                    accent="from-[#01A9F2] to-[#1D4ED8]"
                                />
                                <SummaryCard
                                    label="Sessions"
                                    value={focus.session_count}
                                    accent="from-[#797CFF] to-[#172D9D]"
                                />
                                <SummaryCard
                                    label="Top Topic"
                                    value={focus.top_topic || "—"}
                                    accent="from-[#00E2E0] to-[#01A9F2]"
                                    isText
                                />
                            </div>

                            {/* Focus vs Distracted bar */}
                            {focus.total_seconds > 0 && (
                                <div className="mt-6">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600 dark:text-gray-300">
                                            Focus distribution
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            Total time: {formatDuration(focus.total_seconds)}
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                                        <div
                                            className="h-full bg-linear-to-r from-[#00E2E0] to-[#797CFF]"
                                            style={{
                                                width: `${(focus.total_focus_seconds / focus.total_seconds) * 100}%`,
                                            }}
                                            title={`Focused: ${formatDuration(focus.total_focus_seconds)}`}
                                        />
                                        <div
                                            className="h-full bg-red-300 dark:bg-red-500/60"
                                            style={{
                                                width: `${(focus.total_unfocus_seconds / focus.total_seconds) * 100}%`,
                                            }}
                                            title={`Distracted: ${formatDuration(focus.total_unfocus_seconds)}`}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs mt-2 text-gray-500 dark:text-gray-400">
                                        <span>Focused: {formatDuration(focus.total_focus_seconds)}</span>
                                        <span>Distracted: {formatDuration(focus.total_unfocus_seconds)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ============== WEEKLY CHART ============== */}
                        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8
                            dark:bg-gray-900/70 border border-white/40 dark:border-gray-700">

                            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                                Last 7 Days
                            </h2>

                            <div className="flex items-end justify-between gap-2 h-48">
                                {dailyStats.map((d) => {
                                    const heightPct = d.total_focus > 0
                                        ? Math.max(8, (d.total_focus / maxDailyFocus) * 100)
                                        : 4;
                                    return (
                                        <div
                                            key={d.date}
                                            className="flex-1 flex flex-col items-center gap-2 group"
                                        >
                                            <div className="text-xs text-gray-500 dark:text-gray-400 invisible group-hover:visible h-4">
                                                {formatDuration(d.total_focus)}
                                            </div>

                                            <div className="w-full flex-1 flex items-end">
                                                <div
                                                    className={`w-full rounded-t-lg transition-all
                                                        ${d.total_focus > 0
                                                            ? "bg-linear-to-t from-[#01A9F2] to-[#00E2E0] dark:from-[#172D9D] dark:to-[#797CFF]"
                                                            : "bg-gray-200 dark:bg-gray-700"
                                                        }
                                                    `}
                                                    style={{ height: `${heightPct}%` }}
                                                    title={`${d.date}: ${formatDuration(d.total_focus)} (avg ${d.avg_score}%)`}
                                                />
                                            </div>

                                            <div className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                                {d.label}
                                            </div>
                                            <div className="text-xs text-gray-400 dark:text-gray-500">
                                                {d.avg_score > 0 ? `${d.avg_score}%` : "—"}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ============== ACTIVITY STATS GRID ============== */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <ActivityCard label="Videos Watched" value={stats.videos_watched} icon="fa-regular fa-eye" />
                            <ActivityCard label="Videos Uploaded" value={stats.videos_uploaded} icon="fa-solid fa-video" />
                            <ActivityCard label="Bookmarks" value={stats.bookmarks_count} icon="fa-regular fa-bookmark" />
                            <ActivityCard label="Classes Joined" value={stats.classes_joined} icon="fa-solid fa-graduation-cap" />
                            <ActivityCard label="Classes Created" value={stats.classes_created} icon="fa-solid fa-school" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                            {/* ============== RECENT SESSIONS (paginated) ============== */}
                            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8
                                dark:bg-gray-900/70 border border-white/40 dark:border-gray-700">

                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Recent Sessions
                                    </h2>
                                    {recentSessions?.total > 0 && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {recentSessions.total} total
                                        </span>
                                    )}
                                </div>

                                {sessionData.length === 0 ? (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                        No focus sessions yet. Watch a video to start tracking!
                                    </p>
                                ) : (
                                    <>
                                        <ul className="space-y-3">
                                            {sessionData.map((s) => {
                                                const ytId = getYoutubeId(s.video?.youtube_link);
                                                const r = focusRating(s.focus_score);
                                                return (
                                                    <li
                                                        key={s.id}
                                                        onClick={() => s.video && router.get(`/videos/${s.video.id}`)}
                                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer
                                                            hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                                    >
                                                        {ytId ? (
                                                            <img
                                                                src={`https://img.youtube.com/vi/${ytId}/default.jpg`}
                                                                className="w-16 h-12 object-cover rounded-md flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded-md flex-shrink-0" />
                                                        )}

                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                                                {s.video?.title || "Deleted video"}
                                                            </div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                {formatDuration(s.focus_time)} focused · {formatRelative(s.created_at)}
                                                            </div>
                                                        </div>

                                                        <div className="text-right flex-shrink-0">
                                                            <div className={`text-sm font-bold ${r.color}`}>
                                                                {Math.round(s.focus_score)}%
                                                            </div>
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ul>

                                        {sessionLastPage > 1 && (
                                            <div className="flex items-center justify-between mt-5 pt-4
                                                border-t border-gray-200 dark:border-gray-700">
                                                <button
                                                    onClick={() => goToSessionPage(sessionPage - 1)}
                                                    disabled={sessionPage <= 1}
                                                    className="px-4 py-2 rounded-lg text-sm font-medium
                                                        text-gray-700 dark:text-gray-200
                                                        bg-gray-100 dark:bg-gray-800
                                                        hover:bg-gray-200 dark:hover:bg-gray-700
                                                        disabled:opacity-40 disabled:cursor-not-allowed
                                                        inline-flex items-center gap-2 transition"
                                                >
                                                    <i className="fa-solid fa-chevron-left"></i>
                                                    Prev
                                                </button>

                                                <span className="text-sm text-gray-600 dark:text-gray-300">
                                                    Page <strong className="text-gray-900 dark:text-white">{sessionPage}</strong> of {sessionLastPage}
                                                </span>

                                                <button
                                                    onClick={() => goToSessionPage(sessionPage + 1)}
                                                    disabled={sessionPage >= sessionLastPage}
                                                    className="px-4 py-2 rounded-lg text-sm font-medium
                                                        text-gray-700 dark:text-gray-200
                                                        bg-gray-100 dark:bg-gray-800
                                                        hover:bg-gray-200 dark:hover:bg-gray-700
                                                        disabled:opacity-40 disabled:cursor-not-allowed
                                                        inline-flex items-center gap-2 transition"
                                                >
                                                    Next
                                                    <i className="fa-solid fa-chevron-right"></i>
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* ============== ACHIEVEMENTS ============== */}
                            <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl p-8
                                dark:bg-gray-900/70 border border-white/40 dark:border-gray-700">

                                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                                    Achievements
                                </h2>

                                <div className="grid grid-cols-2 gap-3">
                                    {achievements.map((a) => (
                                        <div
                                            key={a.name}
                                            className={`
                                                p-4 rounded-xl border-2 transition
                                                ${a.unlocked
                                                    ? "border-[#01A9F2] bg-[#BAFFFE]/30 dark:bg-[#172D9D]/30 dark:border-[#797CFF]"
                                                    : "border-gray-200 dark:border-gray-700 opacity-50"
                                                }
                                            `}
                                        >
                                            <div className={`text-2xl mb-1 ${
                                                a.unlocked ? "text-[#01A9F2] dark:text-[#797CFF]" : "text-gray-400 dark:text-gray-500"
                                            }`}>
                                                <i className={a.icon}></i>
                                            </div>
                                            <div className="font-semibold text-sm text-gray-900 dark:text-white">
                                                {a.name}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {a.desc}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* ============== BEST SESSION ============== */}
                        {focus.best_session && (
                            <div className="bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                dark:from-[#213A58] dark:to-[#172D9D]
                                rounded-3xl shadow-xl p-8 text-white">

                                <div className="text-sm uppercase tracking-wide opacity-80 mb-1
                                    inline-flex items-center gap-2">
                                    <i className="fa-solid fa-trophy"></i>
                                    Personal Best
                                </div>
                                <h3 className="text-xl md:text-2xl font-bold mb-2">
                                    {focus.best_session.video?.title || "Session"}
                                </h3>
                                <div className="flex flex-wrap gap-6 text-sm">
                                    <div>
                                        <div className="opacity-80">Focus Score</div>
                                        <div className="text-2xl font-bold">
                                            {Math.round(focus.best_session.focus_score)}%
                                        </div>
                                    </div>
                                    <div>
                                        <div className="opacity-80">Focused Time</div>
                                        <div className="text-2xl font-bold">
                                            {formatDuration(focus.best_session.focus_time)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="opacity-80">Date</div>
                                        <div className="text-2xl font-bold">
                                            {new Date(focus.best_session.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}

function SummaryCard({ label, value, accent, isText = false }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className={`text-xs uppercase tracking-wide bg-linear-to-r ${accent} bg-clip-text text-transparent font-semibold`}>
                {label}
            </div>
            <div className={`mt-2 font-bold text-gray-900 dark:text-white ${isText ? "text-lg truncate" : "text-2xl"}`}>
                {value}
            </div>
        </div>
    );
}

function ActivityCard({ label, value, icon }) {
    return (
        <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-md rounded-2xl p-5 shadow-md border border-white/40 dark:border-gray-700 text-center">
            <div className="text-3xl mb-1 text-[#01A9F2] dark:text-[#797CFF]">
                <i className={icon}></i>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</div>
        </div>
    );
}
