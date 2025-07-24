"use client";
import React, { useRef, useState } from "react";

interface Incident {
  id: number;
  tsStart: string;
  type: string;
  location: string;
}

interface IncidentTimelineProps {
  incidents: Incident[];
  currentTime: Date;
  onScrub: (date: Date) => void;
}

export default function IncidentTimeline({
  incidents,
  currentTime,
  onScrub,
}: IncidentTimelineProps) {
  const width = 600;
  const height = 60;
  const timelineY = 30;
  const startOfDay = new Date(currentTime);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(currentTime);
  endOfDay.setHours(23, 59, 59, 999);

  function getX(ts: string | Date) {
    const date = typeof ts === "string" ? new Date(ts) : ts;
    const minutes = date.getHours() * 60 + date.getMinutes();
    return (minutes / 1440) * width;
  }

  // Drag logic
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  function handlePointerDown(e: React.PointerEvent) {
    setDragging(true);
    handlePointerMove(e);
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const minutes = Math.max(0, Math.min(1440, (x / width) * 1440));
    const newTime = new Date(startOfDay);
    newTime.setMinutes(minutes);
    onScrub(newTime);
  }
  function handlePointerUp() {
    setDragging(false);
  }

  const [hovered, setHovered] = useState<Incident | null>(null);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{
        touchAction: "none",
        background: "#23272f",
        borderRadius: 12,
        boxShadow: "0 2px 8px 0 #0003"
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={dragging ? handlePointerMove : undefined}
      onPointerUp={handlePointerUp}
      onPointerLeave={() => { handlePointerUp(); setHovered(null); }}
    >
      {/* Timeline base */}
      <line x1={0} y1={timelineY} x2={width} y2={timelineY} stroke="#3b4252" strokeWidth={3} />
      {/* Hour markers */}
      {[...Array(25)].map((_, i) => (
        <line
          key={i}
          x1={(i * width) / 24}
          y1={timelineY - 10}
          x2={(i * width) / 24}
          y2={timelineY + 10}
          stroke="#4b5563"
        />
      ))}
      {/* Hour labels */}
      {[...Array(25)].map((_, i) => (
        <text
          key={i}
          x={(i * width) / 24}
          y={timelineY + 25}
          fontSize={11}
          textAnchor="middle"
          fill="#a1a1aa"
          fontWeight={500}
        >
          {i}:00
        </text>
      ))}
      {/* Incident markers with tooltips */}
      {incidents.map((incident) => {
        const x = getX(incident.tsStart);
        return (
          <g key={incident.id}>
            <circle
              cx={x}
              cy={timelineY}
              r={8}
              fill="#60a5fa"
              stroke="#fff"
              strokeWidth={2}
              onMouseEnter={() => setHovered(incident)}
              onMouseLeave={() => setHovered(null)}
            />
            {/* Tooltip */}
            {hovered && hovered.id === incident.id && (
              <foreignObject x={x - 70} y={timelineY - 65} width={140} height={60}>
                <div className="bg-gray-900 border border-gray-700 rounded shadow-lg px-3 py-2 text-xs text-gray-100 pointer-events-none"
                  style={{ minWidth: 100, textAlign: "center" }}>
                  <div className="font-bold mb-1">{incident.type}</div>
                  <div>{new Date(incident.tsStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-gray-400">{incident.location}</div>
                </div>
              </foreignObject>
            )}
          </g>
        );
      })}
      {/* Scrubber */}
      <rect
        x={getX(currentTime) - 5}
        y={timelineY - 18}
        width={10}
        height={36}
        fill="#2563eb"
        rx={4}
        cursor="pointer"
        onPointerDown={handlePointerDown}
        style={{ filter: "drop-shadow(0 2px 6px #2563eb88)" }}
      />
    </svg>
  );
}