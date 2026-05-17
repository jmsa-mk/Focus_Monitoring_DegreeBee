import { useEffect, useRef, useState } from "react";
import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

/**
 * useFaceTracker: runs MediaPipe Face Landmarker on a hidden video element
 * fed by the user's webcam. Returns the latest detection state.
 *
 * State signals (all null until first frame processed):
 *   facePresent : true if at least one face is in frame
 *   eyesClosed  : true if average blink score > threshold
 *   lookingAway : true if head yaw/pitch > 25 degrees
 *
 * Detection runs at the browser's render rate but throttled to ~10 fps
 * (we don't need 60fps for focus tracking).
 */
export function useFaceTracker(enabled) {
    const videoRef = useRef(null);
    const landmarkerRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(null);
    const lastDetectRef = useRef(0);

    const [ready, setReady] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [state, setState] = useState({
        facePresent: null,
        eyesClosed: null,
        lookingAway: null,
        blinkScore: 0,
        yaw: 0,
        pitch: 0,
    });

    useEffect(() => {
        if (!enabled) {
            cleanup();
            setReady(false);
            setLoading(false);
            setError(null);
            setState({
                facePresent: null,
                eyesClosed: null,
                lookingAway: null,
                blinkScore: 0,
                yaw: 0,
                pitch: 0,
            });
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        async function init() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
                );

                if (cancelled) return;

                const landmarker = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                        delegate: "GPU",
                    },
                    runningMode: "VIDEO",
                    outputFaceBlendshapes: true,
                    outputFacialTransformationMatrixes: true,
                    numFaces: 1,
                });

                if (cancelled) {
                    landmarker.close();
                    return;
                }

                landmarkerRef.current = landmarker;

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 320, height: 240, facingMode: "user" },
                    audio: false,
                });

                if (cancelled) {
                    stream.getTracks().forEach((t) => t.stop());
                    return;
                }

                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                setReady(true);
                setLoading(false);

                const detect = () => {
                    if (cancelled || !videoRef.current || !landmarkerRef.current) return;

                    const now = performance.now();
                    if (now - lastDetectRef.current >= 100) {
                        lastDetectRef.current = now;
                        try {
                            const result = landmarkerRef.current.detectForVideo(
                                videoRef.current,
                                now
                            );

                            if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
                                setState((prev) => ({
                                    ...prev,
                                    facePresent: false,
                                    eyesClosed: null,
                                    lookingAway: null,
                                }));
                            } else {
                                const blends = result.faceBlendshapes?.[0]?.categories || [];
                                const left = blends.find((c) => c.categoryName === "eyeBlinkLeft")?.score || 0;
                                const right = blends.find((c) => c.categoryName === "eyeBlinkRight")?.score || 0;
                                const blinkScore = (left + right) / 2;
                                const eyesClosed = blinkScore > 0.6;

                                let yaw = 0;
                                let pitch = 0;
                                const matrix = result.facialTransformationMatrixes?.[0]?.data;
                                if (matrix && matrix.length >= 16) {
                                    const m00 = matrix[0], m01 = matrix[4], m02 = matrix[8];
                                    const m10 = matrix[1], m11 = matrix[5], m12 = matrix[9];
                                    const m20 = matrix[2], m21 = matrix[6], m22 = matrix[10];

                                    yaw = (Math.atan2(m02, m22) * 180) / Math.PI;
                                    pitch = (Math.atan2(-m12, Math.sqrt(m02 * m02 + m22 * m22)) * 180) / Math.PI;
                                }

                                const lookingAway = Math.abs(yaw) > 25 || Math.abs(pitch) > 25;

                                setState({
                                    facePresent: true,
                                    eyesClosed,
                                    lookingAway,
                                    blinkScore,
                                    yaw,
                                    pitch,
                                });
                            }
                        } catch (e) {
                            
                        }
                    }

                    rafRef.current = requestAnimationFrame(detect);
                };

                rafRef.current = requestAnimationFrame(detect);
            } catch (e) {
                if (!cancelled) {
                    setError(e?.message || "Failed to initialize face tracking");
                    setLoading(false);
                }
            }
        }

        init();

        function cleanup() {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            if (landmarkerRef.current) {
                try {
                    landmarkerRef.current.close();
                } catch (e) {
                    // ignore
                }
                landmarkerRef.current = null;
            }
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((t) => t.stop());
                streamRef.current = null;
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        }

        return () => {
            cancelled = true;
            cleanup();
        };
    }, [enabled]);

    return { videoRef, ready, loading, error, state };
}
