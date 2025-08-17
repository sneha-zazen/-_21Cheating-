import React, { useState, useEffect } from "react";
import axios from "axios";
import { themeColor, gradientBg, cardStyle } from "../styles";
import { useNavigate } from "react-router-dom";

export default function StatsPage() {
  const navigate = useNavigate();
  const [sessionStats, setSessionStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [questionFrequencies, setQuestionFrequencies] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, coursesRes] = await Promise.all([
          axios.get("http://localhost:5000/get_user_stats"),
          axios.get("http://localhost:5000/get_courses"),
        ]);

        console.log("Session stats:", statsRes.data);
        setSessionStats(statsRes.data.data.user_stats || []);
        setCourses(coursesRes.data.data.courses || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateCourse = (courseId) => {
    setSelectedCourse(courseId);
    setQuestionFrequencies([]); // Clear questions from the previous course
    if (courseId) {
      axios
        .get(`http://localhost:5000/get_question_frequencies`, {
          params: { course_id: courseId },
        })
        .then((response) => {
          console.log("Question frequencies:", response.data);
          setQuestionFrequencies(response.data.data.question_frequencies || []);
        })
        .catch((error) => {
          console.error("Error fetching question frequencies:", error);
        });
    }
  };

  return loading ? (
    <>Loading...</>
  ) : (
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
          📊 User Statistics
        </h1>

        {/* Leaderboard */}
        <div
          style={{
            marginBottom: 24,
            padding: 16,
            border: `1px solid ${themeColor}22`,
            borderRadius: 12,
            background: "rgba(250,250,250,0.95)",
            boxShadow: `0 2px 8px ${themeColor}11`,
          }}
        >
          <h2 style={{ color: themeColor, marginBottom: 12 }}>
            🏆 Sessions Leaderboard
          </h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {sessionStats.map((user, index) => (
              <li
                key={user.user_id}
                style={{
                  marginBottom: 8,
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#333",
                }}
              >
                {index + 1}. {user.username} —{" "}
                <span style={{ color: themeColor }}>
                  {user.completed_sessions} sessions
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Course selector */}
        <div
          style={{
            marginBottom: 24,
            textAlign: "center",
          }}
        >
          <h2 style={{ color: themeColor, marginBottom: 12 }}>
            📘 Most Frequent Questions
          </h2>
          <select
            value={selectedCourse || ""}
            onChange={(e) => updateCourse(e.target.value)}
            style={{
              padding: "10px",
              borderRadius: 8,
              border: `1px solid ${themeColor}55`,
              width: "220px",
              fontSize: 16,
              color: "#333",
              backgroundColor: "rgba(255,255,255,0.85)",
            }}
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.code}
              </option>
            ))}
          </select>
        </div>

        {/* Question Frequencies */}
        {selectedCourse && (
          <div
            style={{
              padding: 16,
              border: `1px solid ${themeColor}22`,
              borderRadius: 12,
              background: "rgba(250,250,250,0.95)",
              boxShadow: `0 2px 8px ${themeColor}11`,
            }}
          >
            <h3 style={{ color: themeColor, marginBottom: 12 }}>
              Common Questions for Course ID: {selectedCourse}
            </h3>
            <ul style={{ listStyle: "none", padding: 0 }}>
              {questionFrequencies.map((question, index) => (
                <li
                  key={index}
                  style={{
                    marginBottom: 8,
                    fontSize: 15,
                    color: "#333",
                    padding: "8px 12px",
                    borderBottom: "1px solid #eee",
                    transition: "background-color 0.2s",
                  }}
                >
                  {question.question_text} —{" "}
                  <span style={{ color: themeColor, fontWeight: "bold" }}>
                    {question.count} times
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Go Back button */}
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "10px 24px",
              borderRadius: 8,
              border: "none",
              background: `linear-gradient(90deg, #a8edea 0%, ${themeColor} 100%)`,
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: `0 2px 8px ${themeColor}22`,
            }}
          >
            Go Back to Home Page
          </button>
        </div>
      </div>
    </div>
  );
}
