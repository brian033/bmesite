"use client";

import dynamic from "next/dynamic";

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false }) as any; // eslint-disable-line

interface ContestVideoProps {
    src?: string;
    title?: string;
}

export function ContestVideo({
    src = "https://cdn.beame2025.cc/contest_video/index.m3u8",
    title = "活動花絮",
}: ContestVideoProps) {
    return (
        <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
            <h2 className="text-2xl font-semibold mb-4 text-center">{title}</h2>
            <div className="aspect-video w-full overflow-hidden rounded-lg shadow-lg bg-black relative">
                <ReactPlayer
                    url={src}
                    width="100%"
                    height="100%"
                    controls
                    playing={false}
                    playsinline
                    onError={(e: any) => console.error("Video Player Error:", e)}
                    config={{
                        file: {
                            forceHLS: true,
                            attributes: {
                                crossOrigin: "anonymous", // Helpful for CORS
                            },
                            hlsOptions: {
                                // Standard hls.js options
                                debug: false,
                                enableWorker: true,
                                lowLatencyMode: true,
                                backBufferLength: 90,
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
}
