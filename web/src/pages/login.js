import React, { useState } from "react";
import { themeColor, gradientBg, cardStyle } from "../styles";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: add backend integration for user login
    navigate("/home/1");
  };

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
          User
        </h1>
        <form
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
          onSubmit={(e) => handleSubmit(e)}
        >
          <label style={{ color: themeColor, fontWeight: 500 }}>
            User name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                marginLeft: 12,
                padding: "8px 16px",
                borderRadius: 6,
                border: `1px solid ${themeColor}`,
                fontSize: 16,
                background: "#f7f7f7",
                color: themeColor,
                width: "70%",
              }}
              placeholder="Enter your name"
            />
          </label>
        </form>
      </div>
    </div>
  );
}
