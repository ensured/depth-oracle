import { useEffect, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css"; // Import Video.js CSS

// Extract the player type from the videojs function return type
type VideoJsPlayerType = ReturnType<typeof videojs>;

interface VideoJSProps {
  options: Parameters<typeof videojs>[1];
  onReady?: (player: VideoJsPlayerType) => void;
}

export const VideoJS = (props: VideoJSProps) => {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<VideoJsPlayerType | null>(null);
  const { options, onReady } = props;

  useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // For React 18 Strict Mode, create the video-js element inside the ref
      const videoElement = document.createElement("video-js");
      videoElement.classList.add("vjs-big-play-centered");
      videoRef.current?.appendChild(videoElement);

      const player = (playerRef.current = videojs(videoElement, options, () => {
        videojs.log("player is ready");
        if (onReady) {
          onReady(player);
        }
      }));
    } else {
      // Update existing player on prop changes (e.g., new sources)
      const player = playerRef.current;
      player?.autoplay(options.autoplay);
      player?.src(options.sources);
    }
  }, [options, videoRef, onReady]); // Re-run if options, videoRef, or onReady change

  // Dispose the player on unmount
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRef} />
    </div>
  );
};

export default VideoJS;
