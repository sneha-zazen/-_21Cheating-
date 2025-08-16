import React, { useState } from "react";
import { themeColor, gradientBg, cardStyle, buttonStyle } from "../styles";
import { useNavigate, useParams } from "react-router-dom";

export default function UserInfoPage() {
  const { userid } = useParams();
  const [search, setSearch] = useState("");
  const [sessions, setSessions] = useState([
    // TODO add server call
    { sessionid: "CSSE4011 ", score: 85, hintsUsed: 2, time: "2025-02-15 14:30"},
    { sessionid: "ELEC4701", score: 92, hintsUsed: 0, time: "2025-01-15 14:30" },
    { sessionid: "CSSE1001", score: 74, hintsUsed: 3, time: "2025-02-03 14:30" },
  ]);
  const navigate = useNavigate();

  // Filter sessions by search
  const filteredSessions = sessions.filter(
    (s) =>
      s.sessionid.includes(search) ||
      s.score.toString().includes(search) ||
      s.hintsUsed.toString().includes(search)
  );

  return (
    <div style={gradientBg}>
      <div style={cardStyle}>
        <h1
          style={{
            textAlign: "center",
            marginBottom: 24,
            fontWeight: 700,
            letterSpacing: 1,
            color: themeColor,
          }}
        >
          Session History
        </h1>
        
        <div style={{ marginTop: 32 }}>
          <h2 style={{ color: themeColor, fontWeight: 600, marginBottom: 12 }}>
            Search Sessions
          </h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: `1px solid ${themeColor}`,
              fontSize: 16,
              background: "#f7f7f7",
              color: themeColor,
              width: "93%",
              marginBottom: 18,
            }}
            placeholder="Search by Course, score, or hints used..."
          />
          <div>
            {filteredSessions.length === 0 ? (
              <div style={{ color: "#aaa", textAlign: "center", marginTop: 24 }}>
                No sessions found.
              </div>
            ) : (
              filteredSessions.map((session) => (
                <div
                  key={session.sessionid}
                  onClick={() => navigate(`/report/${session.sessionid}`)}
                  style={{
                    background: "#f7f7f7",
                    borderRadius: 8,
                    padding: "16px 20px",
                    marginBottom: 14,
                    boxShadow: "0 2px 8px rgba(81,37,122,0.08)",
                    cursor: "pointer",
                    border: `1px solid ${themeColor}33`,
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{ fontWeight: 600, color: themeColor }}>
                    Session: {session.sessionid}
                  </div>
                  <div style={{ marginTop: 6, color: "#333" }}>
                    Score:{" "}
                    <span style={{ fontWeight: 500 }}>{session.score}</span>
                    {" | "}
                    Hints Used:{" "}
                    <span style={{ fontWeight: 500 }}>{session.hintsUsed}</span>
                  </div>
                  <div style={{ color: themeColor, textAlign: "right"}}>{session.time}</div>

                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
