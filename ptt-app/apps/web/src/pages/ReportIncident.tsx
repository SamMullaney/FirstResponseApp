import React from "react";
import { useAuth } from "../auth/authContext";
import type { Incident, IncidentType } from "../data/incidents";
import { TYPE_LABELS } from "../data/incidents";

const INCIDENT_TYPES: IncidentType[] = ["fire", "medical", "police", "hazmat", "traffic"];

const DEFAULT_TITLES: Record<IncidentType, string> = {
  fire: "Structure Fire",
  medical: "Medical Emergency",
  police: "Police Response",
  hazmat: "Hazmat Incident",
  traffic: "Traffic Accident",
};

// Newark, DE fallback if geolocation is denied
const NEWARK_DE = { lat: 39.6837, lng: -75.7497 };

export default function ReportIncident({
  onSubmit,
  onBack,
}: {
  onSubmit: (incident: Incident) => void;
  onBack: () => void;
}) {
  const { logout } = useAuth();

  const [type, setType] = React.useState<IncidentType>("police");
  const [title, setTitle] = React.useState(DEFAULT_TITLES["police"]);
  const [address, setAddress] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [units, setUnits] = React.useState("");
  const [location, setLocation] = React.useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = React.useState(true);
  const [locError, setLocError] = React.useState<string | null>(null);

  // Auto-detect location on mount
  React.useEffect(() => {
    if (!navigator.geolocation) {
      setLocError("Geolocation not supported — defaulting to Newark, DE.");
      setLocation(NEWARK_DE);
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocation({ lat: coords.latitude, lng: coords.longitude });
        setLocating(false);
      },
      (err) => {
        setLocError(`Could not detect location (${err.message}) — defaulting to Newark, DE.`);
        setLocation(NEWARK_DE);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // When type changes, auto-update title if it still matches the previous default
  const prevTypeRef = React.useRef(type);
  function handleTypeChange(next: IncidentType) {
    if (title === "" || title === DEFAULT_TITLES[prevTypeRef.current]) {
      setTitle(DEFAULT_TITLES[next]);
    }
    prevTypeRef.current = next;
    setType(next);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!location || !address.trim()) return;

    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const incident: Incident = {
      id: `inc-${Date.now()}`,
      type,
      title: title.trim() || DEFAULT_TITLES[type],
      address: address.trim(),
      lat: location.lat,
      lng: location.lng,
      status: "active",
      time,
      units: units
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean),
      description: description.trim(),
    };

    onSubmit(incident);
    onBack();
  }

  const canSubmit = address.trim().length > 0 && !locating && location !== null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Report Incident</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} className="logout-btn">
            Cancel
          </button>
          <button onClick={logout} className="logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      <form className="report-form" onSubmit={handleSubmit}>
        {/* ── Type ── */}
        <div>
          <label>Incident Type</label>
          <div className="type-btn-group">
            {INCIDENT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                className={`type-btn${type === t ? ` active-${t}` : ""}`}
                onClick={() => handleTypeChange(t)}
              >
                {TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Title ── */}
        <div>
          <label htmlFor="report-title">Title</label>
          <input
            id="report-title"
            type="text"
            placeholder="e.g. Structure Fire"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* ── Address ── */}
        <div>
          <label htmlFor="report-address">
            Address <span style={{ color: "var(--color-error)" }}>*</span>
          </label>
          <input
            id="report-address"
            type="text"
            placeholder="e.g. 312 Main St, Newark, DE"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        {/* ── Description ── */}
        <div>
          <label htmlFor="report-desc">Description</label>
          <textarea
            id="report-desc"
            placeholder="Describe the situation — units needed, hazards, number of casualties…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* ── Units ── */}
        <div>
          <label htmlFor="report-units">Responding Units</label>
          <input
            id="report-units"
            type="text"
            placeholder="e.g. Engine 7, Medic 3, PD Unit 12"
            value={units}
            onChange={(e) => setUnits(e.target.value)}
          />
          <p className="form-hint">Comma-separated</p>
        </div>

        {/* ── Location ── */}
        <div>
          <label>Location</label>
          <div className={`location-detect${location ? " ready" : ""}`}>
            {locating ? (
              <>
                <span className="location-spinner" />
                Detecting your location…
              </>
            ) : location ? (
              <>
                <span style={{ color: "var(--color-success)" }}>&#10003;</span>
                {location.lat.toFixed(4)}°N &nbsp;{Math.abs(location.lng).toFixed(4)}°W
                {locError && (
                  <span style={{ marginLeft: 8, fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    ({locError})
                  </span>
                )}
              </>
            ) : (
              <span style={{ color: "var(--color-error)" }}>{locError}</span>
            )}
          </div>
        </div>

        <button type="submit" className="report-submit-btn" disabled={!canSubmit}>
          Submit Report
        </button>
      </form>
    </div>
  );
}
