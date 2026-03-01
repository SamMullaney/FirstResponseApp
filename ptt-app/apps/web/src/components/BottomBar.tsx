import React from "react";

interface Props {
  onPrimary?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
}

export default function BottomBar({ onLeft, onPrimary, onRight }: Props) {
  return (
    <nav className="bottom-bar" aria-label="Bottom navigation">
      <button className="bb-btn bb-left" onClick={onLeft} aria-label="Map">
        Map
      </button>

      <button className="bb-btn bb-primary" onClick={onPrimary} aria-label="Report Incident">
        REPORT
      </button>

      <button className="bb-btn bb-right" onClick={onRight} aria-label="Channels">
        Channels
      </button>
    </nav>
  );
}
