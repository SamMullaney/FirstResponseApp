import { useEffect, useRef, useState, useCallback } from "react";
import MapView from "../components/MapView";
import type { Incident } from "../data/incidents";
import { TYPE_LABELS } from "../data/incidents";

export default function MapPage({
  incidents,
  onIncidentClick,
}: {
  incidents: Incident[];
  onIncidentClick: (id: string) => void;
}) {
  const [pos, setPos] = useState({ x: 16, y: 72 });
  const dragging = useRef(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragging.current = true;
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        posX: pos.x,
        posY: pos.y,
      };
      e.preventDefault();
    },
    [pos.x, pos.y]
  );

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!dragging.current) return;
      setPos({
        x: dragStart.current.posX + (e.clientX - dragStart.current.mouseX),
        y: dragStart.current.posY + (e.clientY - dragStart.current.mouseY),
      });
    }
    function onMouseUp() {
      dragging.current = false;
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  return (
    <div className="map-page">
      <div
        className="map-widget"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      >
        <div className="map-widget-handle" onMouseDown={onMouseDown}>
          <span className="map-widget-grip">⠿⠿</span>
          <span>Signal Map</span>
        </div>

        <div className="map-widget-body">
          <MapView
            height="100%"
            incidents={incidents}
            onIncidentClick={onIncidentClick}
          />
        </div>

        <div className="incident-log">
          <div className="incident-log-header">
            Active Incidents ({incidents.length})
          </div>
          <div className="incident-log-list">
            {incidents.map((inc) => (
              <button
                key={inc.id}
                className="incident-log-item"
                onClick={() => onIncidentClick(inc.id)}
              >
                <span className={`incident-type-badge incident-type-${inc.type}`}>
                  {TYPE_LABELS[inc.type]}
                </span>
                <span className="incident-log-title">{inc.title}</span>
                <span className="incident-log-address">{inc.address}</span>
                <span className={`incident-status-dot incident-status-${inc.status}`} />
                <span className="incident-log-time">{inc.time}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
