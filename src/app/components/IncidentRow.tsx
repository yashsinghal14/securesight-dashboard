"use client";

import React, { useState } from 'react';

interface IncidentRowProps {
  id: number;
  thumbnailUrl: string;
  type: string;
  cameraLocation: string;
  tsStart: string;
  tsEnd: string;
  resolved: boolean;
  onResolve: (id: number) => void;
}

const typeColors: Record<string, string> = {
  'Unauthorised Access': 'bg-red-900 text-red-300',
  'Gun Threat': 'bg-yellow-900 text-yellow-300',
  'Suspicious Loitering': 'bg-blue-900 text-blue-300',
};

export default function IncidentRow({
  id,
  thumbnailUrl,
  type,
  cameraLocation,
  tsStart,
  tsEnd,
  resolved,
  onResolve,
}: IncidentRowProps) {
  const [fading, setFading] = useState(false);

  const handleResolve = () => {
    setFading(true);
    onResolve(id);
  };

  return (
    <div
      className={`flex items-center gap-4 p-3 rounded transition-opacity duration-500 bg-gray-900 shadow mb-2 hover:bg-gray-800 cursor-pointer ${
        fading ? 'opacity-30' : 'opacity-100'
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={thumbnailUrl} alt="Incident thumbnail" className="w-16 h-16 object-cover rounded" />
      <div className={`px-2 py-1 rounded font-semibold text-xs ${typeColors[type] || 'bg-gray-800 text-gray-200'}`}>{type}</div>
      <div className="flex-1">
        <div className="text-xs text-gray-400">{cameraLocation}</div>
        <div className="text-xs text-gray-500">
          {new Date(tsStart).toLocaleTimeString()} - {new Date(tsEnd).toLocaleTimeString()}
        </div>
      </div>
      {!resolved && (
        <button
          className="px-3 py-1 bg-green-700 text-white rounded hover:bg-green-800 transition"
          onClick={handleResolve}
        >
          Resolve
        </button>
      )}
    </div>
  );
} 