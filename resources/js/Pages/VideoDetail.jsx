import { Head, usePage, router } from "@inertiajs/react";
import Navbar from "../Component/Navbar";
import StarRating from "../Component/StarRating";
import CommentSection from "../Component/CommentSection";
import { useFaceTracker } from "../Component/useFaceTracker";
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
    const { video, userRating, userStats, comments, auth } = usePage().props;

    const [focusState, setFocusState] = useState(STATE.FOCUSED);
    const [focusTime, setFocusTime] = useState(0);
    const [unfocusTime, setUnfocusTime] = useState(0);
    const [cvDistractTime, setCvDistractTime] = useState(0);
    const [showOverlay, setShowOverlay] = useState(false);
    const [rating, setRating] = useState(userRating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState(null);
    const [savingSession, setSavingSession] = useState(false);

    // Face tracking (Computer Vision)
    const [cvEnabled, setCvEnabled] = useState(false);
    const [showCamera, setShowCamera] = useState(true);
    const faceTracker = useFaceTracker(cvEnabled);
    const faceAwaySinceRef = useRef(null); 
    const eyesClosedSinceRef = useRef(null);
    const lookingAwaySinceRef = useRef(null);
    const cvSignalRef = useRef("ok");
    const cvEnabledRef = useRef(false);
    const faceStateRef = useRef({
        facePresent: null,
        eyesClosed: null,
        lookingAway: null,
    });
    const faceReadyRef = useRef(false);

    const focusTimeRef = useRef(0);
    const unfocusTimeRef = useRef(0);
    const cvDistractTimeRef = useRef(0);
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
        cvDistractTimeRef.current = cvDistractTime;
    }, [focusTime, unfocusTime, cvDistractTime]);

    useEffect(() => {
        cvEnabledRef.current = cvEnabled;
        if (!cvEnabled) {
            faceAwaySinceRef.current = null;
            eyesClosedSinceRef.current = null;
            lookingAwaySinceRef.current = null;
            cvSignalRef.current = "ok";
        }
    }, [cvEnabled]);

    useEffect(() => {
        faceStateRef.current = faceTracker.state;
        faceReadyRef.current = faceTracker.ready;
    }, [faceTracker.state, faceTracker.ready]);

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
                    // ignore
                }
                playerRef.current = null;
            }
        };
    }, [video.youtube_link]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const current = stateRef.current;

            const CV_THRESHOLD_MS = 3000;
            if (cvEnabledRef.current && faceReadyRef.current) {
                const fs = faceStateRef.current;

                if (fs.facePresent === false) {
                    faceAwaySinceRef.current = faceAwaySinceRef.current || now;
                } else {
                    faceAwaySinceRef.current = null;
                }

                if (fs.eyesClosed === true) {
                    eyesClosedSinceRef.current = eyesClosedSinceRef.current || now;
                } else {
                    eyesClosedSinceRef.current = null;
                }

                if (fs.lookingAway === true) {
                    lookingAwaySinceRef.current = lookingAwaySinceRef.current || now;
                } else {
                    lookingAwaySinceRef.current = null;
                }

                let signal = "ok";
                if (faceAwaySinceRef.current && now - faceAwaySinceRef.current >= CV_THRESHOLD_MS) {
                    signal = "no_face";
                } else if (eyesClosedSinceRef.current && now - eyesClosedSinceRef.current >= CV_THRESHOLD_MS) {
                    signal = "drowsy";
                } else if (lookingAwaySinceRef.current && now - lookingAwaySinceRef.current >= CV_THRESHOLD_MS) {
                    signal = "looking_away";
                }

                const prevSignal = cvSignalRef.current;
                cvSignalRef.current = signal;

                if (signal !== "ok" && (current === STATE.FOCUSED || current === STATE.IDLE)) {
                    setFocusState(STATE.DISTRACTED);
                    if (prevSignal === "ok") {
                        const messages = {
                            no_face: "Wajah tidak terdeteksi, sedang dimana?",
                            drowsy: "Mata kamu tertutup, ngantuk?",
                            looking_away: "Kamu sedang menoleh, kembali fokus ya",
                        };
                        const iconClass = signal === "drowsy"
                            ? "fa-solid fa-bed text-yellow-500"
                            : signal === "no_face"
                            ? "fa-solid fa-user-slash text-red-500"
                            : "fa-solid fa-eye text-orange-500";
                        toast(messages[signal], {
                            icon: <i className={iconClass}></i>,
                            duration: 4000,
                        });
                    }
                    return;
                }

                if (signal === "ok" && current === STATE.DISTRACTED && !document.hidden && isVideoPlayingRef.current && prevSignal !== "ok") {
                    setFocusState(STATE.FOCUSED);
                    lastActivityRef.current = now;
                }
            }

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
                if (cvEnabledRef.current && cvSignalRef.current !== "ok") {
                    setCvDistractTime((t) => t + 1);
                }
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
                toast(tier.message, {
                    icon: <i className="fa-solid fa-bed text-blue-500"></i>,
                    duration: 4000,
                });
                break;
            case "warn":
                toast(tier.message, {
                    icon: <i className="fa-solid fa-triangle-exclamation text-yellow-600"></i>,
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
            cv_distract_time: cvDistractTimeRef.current,
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
        const cv = cvDistractTimeRef.current;
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
            cvDistract: cv,
            cvEnabled: cvEnabledRef.current,
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
        setCvDistractTime(0);
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
        setCvDistractTime(0);
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

    function submitRating(value) {
        setRating(value);
        router.post(`/videos/${video.id}/rate`, { rating: value }, { preserveScroll: true });
    }

    const totalTime = focusTime + unfocusTime;
    const focusScore = totalTime > 0 ? Math.round((focusTime / totalTime) * 100) : 100;

    const stateConfig = {
        [STATE.FOCUSED]: {
            color: "bg-green-500",
            ring: "ring-green-400",
            label: "Focused",
            text: "text-green-700 dark:text-green-300",
        },
        [STATE.IDLE]: {
            color: "bg-yellow-500",
            ring: "ring-yellow-400",
            label: "Idle",
            text: "text-yellow-700 dark:text-yellow-300",
        },
        [STATE.DISTRACTED]: {
            color: "bg-red-500",
            ring: "ring-red-400",
            label: "Distracted",
            text: "text-red-700 dark:text-red-300",
        },
        [STATE.PAUSED]: {
            color: "bg-[#01A9F2]",
            ring: "ring-[#01A9F2]",
            label: "Paused",
            text: "text-[#01A9F2] dark:text-[#797CFF]",
        },
    };

    const cfg = stateConfig[focusState];

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

                <div className="fixed top-24 right-6 z-30">
                    <div
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 w-64
                            border border-gray-200 dark:border-gray-700"
                    >
                        <div className="flex items-center gap-3">
                            <span className="relative flex h-3 w-3">
                                {focusState === STATE.FOCUSED && (
                                    <span
                                        className={`absolute inline-flex h-full w-full rounded-full ${cfg.color} opacity-75 animate-ping`}
                                    />
                                )}
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${cfg.color}`} />
                            </span>
                            <span className={`text-sm font-semibold ${cfg.text} inline-flex items-center gap-1.5`}>
                                {focusState === STATE.PAUSED && <i className="fa-solid fa-pause text-xs"></i>}
                                {cfg.label}
                            </span>
                            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                                {focusScore}%
                            </span>
                        </div>

                        {focusState === STATE.PAUSED && (
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 italic">
                                Tracking paused, video tidak diputar
                            </p>
                        )}

                        <div className="mt-3 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-linear-to-r from-[#00E2E0] to-[#797CFF] transition-all"
                                style={{ width: `${focusScore}%` }}
                            />
                        </div>

                        <div className="mt-3 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                    {formatTime(focusTime)}
                                </div>
                                <div>Focused</div>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                    {formatTime(unfocusTime)}
                                </div>
                                <div>Distracted</div>
                            </div>
                            <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                    {formatTime(totalTime)}
                                </div>
                                <div>Total</div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between mb-2">
                                <label className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={cvEnabled}
                                        onChange={(e) => setCvEnabled(e.target.checked)}
                                        className="w-4 h-4 accent-[#01A9F2]"
                                    />
                                    <i className="fa-solid fa-eye"></i>
                                    Eye Tracking
                                </label>
                                {cvEnabled && faceTracker.ready && (
                                    <button
                                        type="button"
                                        onClick={() => setShowCamera(!showCamera)}
                                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#01A9F2]"
                                        title={showCamera ? "Hide preview" : "Show preview"}
                                    >
                                        <i className={showCamera ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                                    </button>
                                )}
                            </div>

                            {cvEnabled && (
                                <div className="space-y-2">
                                    {faceTracker.loading && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-2">
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            Loading model & camera...
                                        </div>
                                    )}

                                    {faceTracker.error && (
                                        <div className="text-xs text-red-500 inline-flex items-center gap-2">
                                            <i className="fa-solid fa-triangle-exclamation"></i>
                                            {faceTracker.error}
                                        </div>
                                    )}

                                    <video
                                        ref={faceTracker.videoRef}
                                        playsInline
                                        muted
                                        className={`w-full rounded-lg border border-gray-200 dark:border-gray-700
                                            ${showCamera && faceTracker.ready ? "" : "hidden"}`}
                                        style={{ transform: "scaleX(-1)" }}
                                    />

                                    {faceTracker.ready && (
                                        <div className="grid grid-cols-3 gap-1 text-[10px] text-center">
                                            <div className={`rounded px-1 py-1 ${
                                                faceTracker.state.facePresent === false
                                                    ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                                                    : faceTracker.state.facePresent
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                            }`}>
                                                <i className="fa-solid fa-user mb-0.5"></i>
                                                <div>{faceTracker.state.facePresent === false ? "Hilang" : "Wajah"}</div>
                                            </div>
                                            <div className={`rounded px-1 py-1 ${
                                                faceTracker.state.eyesClosed
                                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                                                    : faceTracker.state.facePresent
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                            }`}>
                                                <i className="fa-solid fa-eye mb-0.5"></i>
                                                <div>{faceTracker.state.eyesClosed ? "Tutup" : "Mata"}</div>
                                            </div>
                                            <div className={`rounded px-1 py-1 ${
                                                faceTracker.state.lookingAway
                                                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300"
                                                    : faceTracker.state.facePresent
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                            }`}>
                                                <i className="fa-solid fa-arrows-up-down-left-right mb-0.5"></i>
                                                <div>{faceTracker.state.lookingAway ? "Menoleh" : "Lurus"}</div>
                                            </div>
                                        </div>
                                    )}

                                    {!faceTracker.ready && !faceTracker.loading && !faceTracker.error && (
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 italic">
                                            Webcam akan diminta. Pemrosesan 100% lokal di browser.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={openSummary}
                            disabled={totalTime < 5}
                            className="mt-4 w-full py-2 rounded-lg text-sm font-semibold
                                bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                dark:from-[#213A58] dark:to-[#172D9D]
                                text-white shadow hover:opacity-90 transition
                                disabled:opacity-40 disabled:cursor-not-allowed
                                inline-flex items-center justify-center gap-2"
                        >
                            <i className="fa-solid fa-flag-checkered"></i>
                            End Session
                        </button>
                    </div>
                </div>

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

                    <CommentSection
                        comments={comments || []}
                        videoId={video.id}
                        currentUserId={auth?.user?.id}
                    />
                </div>

                {showOverlay && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-10 max-w-md mx-4 text-center
                            border-2 border-red-400">
                            <div className="text-6xl mb-4 text-red-500">
                                <i className="fa-solid fa-triangle-exclamation"></i>
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                                Apakah kamu masih belajar?
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                                Kamu sudah tidak fokus selama lebih dari 1 menit.
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                Saat ini fokus kamu: <strong>{focusScore}%</strong>
                            </p>
                            <button
                                onClick={() => {
                                    setShowOverlay(false);
                                    setFocusState(STATE.FOCUSED);
                                    lastActivityRef.current = Date.now();
                                }}
                                className="w-full py-3 rounded-xl text-white font-semibold
                                    bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                    dark:from-[#213A58] dark:to-[#172D9D]
                                    hover:opacity-90 transition shadow-md"
                            >
                                Saya kembali, lanjut belajar
                            </button>
                        </div>
                    </div>
                )}

                {showSummary && summaryData && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl
                            w-full max-w-md max-h-[90vh] overflow-y-auto
                            border border-gray-200 dark:border-gray-700">

                            <div className="bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                dark:from-[#213A58] dark:to-[#172D9D]
                                p-6 text-white text-center rounded-t-3xl">
                                <div className="text-4xl mb-2">
                                    <i className="fa-solid fa-flag-checkered"></i>
                                </div>
                                <h2 className="text-2xl font-bold">Sesi Belajar Selesai</h2>
                                <p className="text-sm opacity-90 mt-1">
                                    Ini ringkasan sesi kamu
                                </p>
                            </div>

                            <div className="p-6 space-y-5">

                                <div className="flex flex-col items-center">
                                    <div className={`text-6xl font-bold ${
                                        summaryData.score >= 80
                                            ? "text-emerald-500"
                                            : summaryData.score >= 60
                                            ? "text-[#01A9F2]"
                                            : summaryData.score >= 40
                                            ? "text-yellow-500"
                                            : "text-red-500"
                                    }`}>
                                        {Math.round(summaryData.score)}%
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        Focus Score
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Focused</div>
                                        <div className="font-bold text-gray-900 dark:text-white mt-1">
                                            {formatTime(summaryData.focus)}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Distracted</div>
                                        <div className="font-bold text-gray-900 dark:text-white mt-1">
                                            {formatTime(summaryData.unfocus)}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                                        <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                                        <div className="font-bold text-gray-900 dark:text-white mt-1">
                                            {formatTime(summaryData.total)}
                                        </div>
                                    </div>
                                </div>

                                {/* CV Breakdown */}
                                {summaryData.cvEnabled && summaryData.unfocus > 0 && (
                                    <div className="rounded-2xl border border-[#01A9F2]/40 p-4 bg-[#BAFFFE]/20 dark:bg-[#172D9D]/20">
                                        <div className="text-xs uppercase tracking-wide text-[#01A9F2] dark:text-[#797CFF] font-bold mb-2 inline-flex items-center gap-2">
                                            <i className="fa-solid fa-eye"></i>
                                            Eye Tracking Detection
                                        </div>

                                        {summaryData.cvDistract > 0 ? (
                                            <>
                                                <div className="flex items-baseline justify-between text-sm mb-2">
                                                    <span className="text-gray-600 dark:text-gray-300">
                                                        CV detected distraction
                                                    </span>
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {formatTime(summaryData.cvDistract)}
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-linear-to-r from-[#00E2E0] to-[#797CFF]"
                                                        style={{
                                                            width: `${Math.min(100, (summaryData.cvDistract / summaryData.unfocus) * 100)}%`,
                                                        }}
                                                    />
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                                    {Math.round((summaryData.cvDistract / summaryData.unfocus) * 100)}% dari distraction dideteksi oleh kamera (mata tertutup / menoleh / wajah hilang).
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-xs text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1.5">
                                                <i className="fa-solid fa-circle-check"></i>
                                                Tidak ada distraksi terdeteksi oleh kamera. Sisanya karena pindah tab atau idle.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {summaryData.leveledUp && (
                                    <div className="rounded-2xl border-2 border-[#797CFF] dark:border-[#172D9D]
                                        p-4 bg-[#BAFFFE]/40 dark:bg-[#172D9D]/30">
                                        <div className="text-xs uppercase tracking-wide text-[#172D9D] dark:text-[#797CFF] font-bold mb-2 inline-flex items-center gap-2">
                                            <i className="fa-solid fa-arrow-up"></i>
                                            Level Up!
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                <i className={summaryData.leveledUp.from.icon + " mr-1"}></i>
                                                {summaryData.leveledUp.from.name}
                                            </span>
                                            <i className="fa-solid fa-arrow-right text-gray-400"></i>
                                            <span className="font-bold" style={{ color: summaryData.leveledUp.to.color }}>
                                                <i className={summaryData.leveledUp.to.icon + " mr-1"}></i>
                                                {summaryData.leveledUp.to.name}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {summaryData.newAchievements.length > 0 && (
                                    <div>
                                        <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-bold mb-2 inline-flex items-center gap-2">
                                            <i className="fa-solid fa-trophy text-yellow-500"></i>
                                            New Achievements
                                        </div>
                                        <div className="space-y-2">
                                            {summaryData.newAchievements.map((a) => (
                                                <div
                                                    key={a.name}
                                                    className="flex items-center gap-3 p-3 rounded-xl
                                                        border-2 border-[#01A9F2] bg-[#BAFFFE]/30 dark:bg-[#172D9D]/30 dark:border-[#797CFF]"
                                                >
                                                    <div className="text-2xl text-[#01A9F2] dark:text-[#797CFF]">
                                                        <i className={a.icon}></i>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-semibold text-sm text-gray-900 dark:text-white">
                                                            {a.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            {a.desc}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="text-center text-sm text-gray-600 dark:text-gray-300 italic">
                                    {summaryData.score >= 90 && "Luar biasa! Konsentrasimu hampir sempurna."}
                                    {summaryData.score >= 75 && summaryData.score < 90 && "Bagus! Pertahankan fokus seperti ini."}
                                    {summaryData.score >= 60 && summaryData.score < 75 && "Cukup baik. Coba kurangi distraksi lain kali."}
                                    {summaryData.score >= 40 && summaryData.score < 60 && "Banyak distraksi. Coba environment lebih tenang."}
                                    {summaryData.score < 40 && "Mungkin saat ini bukan waktu terbaik untuk belajar?"}
                                </div>
                            </div>

                            <div className="p-6 pt-0 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleDiscard}
                                    disabled={savingSession}
                                    className="flex-1 py-3 rounded-xl border border-gray-300 dark:border-gray-600
                                        text-gray-700 dark:text-gray-200
                                        hover:bg-gray-100 dark:hover:bg-gray-800
                                        font-semibold transition disabled:opacity-50
                                        inline-flex items-center justify-center gap-2"
                                >
                                    <i className="fa-solid fa-trash"></i>
                                    Discard
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSaveAndContinue}
                                    disabled={savingSession}
                                    className="flex-1 py-3 rounded-xl text-white font-semibold
                                        bg-linear-to-r from-[#00E2E0] to-[#797CFF]
                                        dark:from-[#213A58] dark:to-[#172D9D]
                                        hover:opacity-90 transition shadow-md disabled:opacity-50
                                        inline-flex items-center justify-center gap-2"
                                >
                                    {savingSession ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-floppy-disk"></i>
                                            Save & Continue
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
