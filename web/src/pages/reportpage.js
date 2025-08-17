import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function ReportPage({ currentUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const { sessionid } = useParams();

  const onGoBack = () => navigate("/");

  useEffect(() => {
    axios
      .get(`http://10.89.249.11:5000/get_session`, {
        params: { session_id: sessionid },
      })
      .then((response) => {
        if (response.data.success) {
          setReportData(response.data.data);
          setLoading(false);
        } else {
          console.error("Failed to fetch report data:", response.data.error);
        }
      })
      .catch((error) => {
        console.error("There was an error fetching report data!", error);
      });
  }, [sessionid]);

  if (loading) return <div>Loading...</div>;

  const { session, questions } = reportData;

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container card rounded-5 shadow-lg p-5">
        <h1 className="text-center display-4 fw-bold mb-4 text-dark">
          Report for {session.course_id} 📚
        </h1>
        <div className="d-flex flex-wrap justify-content-center gap-4 mb-5 text-secondary fw-bold fs-5">
          <div>
            <strong>Score:</strong> {session.score}
          </div>
          <div>
            <strong>Hints Used:</strong> {session.hint_count}
          </div>
          <div>
            <strong>Date Started:</strong> {session.date_created}
          </div>
        </div>
        <div className="row g-4">
          {questions.map((q, idx) => {
            const isCorrect = q.response?.trim() === q.correct_answer?.trim();
            const cardClass = isCorrect
              ? "border-success bg-success-subtle"
              : "border-danger bg-danger-subtle";
            return (
              <div key={idx} className="col-md-6">
                <div
                  className={`card h-100 p-4 rounded-4 shadow-sm ${cardClass}`}
                >
                  <h5 className="card-title fw-bold text-dark mb-3">
                    Q{idx + 1}. {q.question_text}
                  </h5>
                  <div className="card-body bg-white rounded p-3 mb-2 shadow-sm">
                    <p className="card-text fw-semibold mb-0">
                      Your Answer: {q.response || "(no response)"}
                    </p>
                  </div>
                  <div className="card-body bg-white rounded p-3 shadow-sm">
                    <p className="card-text fw-semibold mb-0">
                      Correct Answer: {q.correct_answer || "(not provided)"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center mt-5">
          <button
            onClick={onGoBack}
            className="btn btn-info btn-lg rounded-pill fw-bold text-white shadow-lg"
          >
            ⬅ Go Back to Home Page
          </button>
        </div>
      </div>
    </div>
  );
}
