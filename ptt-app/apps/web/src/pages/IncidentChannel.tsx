import React from "react";
import { useAuth } from "../auth/authContext";
import type { Incident } from "../data/incidents";
import { TYPE_LABELS } from "../data/incidents";

export default function IncidentChannel({
  incidents,
  incidentId,
  onBack,
  onResolve,
}: {
  incidents: Incident[];
  incidentId: string;
  onBack: () => void;
  onResolve: () => void;
}) {
  const { user, logout } = useAuth();
  const incident = incidents.find((i) => i.id === incidentId);
  const displayName = user?.email ?? "Unknown";

  const [messages, setMessages] = React.useState<
    { sender: string; text: string }[]
  >(() => {
    try {
      const raw = localStorage.getItem(`incidentChat_${incidentId}`);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [newMessage, setNewMessage] = React.useState("");
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!incident) {
    return (
      <div className="dashboard-container">
        <p style={{ color: "var(--color-text-muted)" }}>Incident not found.</p>
        <button className="logout-btn" onClick={onBack} style={{ marginTop: 16 }}>
          Back to Map
        </button>
      </div>
    );
  }

  function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const msg = { sender: displayName, text: newMessage.trim() };
    setMessages((prev) => {
      const next = [...prev, msg];
      try {
        localStorage.setItem(`incidentChat_${incidentId}`, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
    setNewMessage("");
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span className={`incident-type-badge incident-type-${incident.type}`}>
            {TYPE_LABELS[incident.type]}
          </span>
          {incident.title}
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onBack} className="logout-btn">
            Back to Map
          </button>
          <button onClick={logout} className="logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      <div className="incident-detail-card">
        <div className="incident-detail-row">
          <span className="incident-detail-label">Address</span>
          <span>{incident.address}</span>
        </div>
        <div className="incident-detail-row">
          <span className="incident-detail-label">Status</span>
          <span className={`incident-status-pill incident-status-${incident.status}`}>
            {incident.status.toUpperCase()}
          </span>
        </div>
        <div className="incident-detail-row">
          <span className="incident-detail-label">Dispatched</span>
          <span>{incident.time}</span>
        </div>
        <div className="incident-detail-row">
          <span className="incident-detail-label">Units</span>
          <span>{incident.units.join(" · ")}</span>
        </div>
        <div className="incident-detail-row">
          <span className="incident-detail-label">Notes</span>
          <span style={{ fontStyle: "italic", color: "var(--color-text-muted)" }}>
            {incident.description}
          </span>
        </div>

        <button
          className="resolve-btn"
          onClick={() => {
            if (window.confirm(`Mark "${incident.title}" as resolved? It will be removed from the map and log.`)) {
              onResolve();
            }
          }}
        >
          &#10003; Resolve Incident
        </button>
      </div>

      <div className="channel-chat-container">
        <h3>Incident Channel — {incident.id.toUpperCase()}</h3>

        <div className="chat-history">
          {messages.length === 0 && (
            <div className="chat-empty">
              No messages yet — be first to check in.
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-message ${msg.sender === displayName ? "you" : "other"}`}
            >
              <span className="chat-sender">
                {msg.sender === displayName ? "You" : msg.sender}:
              </span>
              <span className="chat-text">{msg.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={sendMessage}>
          <input
            type="text"
            placeholder="Message incident channel..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bb-primary"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
