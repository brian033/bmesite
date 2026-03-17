"use client";

import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

interface ContestVideoProps {
    src?: string;
    title?: string;
}

export function ContestVideo({
    src = "https://cdn.beame2025.cc/contest_video/index.m3u8",
    title = "活動花絮影片(點擊播放)",
}: ContestVideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let hls: Hls | null = null;

        if (Hls.isSupported()) {
            hls = new Hls({
                debug: true,
                enableWorker: true,
                lowLatencyMode: true,
            });

            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log("HLS Manifest Parsed");
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error("Fatal network error encountered, trying to recover");
                            hls?.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error("Fatal media error encountered, trying to recover");
                            hls?.recoverMediaError();
                            break;
                        default:
                            console.error("Fatal error, cannot recover");
                            hls?.destroy();
                            break;
                    }
                    setError(`Video Error: ${data.type}`);
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            // For Safari/iOS which has native HLS support
            video.src = src;
        } else {
            setError("Your browser does not support HLS video playback.");
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [src]);

    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
            <h2 className="text-2xl font-semibold mb-4 text-center">{title}</h2>
            
            <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg bg-black relative">
                {error && (
                    <div className="absolute inset-0 flex items-center justify-center text-white bg-red-900/80 z-10 p-4 text-center">
                        <p>{error}</p>
                    </div>
                )}
                
                <video
                    ref={videoRef}
                    className="w-full h-full object-contain"
                    controls
                    playsInline
                    poster="/robot/robot_poster.jpg"
                />
            </div>
        </div>
    );
}
