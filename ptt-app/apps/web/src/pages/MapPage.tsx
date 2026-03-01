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
  return (
    <div className="map-page">
      <div className="map-widget">
        <div className="map-widget-body">
          <MapView
            height="100%"
            incidents={incidents}
            onIncidentClick={onIncidentClick}
          />
        </div>
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
  );
}
