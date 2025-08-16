import React, { useState } from "react";
import { themeColor, gradientBg, cardStyle } from "../styles";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage({ setCurrentUser }) {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      alert("Please enter your name");
      return;
    }

    // local address
    axios
      .post("http://10.89.249.11:5000/create_user", { username: name })
      .then((response) => {
        if (response.data.success) {
          console.log(response);
          setCurrentUser(response.data.data.userid);
          navigate(`/home/${response.data.data.userid}`);
        } else {
          console.log(response);
          alert("Failed to create user", response.data.error);
        }
      })
      .catch((error) => {
        axios
          .get("http://localhost:5000/get_user", {
            params: { username: name },
          })
          .then((response) => {
            if (response.data.success) {
              setCurrentUser(response.data.data.userid);
              navigate(`/home/${response.data.data.userid}`);
            }
          })
          .catch((error) => {
            console.error("There was an error fetching the user!", error);
            alert("Failed to fetch user data. Please try again.", error);
          });
      });
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
