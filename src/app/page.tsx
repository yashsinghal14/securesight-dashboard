"use client";
import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import IncidentPlayer from "./components/IncidentPlayer";
import IncidentList from "./components/IncidentList";
import IncidentTimeline from "./components/IncidentTimeline";

interface Incident {
  id: number;
  thumbnailUrl: string;
  type: string;
  camera: { location: string };
  tsStart: string;
  tsEnd: string;
  resolved: boolean;
}

export default function Home() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/incidents?resolved=false")
      .then((res) => res.json())
      .then((data) => setIncidents(data))
      .finally(() => setLoading(false));
  }, []);

  // Find the incident closest to the currentTime
  const closestIncident = incidents.reduce((closest, incident) => {
    const incidentTime = new Date(incident.tsStart).getTime();
    const current = currentTime.getTime();
    if (!closest) return incident;
    const closestTime = new Date(closest.tsStart).getTime();
    return Math.abs(incidentTime - current) < Math.abs(closestTime - current)
      ? incident
      : closest;
  }, undefined as Incident | undefined);

  return (
    <div className="min-h-screen bg-[#181a20]">
      <Navbar />
      <main className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 p-8">
        {/* Left: Incident Player and Timeline */}
        <div className="flex-1 flex flex-col items-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[400px]">
              <svg className="animate-spin h-12 w-12 text-blue-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <div className="text-gray-300 text-lg">Loading incidents...</div>
            </div>
          ) : (
            <>
              {/* Selected time and incident label */}
              <div className="mb-4 w-[480px]">
                <div className="relative bg-gray-800 rounded-lg shadow-lg p-4 flex flex-col items-center border-l-4 border-blue-500">
                  <div className="absolute left-0 top-0 h-full w-1 bg-blue-500 rounded-l-lg" />
                  <div className="text-xs text-gray-400 mb-1 tracking-wide uppercase">Selected Time</div>
                  <div className="text-2xl font-mono font-bold mb-1 text-blue-400">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  {closestIncident ? (
                    <div className="text-base text-gray-200 flex items-center gap-2">
                      <span className={`font-semibold px-2 py-1 rounded ${closestIncident.type === 'Unauthorised Access' ? 'bg-red-900 text-red-300' : closestIncident.type === 'Gun Threat' ? 'bg-yellow-900 text-yellow-300' : 'bg-blue-900 text-blue-300'}`}>{closestIncident.type}</span>
                      <span className="text-gray-500">at</span>
                      <span className="font-semibold">{closestIncident.camera.location}</span>
                    </div>
                  ) : (
                    <div className="text-base text-gray-500">No incident at this time</div>
                  )}
                </div>
              </div>
              <IncidentPlayer
                mainSrc={closestIncident ? closestIncident.thumbnailUrl : "/thumbnails/incident1.jpg"}
                thumbnails={["/thumbnails/incident2.jpg", "/thumbnails/incident3.jpg"]}
              />
              <div className="mt-8">
                <IncidentTimeline
                  incidents={incidents.map(i => ({ id: i.id, tsStart: i.tsStart, type: i.type, location: i.camera.location }))}
                  currentTime={currentTime}
                  onScrub={setCurrentTime}
                />
              </div>
            </>
          )}
        </div>
        {/* Right: Incident List */}
        <div className="w-full md:w-[400px]">
          <IncidentList />
        </div>
      </main>
    </div>
  );
}
