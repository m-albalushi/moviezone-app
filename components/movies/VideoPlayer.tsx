
import React, { useState } from 'react';

interface VideoPlayerProps {
  src: string;
  title: string;
  movieId: string;
  onPlayAction: (movieId: string) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, movieId, onPlayAction }) => {
  const [loadError, setLoadError] = useState(false);
  const [viewCounted, setViewCounted] = useState(false);

  const handleVideoError = () => {
    setLoadError(true);
  };
  
  const handlePlay = () => {
    if (!viewCounted) {
      onPlayAction(movieId);
      setViewCounted(true);
    }
  };

  // Attempt to reset error and view counted status if src changes
  React.useEffect(() => {
    setLoadError(false);
    setViewCounted(false);
  }, [src]);

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-2xl relative">
      {!loadError ? (
        <video
          controls
          src={src}
          title={title}
          className="w-full h-full"
          poster={`https://picsum.photos/seed/${title.replace(/[^a-zA-Z0-9]/g, '') || 'movie'}/1280/720`} // Basic poster from title, sanitized
          onError={handleVideoError}
          onCanPlay={() => setLoadError(false)} // If it becomes playable, clear error
          onPlay={handlePlay}
        >
          Your browser does not support the video tag.
        </video>
      ) : null}
      {loadError && (
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-black bg-opacity-90 text-white p-4">
          <p className="text-xl font-semibold mb-2 text-red-400">Video Unavailable</p>
          <p className="text-sm text-center text-gray-300">
            The video source could not be loaded.
            {src && src.startsWith('blob:') && (
              <span className="block mt-1">
                (This appears to be a local file. Local files are only available in the original browser session and may become invalid after a page refresh or if the browser tab was closed.)
              </span>
            )}
          </p>
           <p className="text-sm text-center text-gray-400 mt-2">Please check the video URL or try a different source.</p>
           {src && !src.startsWith('blob:') && <p className="text-xs text-gray-500 mt-1">URL: {src}</p>}
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
