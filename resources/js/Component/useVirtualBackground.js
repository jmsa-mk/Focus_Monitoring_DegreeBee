import { useEffect, useRef } from "react";
import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";

/**
 * useVirtualBackground: runs MediaPipe Selfie Segmenter on a video element,
 * composites the segmented person over a custom background, and renders
 * the result into a canvas.
 *
 * Params:
 *   videoRef : React ref pointing to a <video> element (live webcam)
 *   enabled  : boolean, when false hook is inactive (no model, no draw)
 *   mode     : "blur" | "palette" | "ocean" | "dark" | "library"
 *
 * Returns:
 *   canvasRef : attach to a <canvas> element to display the result
 */
export function useVirtualBackground({ videoRef, enabled, mode }) {
    const canvasRef = useRef(null);
    const segmenterRef = useRef(null);
    const rafRef = useRef(null);
    const maskCanvasRef = useRef(null);

    useEffect(() => {
        if (!enabled) {
            cleanup();
            return;
        }

        let cancelled = false;

        async function init() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
                );

                if (cancelled) return;

                const segmenter = await ImageSegmenter.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath:
                            "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite",
                        delegate: "GPU",
                    },
                    runningMode: "VIDEO",
                    outputCategoryMask: true,
                    outputConfidenceMasks: false,
                });

                if (cancelled) {
                    segmenter.close();
                    return;
                }

                segmenterRef.current = segmenter;
                renderLoop();
            } catch (e) {

            }
        }

        function renderLoop() {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas) {
                rafRef.current = requestAnimationFrame(renderLoop);
                return;
            }

            const ctx = canvas.getContext("2d", { willReadFrequently: true });

            if (!maskCanvasRef.current) {
                maskCanvasRef.current = document.createElement("canvas");
            }
            const maskCanvas = maskCanvasRef.current;
            const maskCtx = maskCanvas.getContext("2d");

            const personCanvas = document.createElement("canvas");
            const personCtx = personCanvas.getContext("2d");

            let lastTime = 0;

            const tick = () => {
                if (cancelled) return;

                const now = performance.now();
                if (
                    now - lastTime >= 50 &&
                    video.videoWidth > 0 &&
                    segmenterRef.current
                ) {
                    lastTime = now;
                    try {
                        const w = video.videoWidth;
                        const h = video.videoHeight;

                        if (canvas.width !== w || canvas.height !== h) {
                            canvas.width = w;
                            canvas.height = h;
                            maskCanvas.width = w;
                            maskCanvas.height = h;
                            personCanvas.width = w;
                            personCanvas.height = h;
                        }

                        const result = segmenterRef.current.segmentForVideo(
                            video,
                            now
                        );
                        const maskData = result.categoryMask?.getAsUint8Array();

                        if (!maskData) {
                            rafRef.current = requestAnimationFrame(tick);
                            return;
                        }

                        const maskImage = maskCtx.createImageData(w, h);
                        const pixels = maskImage.data;
                        for (let i = 0, j = 0; i < pixels.length; i += 4, j++) {
                            const isPerson = maskData[j] === 0;
                            pixels[i + 3] = isPerson ? 255 : 0;
                        }
                        maskCtx.putImageData(maskImage, 0, 0);

                        drawBackground(ctx, mode, w, h, video);

                        personCtx.globalCompositeOperation = "source-over";
                        personCtx.clearRect(0, 0, w, h);
                        personCtx.drawImage(video, 0, 0, w, h);
                        personCtx.globalCompositeOperation = "destination-in";
                        personCtx.drawImage(maskCanvas, 0, 0);

                        ctx.drawImage(personCanvas, 0, 0);

                        result.categoryMask?.close?.();
                    } catch (e) {

                    }
                }

                rafRef.current = requestAnimationFrame(tick);
            };

            tick();
        }

        function cleanup() {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = null;
            }
            if (segmenterRef.current) {
                try {
                    segmenterRef.current.close();
                } catch (e) {

                }
                segmenterRef.current = null;
            }
        }

        init();

        return () => {
            cancelled = true;
            cleanup();
        };
    }, [enabled, mode, videoRef]);

    return { canvasRef };
}

function drawBackground(ctx, mode, w, h, video) {
    if (mode === "blur") {
        ctx.save();
        ctx.filter = "blur(20px)";
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();
        return;
    }

    if (mode === "palette") {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, "#00E2E0");
        g.addColorStop(1, "#797CFF");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        return;
    }

    if (mode === "ocean") {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, "#01A9F2");
        g.addColorStop(1, "#172D9D");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        return;
    }

    if (mode === "library") {
        const g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, "#213A58");
        g.addColorStop(1, "#0C2D34");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
        return;
    }

    if (mode === "dark") {
        ctx.fillStyle = "#0F172A";
        ctx.fillRect(0, 0, w, h);
        return;
    }

    ctx.fillStyle = "#1f2937";
    ctx.fillRect(0, 0, w, h);
}
