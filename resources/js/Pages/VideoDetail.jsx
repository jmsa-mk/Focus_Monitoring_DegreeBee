import { Head, usePage, router } from "@inertiajs/react";
import Navbar from "../Component/Navbar";
import StarRating from "../Component/StarRating";
import { useEffect, useRef, useState, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";

const IDLE_THRESHOLD_MS = 90_000;
const TICK_MS = 1000;

const DISTRACTED_TIERS = [
    { seconds: 10, level: "warn", message: "Tetap fokus ya, jangan pindah tab!" },
    { seconds: 30, level: "error", message: "Sudah 30 detik kamu tidak fokus", beep: true },
    { seconds: 60, level: "overlay", message: "Apakah kamu masih belajar?" },
];

const IDLE_TIERS = [
    { seconds: 30, level: "info", message: "Masih disitu? Gerakkan mouse untuk lanjut" },
    { seconds: 90, level: "warn", message: "Sudah lama tidak ada aktivitas" },
];

const STATE = {
    FOCUSED: "focused",
    IDLE: "idle",
    DISTRACTED: "distracted",
    PAUSED: "paused",
};

const ACHIEVEMENT_RULES = [
    {
        name: "First Session",
        desc: "Complete your first focus session",
        icon: "fa-regular fa-file-video",
        check: (s) => s.session_count >= 1,
    },
    {
        name: "10 Sessions",
        desc: "Complete 10 focus sessions",
        icon: "fa-solid fa-bullseye",
        check: (s) => s.session_count >= 10,
    },
    {
        name: "1 Hour Focused",
        desc: "Accumulate 1 hour of focus time",
        icon: "fa-regular fa-clock",
        check: (s) => s.total_focus_seconds >= 3600,
    },
    {
        name: "Sharp Mind",
        desc: "Average focus score above 80%",
        icon: "fa-solid fa-brain",
        check: (s) => s.avg_focus_score >= 80,
    },
    {
        name: "Content Creator",
        desc: "Upload your first video",
        icon: "fa-regular fa-camera",
        check: (s) => s.videos_uploaded >= 1,
    },
    {
        name: "Class Builder",
        desc: "Create your first class",
        icon: "fa-solid fa-school",
        check: (s) => s.classes_created >= 1,
    },
];

const LEVELS = [
    { threshold: 50, name: "Platinum Bee", icon: "fa-solid fa-crown", color: "#172D9D" },
    { threshold: 10, name: "Gold Bee", icon: "fa-solid fa-star", color: "#01A9F2" },
    { threshold: 1, name: "Silver Bee", icon: "fa-solid fa-award", color: "#797CFF" },
    { threshold: 0, name: "Bronze Bee", icon: "fa-solid fa-medal", color: "#00E2E0" },
];

function getLevel(hours) {
    return LEVELS.find((l) => hours >= l.threshold);
}

function projectStats(before, sessionFocus, sessionUnfocus) {
    const sessionTotal = sessionFocus + sessionUnfocus;
    const sessionScore = sessionTotal > 0 ? (sessionFocus / sessionTotal) * 100 : 0;
    const newCount = before.session_count + 1;
    const newAvg =
        (before.avg_focus_score * before.session_count + sessionScore) / newCount;
    return {
        ...before,
        session_count: newCount,
        total_focus_seconds: before.total_focus_seconds + sessionFocus,
        avg_focus_score: newAvg,
    };
}

function diffAchievements(before, after) {
    return ACHIEVEMENT_RULES
        .filter((r) => r.check(after) && !r.check(before))
        .map(({ name, desc, icon }) => ({ name, desc, icon }));
}

function loadYouTubeAPI() {
    return new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
            resolve(window.YT);
            return;
        }

        const existingCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (existingCallback) existingCallback();
            resolve(window.YT);
        };

        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        }
    });
}

