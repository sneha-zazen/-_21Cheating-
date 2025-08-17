import React, { useState, useRef } from "react";
import HomePage from "./pages/homepage";
import ReportPage from "./pages/reportpage";
import LoginPage from "./pages/login";
import { themeColor } from "./styles";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserInfoPage from "./pages/userpage";
import { useNavigate } from "react-router-dom";
import StatsPage from "./pages/stats";

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  function Header() {
    const navigate = useNavigate();

    return (
      <header
        style={{
          width: "100%",
          padding: "24px 0",
          background: themeColor,
          color: "#fff",
          textAlign: "center",
          fontSize: 28,
          fontWeight: 700,
          letterSpacing: 2,
          boxShadow: `0 2px 8px ${themeColor}22`,
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span style={{ flex: 1 }}>MCQ Study Assistant</span>
          <nav
            style={{
              position: "absolute",
              right: 32,
              top: 24,
              display: "flex",
              gap: 12,
            }}
          >
            <button
              onClick={() => navigate(`/home`)}
              style={{
                background: "transparent",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "none",
                transition: "background 0.2s",
              }}
            >
              Home
            </button>
            <button
              onClick={() => navigate(`/user`)}
              style={{
                background: "transparent",
                color: "#fff",
                border: "none",
                borderRadius: 1,
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "none",
                transition: "background 0.2s",
              }}
            >
              History
            </button>
            <button
              onClick={() => navigate(`/stats`)}
              style={{
                background: "transparent",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "none",
                transition: "background 0.2s",
              }}
            >
              Stats
            </button>
            <button
              onClick={() => navigate(`/`)}
              style={{
                background: "transparent",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 18px",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                boxShadow: "none",
                transition: "background 0.2s",
              }}
            >
              Log in
            </button>
          </nav>
        </div>
      </header>
    );
  }

  // Pass setPage to Header and all pages
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route
          path="/"
          element={<LoginPage setCurrentUser={setCurrentUser} />}
        />
        <Route path="/home" element={<HomePage currentUser={currentUser} />} />
        <Route
          path="/report/:sessionid"
          element={<ReportPage currentUser={currentUser} />}
        />
        <Route
          path="/user"
          element={<UserInfoPage currentUser={currentUser} />}
        />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
