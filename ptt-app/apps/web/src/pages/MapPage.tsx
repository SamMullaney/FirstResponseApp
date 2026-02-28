import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "../auth/authContext";
import MapView from "../components/MapView";

interface Props {
  onProfile?: () => void;
}

export default function MapPage({ onProfile }: Props) {
  const { logout } = useAuth();
  const [pos, setPos] = useState({ x: 24, y: 72 });
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
      <header className="map-page-header">
        <span className="map-page-title">FirstResponse PTT</span>
        <div style={{ display: "flex", gap: 8 }}>
          {onProfile && (
            <button className="logout-btn" onClick={onProfile}>
              Profile
            </button>
          )}
          <button className="logout-btn" onClick={logout}>
            Sign Out
          </button>
        </div>
      </header>

      <div
        className="map-widget"
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      >
        <div className="map-widget-handle" onMouseDown={onMouseDown}>
          <span className="map-widget-grip">⠿⠿</span>
          <span>Signal Map</span>
        </div>
        <div className="map-widget-body">
          <MapView height="100%" />
        </div>
      </div>
    </div>
  );
}