function beep(duration = 200, frequency = 440) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = frequency;
        osc.type = "sine";
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + duration / 1000);
    } catch (e) {
        // ignore
    }
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function getYoutubeId(link) {
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

export default function VideoDetail() {
    const { video, userRating, userStats } = usePage().props;

    const [focusState, setFocusState] = useState(STATE.FOCUSED);
    const [focusTime, setFocusTime] = useState(0);
    const [unfocusTime, setUnfocusTime] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);
    const [rating, setRating] = useState(userRating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [savingSession, setSavingSession] = useState(false);

    const focusTimeRef = useRef(0);
    const unfocusTimeRef = useRef(0);
    const lastActivityRef = useRef(Date.now());
    const stateStartRef = useRef(Date.now());
    const stateRef = useRef(STATE.FOCUSED);
    const distractedTriggeredRef = useRef(new Set());
    const idleTriggeredRef = useRef(new Set());
    const sessionSavedRef = useRef(false);
    const playerRef = useRef(null);
    const isVideoPlayingRef = useRef(true);

    useEffect(() => {
        focusTimeRef.current = focusTime;
        unfocusTimeRef.current = unfocusTime;
    }, [focusTime, unfocusTime]);

    useEffect(() => {
        stateRef.current = focusState;
        stateStartRef.current = Date.now();
        if (focusState === STATE.FOCUSED) {
            distractedTriggeredRef.current.clear();
            idleTriggeredRef.current.clear();
            setShowOverlay(false);
        }
    }, [focusState]);

    useEffect(() => {
        const onActivity = () => {
            lastActivityRef.current = Date.now();
            if (stateRef.current === STATE.IDLE && isVideoPlayingRef.current) {
                setFocusState(STATE.FOCUSED);
            }
        };

        window.addEventListener("mousemove", onActivity);
        window.addEventListener("keydown", onActivity);
        window.addEventListener("click", onActivity);
        window.addEventListener("scroll", onActivity);

        return () => {
            window.removeEventListener("mousemove", onActivity);
            window.removeEventListener("keydown", onActivity);
            window.removeEventListener("click", onActivity);
            window.removeEventListener("scroll", onActivity);
        };
    }, []);

    useEffect(() => {
        const onVisibility = () => {
            if (document.hidden) {
                setFocusState(STATE.DISTRACTED);
            } else {
                lastActivityRef.current = Date.now();
                setFocusState(isVideoPlayingRef.current ? STATE.FOCUSED : STATE.PAUSED);
            }
        };

        document.addEventListener("visibilitychange", onVisibility);
        return () => document.removeEventListener("visibilitychange", onVisibility);
    }, []);

    useEffect(() => {
        let cancelled = false;
        let player = null;

        const ytId = getYoutubeId(video.youtube_link);
        if (!ytId) return;

        loadYouTubeAPI().then((YT) => {
            if (cancelled) return;

            player = new YT.Player("yt-player", {
                events: {
                    onReady: () => {

                    },
                    onStateChange: (event) => {
                        const s = event.data;

                        if (s === YT.PlayerState.PLAYING) {
                            isVideoPlayingRef.current = true;
                            lastActivityRef.current = Date.now();
                            if (!document.hidden) {
                                setFocusState(STATE.FOCUSED);
                            }
                        } else if (
                            s === YT.PlayerState.PAUSED ||
                            s === YT.PlayerState.ENDED
                        ) {
                            isVideoPlayingRef.current = false;
                            if (!document.hidden) {
                                setFocusState(STATE.PAUSED);
                            }
                        }
                    },
                },
            });

            playerRef.current = player;
        });

        return () => {
            cancelled = true;
            if (playerRef.current?.destroy) {
                try {
                    playerRef.current.destroy();
                } catch (e) {

                }
                playerRef.current = null;
            }
        };
    }, [video.youtube_link]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const current = stateRef.current;

            if (
                current === STATE.FOCUSED &&
                !document.hidden &&
                isVideoPlayingRef.current
            ) {
                const idleFor = now - lastActivityRef.current;
                if (idleFor >= IDLE_THRESHOLD_MS) {
                    setFocusState(STATE.IDLE);
                    return;
                }
            }

            if (current === STATE.FOCUSED) {
                setFocusTime((t) => t + 1);
            } else if (current === STATE.PAUSED) {

            } else {

                setUnfocusTime((t) => t + 1);
            }


            const elapsedInState = Math.floor((now - stateStartRef.current) / 1000);

            if (current === STATE.DISTRACTED) {
                for (const tier of DISTRACTED_TIERS) {
                    if (
                        elapsedInState >= tier.seconds &&
                        !distractedTriggeredRef.current.has(tier.seconds)
                    ) {
                        distractedTriggeredRef.current.add(tier.seconds);
                        triggerWarning(tier);
                    }
                }
            } else if (current === STATE.IDLE) {
                for (const tier of IDLE_TIERS) {
                    if (
                        elapsedInState >= tier.seconds &&
                        !idleTriggeredRef.current.has(tier.seconds)
                    ) {
                        idleTriggeredRef.current.add(tier.seconds);
                        triggerWarning(tier);
                    }
                }
            }
        }, TICK_MS);

        return () => clearInterval(interval);
    }, []);

    const triggerWarning = useCallback((tier) => {
        switch (tier.level) {
            case "info":
                toast(tier.message, { icon: "💤", duration: 4000 });
                break;
            case "warn":
                toast(tier.message, {
                    icon: "⚠️",
                    duration: 4000,
                    style: {
                        background: "#FEF3C7",
                        color: "#92400E",
                    },
                });
                break;
            case "error":
                toast.error(tier.message, { duration: 5000 });
                if (tier.beep) {
                    beep(300, 660);
                    setTimeout(() => beep(300, 440), 350);
                }
                break;
            case "overlay":
                setShowOverlay(true);
                beep(500, 880);
                break;
            default:
                break;
        }
    }, []);

    const saveSession = useCallback(async (sync = false) => {
        if (sessionSavedRef.current) return null;
        const total = focusTimeRef.current + unfocusTimeRef.current;
        if (total < 1) return null;

        sessionSavedRef.current = true;

        const data = {
            video_id: video.id,
            total_time: total,
            focus_time: focusTimeRef.current,
            unfocus_time: unfocusTimeRef.current,
        };

        const payload = JSON.stringify(data);

        if (sync) {
            const blob = new Blob([payload], { type: "application/json" });
            if (navigator.sendBeacon) {
                navigator.sendBeacon("/focus-session", blob);
            } else {
                fetch("/focus-session", {
                    method: "POST",
                    body: blob,
                    keepalive: true,
                    headers: { "Content-Type": "application/json" },
                }).catch(() => {});
            }
            return null;
        }

        try {
            const res = await fetch("/focus-session", {
                method: "POST",
                body: payload,
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });
            return await res.json();
        } catch (e) {
            sessionSavedRef.current = false;
            return null;
        }
    }, [video.id]);


    const openSummary = useCallback(() => {
        const f = focusTimeRef.current;
        const u = unfocusTimeRef.current;
        const total = f + u;

        if (total < 5) {
            toast.error("Watch the video for a bit longer first.");
            return;
        }

        const sessionScore = total > 0 ? (f / total) * 100 : 0;
        const projected = projectStats(userStats, f, u);
        const newAchievements = diffAchievements(userStats, projected);

        const beforeHours = userStats.total_focus_seconds / 3600;
        const afterHours = projected.total_focus_seconds / 3600;
        const beforeLevel = getLevel(beforeHours);
        const afterLevel = getLevel(afterHours);
        const leveledUp =
            beforeLevel.name !== afterLevel.name ? { from: beforeLevel, to: afterLevel } : null;

        setSummaryData({
            focus: f,
            unfocus: u,
            total,
            score: sessionScore,
            newAchievements,
            leveledUp,
        });
        setShowSummary(true);
    }, [userStats]);

    const handleSaveAndContinue = useCallback(async () => {
        setSavingSession(true);
        const result = await saveSession(false);
        setSavingSession(false);

        setFocusTime(0);
        setUnfocusTime(0);
        sessionSavedRef.current = false;
        lastActivityRef.current = Date.now();

        setShowSummary(false);
        setSummaryData(null);

        if (result?.focus_score !== undefined) {
            toast.success(
                `Session saved! Focus: ${Math.round(result.focus_score)}%`
            );
        }
    }, [saveSession]);

    const handleDiscard = useCallback(() => {
        sessionSavedRef.current = true;
        setFocusTime(0);
        setUnfocusTime(0);
        setShowSummary(false);
        setSummaryData(null);
        setTimeout(() => {
            sessionSavedRef.current = false;
        }, 100);
        toast("Session discarded.");
    }, []);

    useEffect(() => {
        const onBeforeUnload = () => saveSession(true);
        window.addEventListener("beforeunload", onBeforeUnload);
        window.addEventListener("pagehide", onBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", onBeforeUnload);
            window.removeEventListener("pagehide", onBeforeUnload);
            saveSession(true);
        };
    }, [saveSession]);

  

    return (
        <>
            <Head title={video.title} />

            <div
                className="w-full min-h-screen bg-cover bg-top bg-no-repeat bg-fixed
                bg-[url('/resources/js/assets/Background/Background2.png')]
                dark:bg-[url('/resources/js/assets/Background/Background_Dark2.png')]"
            >
                <Navbar />
                <Toaster position="top-right" />





                <div
                    className="max-w-7xl mx-auto p-8 bg-white dark:bg-gray-900 mt-8 rounded-2xl shadow relative
                        border border-gray-200 dark:border-gray-700"
                >
                    {(() => {
                        const ytId = getYoutubeId(video.youtube_link);
                        const origin = typeof window !== "undefined" ? window.location.origin : "";
                        const embedSrc = ytId
                            ? `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(origin)}`
                            : null;

                        return (
                            <div className="mb-6">
                                <div className="aspect-video">
                                    {embedSrc ? (
                                        <iframe
                                            id="yt-player"
                                            className="w-full h-full rounded-xl"
                                            src={embedSrc}
                                            title={video.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <p className="text-gray-500 dark:text-gray-400">
                                                Invalid YouTube link
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {ytId && (
                                    <div className="mt-2 flex justify-end">
                                        <a
                                            href={`https://www.youtube.com/watch?v=${ytId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#01A9F2] hover:underline inline-flex items-center gap-1"
                                        >
                                            <i className="fa-brands fa-youtube"></i>
                                            Open in YouTube if video doesn't load
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                        {video.title}
                    </h1>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Topic: {video.topic}
                    </p>

                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Recommender: {video.user?.name}
                    </p>

                    <p className="text-gray-600 dark:text-gray-300 mt-3">
                        {video.notes || "No notes provided"}
                    </p>

                    <div className="mt-6">
                        <div className="font-medium text-gray-900 dark:text-white">
                            <StarRating
                                value={video.avg_rating || 0}
                                size="text-lg"
                                showCount
                                count={video.ratings_count}
                            />
                        </div>

                        <div
                            className="flex gap-2 mt-4 items-center"
                            onMouseLeave={() => setHoverRating(0)}
                        >
                            <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
                                {rating > 0 ? "Your rating:" : "Rate this video:"}
                            </span>
                            {[1, 2, 3, 4, 5].map((star) => {
                                const display = hoverRating || rating;
                                const filled = star <= display;
                                return (
                                    <button
                                        key={star}
                                        onClick={() => submitRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        className="text-2xl hover:scale-125 transition-transform cursor-pointer"
                                        title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                                    >
                                        <i
                                            className={`fa-solid fa-star ${
                                                filled
                                                    ? "text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]"
                                                    : "text-gray-300 dark:text-gray-600"
                                            }`}
                                        ></i>
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                onClick={() => {
                                    router.post(`/bookmark/${video.id}`, {}, {
                                        preserveScroll: true,
                                    });
                                }}
                                className="ml-auto w-10 h-10 flex items-center justify-center text-2xl hover:scale-125 transition-transform cursor-pointer"
                                title={video.is_bookmarked ? "Remove bookmark" : "Save to bookmarks"}
                            >
                                <i
                                    className={
                                        video.is_bookmarked
                                            ? "fa-solid fa-bookmark text-yellow-400 drop-shadow-[0_0_4px_rgba(250,204,21,0.5)]"
                                            : "fa-regular fa-bookmark text-gray-400 dark:text-gray-500 hover:text-yellow-400"
                                    }
                                ></i>
                            </button>
                        </div>
                    </div>
                </div>




                
            </div>
        </>
    );
}
