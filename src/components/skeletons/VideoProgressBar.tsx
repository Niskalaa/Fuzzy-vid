import React from 'react';

const VideoProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="w-full bg-white/10 rounded-full h-2.5">
    <div
      className="bg-accent-orange h-2.5 rounded-full transition-all duration-500"
      style={{ width: `${progress}%` }}
    />
  </div>
);

export default VideoProgressBar;
