"use client";

import React, { useEffect, useState } from 'react';
import IncidentRow from './IncidentRow';
import toast, { Toaster } from 'react-hot-toast';

interface Incident {
  id: number;
  thumbnailUrl: string;
  type: string;
  camera: { location: string };
  tsStart: string;
  tsEnd: string;
  resolved: boolean;
}

export default function IncidentList() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidents = () => {
    setLoading(true);
    setError(null);
    fetch('/api/incidents?resolved=false')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch incidents');
        return res.json();
      })
      .then((data) => setIncidents(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleResolve = async (id: number) => {
    setIncidents((prev) => prev.filter((i) => i.id !== id)); // Optimistic UI
    try {
      const res = await fetch(`/api/incidents/${id}/resolve`, { method: 'PATCH' });
      if (!res.ok) throw new Error('Failed to resolve incident');
      toast.success('Incident resolved!');
    } catch (error) {
      console.error('Error resolving incident:', error);
      toast.error('Failed to resolve incident.');
      // Revert optimistic update by refetching
      fetchIncidents();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-gray-800 rounded-lg shadow">
        <Toaster position="top-right" />
        <svg className="animate-spin h-8 w-8 text-blue-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <div className="text-gray-300 text-base">Loading incidents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-40 bg-gray-800 rounded-lg shadow">
        <Toaster position="top-right" />
        <div className="text-red-400 text-base font-semibold mb-2">Error loading incidents</div>
        <div className="text-gray-300 text-sm">{error}</div>
        <button
          className="mt-4 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800"
          onClick={fetchIncidents}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-800 rounded-lg shadow p-4">
      <Toaster position="top-right" />
      <h2 className="text-lg font-bold mb-4 text-gray-100">Unresolved Incidents</h2>
      {incidents.length === 0 ? (
        <div className="flex flex-col items-center mt-8">
          <svg className="h-16 w-16 text-gray-700 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 018 0v2m-4-4v4m0 0v4m0-4H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-7z" />
          </svg>
          <div className="text-gray-400">No unresolved incidents.</div>
        </div>
      ) : (
        incidents.map((incident) => (
          <IncidentRow
            key={incident.id}
            id={incident.id}
            thumbnailUrl={incident.thumbnailUrl}
            type={incident.type}
            cameraLocation={incident.camera.location}
            tsStart={incident.tsStart}
            tsEnd={incident.tsEnd}
            resolved={incident.resolved}
            onResolve={handleResolve}
          />
        ))
      )}
    </div>
  );
} 