import React from 'react';

interface IncidentPlayerProps {
  mainSrc: string;
  thumbnails: string[];
}

export default function IncidentPlayer({ mainSrc, thumbnails }: IncidentPlayerProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-[480px] h-[270px] bg-black rounded-lg overflow-hidden flex items-center justify-center mb-4">
        {/* Main video/image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={mainSrc} alt="Main CCTV" className="object-cover w-full h-full" />
      </div>
      <div className="flex gap-4">
        {thumbnails.map((src, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={idx}
            src={src}
            alt={`Camera thumbnail ${idx + 1}`}
            className="w-24 h-16 object-cover rounded shadow"
          />
        ))}
      </div>
    </div>
  );
} 