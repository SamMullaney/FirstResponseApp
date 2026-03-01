import React from "react";
import { useAuth } from "../auth/authContext";
import VoiceChannel from "../components/VoiceChat";

export default function Channels({ onBack }: { onBack: () => void }) {
  const { logout, user } = useAuth();

  const channels = [
    { id: "general", name: "General (ALL)" },
    { id: "firefighters", name: "Firefighters 🚒" },
    { id: "police", name: "Police 🚔" },
    { id: "emt", name: "EMT 🚑" },
    { id :"FBI", name: "FBI 🕵" },
    { id: "CIA", name: "CIA 🦅" },
    {id: "NSA", name: "NSA 🛰️"},
    {id: "military", name: "Military 🪖"},
    {id: "news", name: "News 📰"},
  ];

  // members: mapping channelId -> string[] of display names
  const [members, setMembers] = React.useState<Record<string, string[]>>(() => {
    try {
      const raw = localStorage.getItem("channelMembers");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [chatHistory, setChatHistory] = React.useState<Record<string, { sender: string; text: string }[]>>(() => {
    try {
      const raw = localStorage.getItem("channelChatHistory");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  
  const [newMessage, setNewMessage] = React.useState("");

  const [joinedChannel, setJoinedChannel] = React.useState<string | null>(() => {
    try {
      return localStorage.getItem("joinedChannel");
    } catch {
      return null;
    }
  });

  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    try {
      localStorage.setItem("channelMembers", JSON.stringify(members));
    } catch {
      // ignore storage errors
    }
  }, [members]);

  React.useEffect(() => {
    try {
      if (joinedChannel) localStorage.setItem("joinedChannel", joinedChannel);
      else localStorage.removeItem("joinedChannel");
    } catch {
      // ignore storage errors
    }
  }, [joinedChannel]);

  // Utility to display current user
  const displayName = user?.email ?? "Unknown";

  function toggleJoin(id: string) {
    setMembers((prev) => {
      const isCurrentlyJoined = (prev[id] ?? []).includes(displayName);

      // remove user from all channels first
      const next: Record<string, string[]> = {};
      for (const [key, list] of Object.entries(prev)) {
        const filtered = list.filter((n) => n !== displayName);
        if (filtered.length > 0) next[key] = filtered;
      }

      // if user wasn't joined to the clicked channel, add them (single channel enforcement)
      if (!isCurrentlyJoined) {
        next[id] = Array.from(new Set([displayName, ...(prev[id] ?? [])]));
      }

      return next;
    });

    setJoinedChannel((prev) => (prev === id ? null : id));
  }

  // Ensure members mapping includes the joinedChannel on mount (sync localStorage)
  React.useEffect(() => {
    if (!joinedChannel) return;
    setMembers((prev) => {
      const list = prev[joinedChannel] ?? [];
      if (list.includes(displayName)) return prev;
      return { ...prev, [joinedChannel]: [...list, displayName] };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleExpanded(id: string) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  }



  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Channels</h1>
        <div>
          <button onClick={onBack} className="logout-btn" style={{ marginRight: 8 }}>
            Back
          </button>
          <button onClick={logout} className="logout-btn">
            Sign Out
          </button>
        </div>
      </header>

      <div className="channel-placeholder">
        <h2>Available Channels</h2>
        <ul style={{ marginTop: 12, listStyle: "none", padding: 0 }}>
          {channels.map((c) => {
            const list = members[c.id] ?? [];
            const isJoined = list.includes(displayName);
            const isOpen = !!expanded[c.id];

            return (
              <li key={c.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    className="bb-btn"
                    style={{ flex: 1, textAlign: "left" }}
                    onClick={() => toggleJoin(c.id)}
                  >
                    {c.name}
                  </button>

                  <button
                    className="bb-btn"
                    onClick={() => toggleExpanded(c.id)}
                    aria-expanded={isOpen}
                    style={{ minWidth: 56 }}
                  >
                    {isOpen ? "▲" : "▼"}
                  </button>

                  {isJoined && (
                    <span className="joined-badge" aria-hidden>
                      Joined
                    </span>
                  )}
                </div>

                {isOpen && (
                  <div className="members-list" style={{ marginTop: 8 }}>
                    {list.length === 0 ? (
                      <div className="member-item">No members</div>
                    ) : (
                      list.map((n) => (
                        <div key={n} className="member-item">
                          {n}
                          {n === displayName ? " (you)" : ""}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="channel-chat-container">
  <h3>Chat {joinedChannel ? `#${joinedChannel}` : ""}</h3>
      {joinedChannel && (
        <div style={{ marginTop: "1rem" }}>
          <VoiceChannel channelId={joinedChannel} />
        </div>
      )}

  <div className="chat-history">
    {(joinedChannel ? chatHistory[joinedChannel] ?? [] : []).map((msg, idx) => (
      <div
        key={idx}
        className={`chat-message ${msg.sender === displayName ? "you" : "other"}`}
      >
        <span className="chat-sender">{msg.sender === displayName ? "You" : msg.sender}:</span>
        <span className="chat-text">{msg.text}</span>
      </div>
    ))}
    {joinedChannel && (chatHistory[joinedChannel]?.length ?? 0) === 0 && (
      <div className="chat-empty">No messages yet</div>
    )}
  </div>

  <form
    className="chat-input-form"
    onSubmit={(e) => {
      e.preventDefault();
      if (!joinedChannel || !newMessage.trim()) return;

      const msg = { sender: displayName, text: newMessage.trim() };

      setChatHistory((prev) => {
        const next = { ...prev, [joinedChannel]: [...(prev[joinedChannel] ?? []), msg] };
        try {
          localStorage.setItem("channelChatHistory", JSON.stringify(next));
        } catch {}
        return next;
      });

      setNewMessage("");
    }}
  >
    <input
      type="text"
      placeholder={joinedChannel ? `Message #${joinedChannel}` : "Join a channel to chat"}
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      disabled={!joinedChannel}
    />
    <button type="submit" className="bb-primary" disabled={!joinedChannel || !newMessage.trim()}>
      Send
    </button>
  </form>
</div>
    </div>
  );
}
