import React, { useState, useRef, useEffect } from "react";
import {
  themeColor,
  gradientBg,
  cardStyle,
  buttonStyle,
  disabledButtonStyle,
} from "../styles";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function HomePage({ currentUser }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]); // TODO: Fetch from backend
  const [selectedCourse, setSelectedCourse] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null); // Add this line
  const [timer, setTimer] = useState(0); // Timer in ms
  const [running, setRunning] = useState(false);
  const [files, setFiles] = useState([]);
  const intervalRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);

  // Filter courses based on input
  const filteredcourses = courses.filter((course) =>
    course.code.toLowerCase().includes(inputValue.toLowerCase())
  );

  const uploadFiles = async (files) => {
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);
      formData.append("session_id", sessionId); // if your endpoint uses this

      try {
        const response = await axios.post(
          "http://10.89.249.11:5000/process_paper",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.success) {
          console.log(
            `File ${files[i].name} uploaded successfully`,
            response.data.data
          );
        } else {
          console.error(
            `Failed to upload ${files[i].name}:`,
            response.data.error
          );
        }
      } catch (error) {
        console.error(`Error uploading ${files[i].name}:`, error);
      }
    }

    setFiles([]); // clear files after upload if desired
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000/get_courses")
      .then((response) => {
        if (response.data.success) {
          setCourses(response.data.data.courses);
          setLoading(false);
          console.log(
            "Courses fetched successfully:",
            response.data.data.courses
          );
        } else {
          console.error("Failed to fetch courses:", response.data.error);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching courses!", error);
      });
  }, []);

  // Timer formatting
  const seconds = Math.floor(timer / 1000);
  const milliseconds = Math.floor((timer % 1000) / 10);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowDropdown(true);
  };

  const handleSelectcourse = (course) => {
    setSelectedCourse(course);
    setInputValue(course);
    setShowDropdown(false);
    if (inputRef.current) inputRef.current.blur(); // Blur input to hide dropdown
  };

  const handleAddcourse = () => {
    if (inputValue && !courses.includes(inputValue)) {
      axios
        .post("http://localhost:5000/create_course", {
          code: inputValue,
          name: inputValue,
        })
        .then((response) => {
          if (response.data.success) {
            setCourses((prev) => [
              ...prev,
              { code: inputValue, name: inputValue },
            ]);
            setSelectedCourse(inputValue);
            setInputValue("");
            setShowDropdown(false);
            console.log("Course added successfully:", inputValue);
          } else {
            console.error("Failed to add course:", response.data.error);
          }
        })
        .catch((error) => {
          console.error("There was an error adding the course!", error);
        });
    }
  };

  const onStart = () => {
    setRunning(true);
    axios
      .post("http://localhost:5000/create_session", {
        user_id: currentUser?.userid || 1,
        course_id: selectedCourse,
        paper_id: 1,
      })
      .then((response) => {
        if (response.data.success) {
          console.log("Session created successfully:", response.data);
          setSessionId(response.data.data.session_id);
        } else {
          console.error("Failed to create session:", response.data.error);
        }
      })
      .catch((error) => {
        console.error("There was an error creating the session!", error);
      });
    intervalRef.current = setInterval(() => {
      setTimer((t) => t + 10); // update every 10ms
    }, 10);
  };

  const onStop = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    navigate(`/report/${sessionId}`);
  };

  const addFile = (newFiles) => {
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };
  return loading ? (
    <>loading</>
  ) : (
    <div style={gradientBg}>
      <div style={cardStyle}>
        <label
          style={{
            display: "block",
            marginBottom: 20,
            fontWeight: 500,
            color: themeColor,
          }}
        >
          <span style={{ marginRight: 12 }}>Course Type:</span>
          <div
            style={{
              position: "relative",
              display: "inline-block",
              width: "70%",
            }}
          >
            <input
              ref={inputRef} // Add this prop
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              // onFocus={() => setShowDropdown(true)}
              style={{
                padding: "8px 16px",
                borderRadius: 6,
                border: `1px solid ${themeColor}`,
                fontSize: 16,
                background: "#f7f7f7",
                color: themeColor,
                width: "100%",
              }}
              placeholder="Type or select a course..."
            />
            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: `1px solid ${themeColor}33`,
                  borderRadius: 6,
                  boxShadow: "0 2px 8px rgba(81,37,122,0.08)",
                  zIndex: 10,
                  maxHeight: 150,
                  overflowY: "auto",
                }}
              >
                {filteredcourses.length > 0 ? (
                  filteredcourses.map((course) => (
                    <div
                      key={course.code}
                      onClick={() => handleSelectcourse(course.code)}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        color: themeColor,
                        background:
                          course.code === selectedCourse ? "#f3eaff" : "#fff",
                      }}
                    >
                      {course.code}
                    </div>
                  ))
                ) : (
                  <div style={{ padding: "10px 16px", color: "#aaa" }}>
                    No courses found.
                  </div>
                )}
                {inputValue &&
                  ![...courses.map((course) => course.code)].includes(
                    inputValue
                  ) && (
                    <div
                      onClick={handleAddcourse}
                      style={{
                        padding: "10px 16px",
                        cursor: "pointer",
                        color: themeColor,
                        background: "#e6e6fa",
                        fontWeight: 600,
                      }}
                    >
                      + Add "{inputValue}"
                    </div>
                  )}
              </div>
            )}
          </div>
        </label>
        <h1
          style={{
            width: "100%",
            padding: "16px 0",
            color: themeColor,
            textAlign: "center",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 1,
            marginBottom: 24,
          }}
        >
          Study Session
        </h1>

        <div style={{ margin: "24px 0", textAlign: "center" }}>
          <button
            onClick={onStart}
            disabled={running || !selectedCourse}
            style={
              running || !selectedCourse ? disabledButtonStyle : buttonStyle
            }
          >
            Start
          </button>
          <button
            onClick={onStop}
            disabled={!running}
            style={!running ? disabledButtonStyle : buttonStyle}
          >
            Stop
          </button>
        </div>
        <div
          style={{
            marginBottom: 24,
            textAlign: "center",
            fontSize: 20,
            fontWeight: 600,
            color: themeColor,
          }}
        >
          <span role="img" aria-label="timer" style={{ marginRight: 8 }}>
            ⏱️
          </span>
          Timer: {seconds}.{milliseconds.toString().padStart(2, "0")}s
        </div>
        <div style={{ marginBottom: 8, fontWeight: 500, color: themeColor }}>
          Upload Files:
        </div>
        <input
          type="file"
          multiple
          onChange={(e) => addFile(Array.from(e.target.files))}
          style={{
            display: "block",
            margin: "8px 0 16px 0",
            padding: "8px",
            borderRadius: 6,
            border: `1px solid ${themeColor}`,
            background: "#f7f7f7",
            color: themeColor,
          }}
        />
        <ul style={{ listStyle: "none", padding: 0 }}>
          {files.map((file, idx) => (
            <li
              key={file.name + idx}
              style={{
                background: "#f7f7f7",
                borderRadius: 6,
                marginBottom: 8,
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: `1px solid ${themeColor}33`,
              }}
            >
              <span style={{ fontWeight: 500, color: themeColor }}>
                {file.name}
              </span>
              <button
                onClick={() => removeFile(idx)}
                style={{
                  ...buttonStyle,
                  background: `linear-gradient(90deg, #ffecd2 0%, ${themeColor} 100%)`,
                  color: "#fff",
                  fontSize: 14,
                  padding: "6px 14px",
                  marginRight: 0,
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        {files.length > 0 && (
          <div
            style={{
              marginTop: 16,
              textAlign: "center",
              color: themeColor,
              fontWeight: 500,
            }}
          >
            <button
              onClick={() => uploadFiles(files)}
              style={{
                ...buttonStyle,
                background: `linear-gradient(90deg, #a8edea 0%, ${themeColor} 100%)`,
              }}
            >
              Upload Files
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
