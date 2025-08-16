import React, { useState, useRef } from "react";
import HomePage from "./pages/homepage";
import ReportPage from "./pages/reportpage";
import UserInfoPage from "./pages/userpage";
import { themeColor } from "./styles";

function Header({ page, setPage }) {
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
            onClick={() => setPage("home")}
            style={{
              background: page === "home" ? "#fff" : "transparent",
              color: page === "home" ? themeColor : "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: page === "home" ? `0 2px 8px ${themeColor}22` : "none",
              transition: "background 0.2s",
            }}
          >
            Home
          </button>
          <button
            onClick={() => setPage("report")}
            style={{
              background: page === "report" ? "#fff" : "transparent",
              color: page === "report" ? themeColor : "#fff",
              border: "none",
              borderRadius: 6,
              padding: "8px 18px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              boxShadow:
                page === "report" ? `0 2px 8px ${themeColor}22` : "none",
              transition: "background 0.2s",
            }}
          >
            Report
          </button>
          <button
            onClick={() => setPage("user")}
            style={{
              background: page === "user" ? "#fff" : "transparent",
              color: page === "user" ? themeColor : "#fff",
              border: "none",
              borderRadius: 1,
              padding: "8px 18px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: page === "user" ? `0 2px 8px ${themeColor}22` : "none",
              transition: "background 0.2s",
            }}
          >
            User
          </button>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  const [page, setPage] = useState("home");
  const [subjects, setSubjects] = useState(["ENGG4901", "CSSE1001", "PYSCH"]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [timer, setTimer] = useState(0); // timer in ms
  const [running, setRunning] = useState(false);
  const [files, setFiles] = useState([]);
  const intervalRef = useRef(null);

  // Dummy report data
  const [score, setScore] = useState(0);
  const reportData = {
    left: ["Result A", "Result B", "Result C"],
    right: ["Detail 1", "Detail 2", "Detail 3"],
  };

  const addFile = (newFiles) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleStart = () => {
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTimer((t) => t + 10); // update every 10ms
    }, 10);
  };

  const handleStop = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setScore(Math.floor(Math.random() * 100)); // Dummy score
    setPage("report");
  };

  const handleGoBack = () => {
    setPage("home");
    setTimer(0);
    setRunning(false);
    setFiles([]);
    setSelectedCourse("");
  };

  // Pass setPage to Header and all pages
  return (
    <>
      <Header page={page} setPage={setPage} />
      {page === "home" && (
        <HomePage
          onStart={handleStart}
          onStop={handleStop}
          timer={timer}
          running={running}
          files={files}
          addFile={addFile}
          removeFile={removeFile}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          subjects={subjects}
          setSubjects={setSubjects}
        />
      )}
      {page === "report" && (
        <ReportPage
          score={score}
          reportData={reportData}
          onGoBack={handleGoBack}
        />
      )}
      {page === "user" && <UserInfoPage />}
    </>
  );
}
