from flask import Flask, request, jsonify
import sqlite3
import os
from werkzeug.utils import secure_filename
from model import process_image, process_paper, get_hint
from flask_cors import CORS
from datetime import datetime
import base64
from io import BytesIO
import pprint

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configure user folder
USERS_FOLDER = "users"
os.makedirs(USERS_FOLDER, exist_ok=True)
app.config["USERS_FOLDER"] = USERS_FOLDER

COURSES_FOLDER = "courses"
os.makedirs(COURSES_FOLDER, exist_ok=True)
app.config["COURSES_FOLDER"] = COURSES_FOLDER

SESSION_FOLDER = "sessions"
os.makedirs(SESSION_FOLDER, exist_ok=True)
app.config["SESSION_FOLDER"] = SESSION_FOLDER

PAPERS_FOLDER = "papers"
os.makedirs(PAPERS_FOLDER, exist_ok=True)
app.config["PAPERS_FOLDER"] = PAPERS_FOLDER

SESSION_ANSWER_FOLDER = "session_answers"
os.makedirs(SESSION_ANSWER_FOLDER, exist_ok=True)
app.config["SESSION_ANSWER_FOLDER"] = SESSION_ANSWER_FOLDER

QUESTIONS_FOLDER = "questions"
os.makedirs(QUESTIONS_FOLDER, exist_ok=True)
app.config["QUESTIONS_FOLDER"] = QUESTIONS_FOLDER

# Initialize SQLite DB
def init_db():
    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    # c.execute("DROP TABLE IF EXISTS users")
    # c.execute("DROP TABLE IF EXISTS courses")
    # c.execute("DROP TABLE IF EXISTS sessions")
    # c.execute("DROP TABLE IF EXISTS papers")
    # c.execute("DROP TABLE IF EXISTS session_answers")
    # c.execute("DROP TABLE IF EXISTS questions")
    
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL UNIQUE
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS courses (
            code TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id INTEGER,
            user_id INTEGER,
            paper_id INTEGER,
            active INTEGER DEFAULT 1,
            hint_count INTEGER DEFAULT 0,
            score INTEGER DEFAULT 0,
            date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            date_finished TIMESTAMP DEFAULT NULL,
            FOREIGN KEY (course_id) REFERENCES courses (id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (paper_id) REFERENCES papers (id)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS papers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER NOT NULL,
            course_id TEXT NOT NULL,
            type TEXT DEFAULT 'final',
            FOREIGN KEY (course_id) REFERENCES courses (code)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS session_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER,
            question_id INTEGER,
            response TEXT,
            hint_used INTEGER DEFAULT 0,
            FOREIGN KEY (session_id) REFERENCES sessions (id),
            FOREIGN KEY (question_id) REFERENCES questions (id)
        )
    ''')
    c.execute('''
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_text TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            paper_id INTEGER,
            FOREIGN KEY (paper_id) REFERENCES papers (id)
        )
    ''')
    conn.commit()
    conn.close()

init_db()

# Endpoint 1: Upload image and return JSON response
@app.route("/process_image", methods=["POST"])
def process_image_endpoint():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request must be JSON"}), 400

    if "image" not in data:
        return jsonify({"error": "No image provided"}), 400

    try:
        # Decode base64 image from JSON payload
        image_bytes = base64.b64decode(data["image"])
        image_file = BytesIO(image_bytes)

        # Optional: verify image opens correctly
        # img = Image.open(image_file)
        # img.verify()

    except Exception as e:
        return jsonify({"error": f"Invalid image data: {str(e)}"}), 400

    # Process the image using your model function
    result = process_image(image_file)  # modify process_image to accept BytesIO

    if not result:
        return jsonify({"error": "No question or answer found in the image"}), 400
    
    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("SELECT id FROM sessions WHERE active = 1")
    session = c.fetchone()
    if not session:
        return jsonify({"error": "No active session found"}), 400
    session_id = session[0]
    
    pprint.pprint(result)
    
   
    for item in result:
        c.execute(
            "INSERT INTO session_answers (session_id, question_id, response) VALUES (?, ?, ?)",
            (session_id, item["question"], item["response"])
        )
    for i, question in enumerate(result):
        c.execute("SELECT id FROM questions WHERE question_text = ?", (question["question"],))
        question_id = c.fetchone()
        if not question_id:
            c.execute(
                "INSERT INTO questions (question_text, correct_answer) VALUES (?, ?)",
                (question["question"], None)
            )
            question_id = c.lastrowid
        c.execute(
            "SELECT correct_answer FROM questions WHERE question_text = ?",
            (question["question"],)
        )
        correct_answer = c.fetchone()
        if correct_answer:
            result[i]["correct_answer"] = correct_answer[0]
            result[i]["AI_response"] = False
        else:
            result[i]["AI_response"] = True
        if correct_answer and question["response"] == correct_answer[0]:
            c.execute("UPDATE sessions SET score = score + 1 WHERE id = ?", (session_id,))
            result[i]["hint"] = "Correct answer!"
        else:
            result[i]["hint"] = get_hint(question["question"], question["response"], correct_answer[0] if correct_answer else None)
            c.execute("UPDATE sessions SET hint_count = hint_count + 1 WHERE id = ?", (session_id,))
            

    
    conn.commit()
    
    
    conn.close()

    return jsonify({"message": "Image processed successfully", "data": result, "success": True}), 200

# Endpoint 2: Save JSON into SQLite
@app.route("/create_user", methods=["POST"])
def create_user():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()
    print("Received data:", data)

    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users (username) VALUES (?)", (data["username"],))
        userid = c.lastrowid
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({"error": "Username already exists"}), 400
    conn.close()
    
    response = {
        "message": "User created successfully",
        "data": {
            "userid": userid,
        },
        "success": True
    }

    return jsonify(response), 201

@app.route("/get_user", methods=["GET"])
def get_user():
    userid = request.args.get("userid")
    username = request.args.get("username")
    if not userid and not username:
        return jsonify({"error": "User ID or username is required"}), 400
    
    print("Received user ID:", userid)


    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    try:
        if userid:
            c.execute("SELECT * FROM users WHERE user_id = ?", (userid,))
        else:
            c.execute("SELECT * FROM users WHERE username = ?", (username,))
        user = c.fetchone()
        if not user:
            conn.close()
            return jsonify({"error": "User not found", "success": False}), 404
    except sqlite3.Error as e:
        conn.close()
        return jsonify({"error": str(e), "success": False}), 500
    conn.close()

    if not user:
        return jsonify({"error": "User not found", "success": False}), 404
    data = {
        "username": user[1] if user else None,
        "userid": user[0] if user else None,
    }

    if user:
        return jsonify({"data": data, "success": True}), 200
    else:
        return jsonify({"error": "User not found", "success": False}), 404

@app.route("/get_courses", methods=["GET"])
def get_courses():
    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("SELECT * FROM courses")
    courses = c.fetchall()
    conn.close()

    data = {
        "courses": [{"code": course[0], "name": course[1]} for course in courses]
    }

    return jsonify({"data": data, "success": True}), 200

@app.route("/create_session", methods=["POST"])
def create_session():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()

    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("INSERT INTO sessions (course_id, user_id, paper_id) VALUES (?, ?, ?)", 
              (data["course_id"], data["user_id"], data["paper_id"]))
    conn.commit()
    conn.close()
    session_id = c.lastrowid
    data = {
        "session_id": session_id,
        "course_id": data["course_id"],
        "user_id": data["user_id"],
        "paper_id": data["paper_id"],
        "active": 1,
        "hint_count": 0,
        "score": 0,
        "date_created": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "date_finished": None
    }

    return jsonify({"message": "Session created successfully", "data": data, "success": True}), 201

@app.route("/get_session", methods=["GET"])
def get_session():
    session_id = int(request.args.get("session_id"))
    
    print("Received session ID:", session_id, type(session_id))
    if not session_id:
        return jsonify({"error": "Session ID is required"}), 400

    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    try:
        c.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
        session = c.fetchone()
        if not session:
            conn.close()
            return jsonify({"error": "Session not found", "success": False}), 404
        c.execute("SELECT * FROM session_answers WHERE session_id = ?", (session_id,))
        answers = c.fetchall()
        questions = []
        for answer in answers:
            print("Fetching question for answer:", answer)
            print("Query: SELECT * FROM questions WHERE question_text =", (answer[2],))
            c.execute("SELECT * FROM questions WHERE question_text = ?", (answer[2],))
            question = c.fetchone()
            print("Question:", question)
            questions.append({
                "question_text": question[1] if question else None,
                "correct_answer": question[2] if question else None,
                "response": answer[3]
            })
    except sqlite3.Error as e:
        conn.close()
        return jsonify({"error": str(e), "success": False}), 500
    conn.close()


    data = {
        "session": {
            "id": session[0],
            "course_id": session[1],
            "user_id": session[2],
            "paper_id": session[3],
            "active": session[4],
            "hint_count": session[5],
            "score": session[6],
            "date_created": session[7],
            "date_finished": session[8] if session[8] else None
        },
        "questions": questions
    }

    if session:
        return jsonify({"data": data, "success": True}), 200
    else:
        return jsonify({"error": "Session not found", "success": False}), 404

@app.route("/upload_paper", methods=["POST"])
def upload_paper():
    if "paper" not in request.files:
        return jsonify({"error": "No paper file provided", "success": False}), 400

    if "course_id" not in request.form:
        return jsonify({"error": "Course ID is required", "success": False}), 400

    paper = request.files["paper"]
    if paper.filename == "":
        return jsonify({"error": "Empty filename", "success": False}), 400

    filename = secure_filename(paper.filename)
    file_path = os.path.join(PAPERS_FOLDER, filename)
    paper.save(file_path)

    #TODO: Add AI processing to extract questions and answers from the paper

    # Save paper metadata to database
    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("INSERT INTO papers (year, course_id) VALUES (?, ?)", (2023, request.form["course_id"]))
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Paper uploaded successfully", "success": True}), 201

@app.route("/create_course", methods=["POST"])
def create_course():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON", "success": False}), 400

    data = request.get_json()

    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("INSERT INTO courses (name, code) VALUES (?, ?)", (data["name"], data["code"]))
    
    conn.commit()
    conn.close()

    return jsonify({"message": "Course created successfully", "data": data, "success": True}), 201

@app.route("/get_user_sessions", methods=["GET"])
def get_user_sessions():
    userid = request.args.get("userid")
    if not userid:
        return jsonify({"error": "User ID is required"}), 400

    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("SELECT user_id FROM users WHERE user_id = ?", (userid,))
    user = c.fetchone()

    if not user:
        return jsonify({"error": "User not found", "success": False}), 404

    user_id = user[0]
    c.execute("SELECT * FROM sessions WHERE user_id = ?", (user_id,))
    sessions = c.fetchall()
    conn.close()
    
    data = {"sessions": [{
        "id": session[0], 
        "name": session[1],
        "id": session[0],
        "course_id": session[1],
        "user_id": session[2],
        "paper_id": session[3],
        "active": session[4],
        "hint_count": session[5],
        "score": session[6],
        "date_created": session[7]
        } for session in sessions]
    }

    return jsonify({"data": data, "success": True}), 200

@app.route("/process_paper", methods=["POST"])
def process_paper_endpoint():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files["file"]
    
    print("Received file:", file.filename)
    
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    # Read the file into memory
    file_bytes = file.read()
    file_obj = BytesIO(file_bytes)

    # Process the paper using your model function
    # Make sure your process_paper function accepts a file-like object
    result = process_paper(file_obj)  
    
    if not result:
        return jsonify({"error": "Failed to process paper"}), 500
    
    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    # check if the paper already exists
    c.execute("SELECT id FROM papers WHERE year = ? AND course_id = ? AND type = ?", 
              (result["year"], result["course_code"], result.get("type", "final")))
    papers = c.fetchall()
    if papers:
        return jsonify({"error": "Paper already exists", "success": False}), 400
    
    existing_paper = c.fetchone()
    if existing_paper:
        return jsonify({"error": "Paper already exists", "success": False}), 400

    c.execute("SELECT code FROM courses WHERE code = ?", (result["course_code"],))
    course = c.fetchone()
    if not course:
        c.execute("INSERT INTO courses (code, name) VALUES (?, ?)", (result["course_code"], "Course Name Placeholder"))
        conn.commit()
    c.execute("INSERT INTO papers (year, course_id) VALUES (?, ?)", (result["year"], result["course_code"]))
    paper_id = c.lastrowid
    for question in result["questions"]:
        c.execute("INSERT INTO questions (question_text, correct_answer, paper_id) VALUES (?, ?, ?)", 
                  (question["question"], question["response"], paper_id))
    conn.commit()
    conn.close()
    

    return jsonify({"message": "Paper processed successfully", "data": result, "success": True}), 200

@app.route("/get_session_answers", methods=["GET"])
def get_session_answers():
    session_id = request.args.get("session_id")
    if not session_id:
        return jsonify({"error": "Session ID is required"}), 400

    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("SELECT * FROM session_answers WHERE session_id = ?", (session_id,))
    answers = c.fetchall()
    for answer in answers:
        c.execute("SELECT question_text FROM questions WHERE id = ?", (answer[2],))
        question = c.fetchone()
        if question:
            answer += (question[0],)
    conn.close()

    if answers:
        return jsonify({"answers": answers, "success": True}), 200
    else:
        return jsonify({"error": "No answers found for this session", "success": False}), 404

@app.route("/get_course_papers", methods=["GET"])
def get_course_papers():
    course_id = request.args.get("course_id")
    if not course_id:
        return jsonify({"error": "Course ID is required", "success": False}), 400

    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("SELECT * FROM papers WHERE course_id = ?", (course_id,))
    papers = c.fetchall()
    conn.close()

    data = {
        "papers": [{"id": paper[0], "year": paper[1], "course_id": paper[2]} for paper in papers]
    }

    if papers:
        return jsonify({"data": data, "success": True}), 200
    else:
        return jsonify({"error": "No papers found for this course", "success": False}), 404

@app.route("/get_paper_questions", methods=["GET"])
def get_paper_questions():
    paper_id = request.args.get("paper_id")
    if not paper_id:
        return jsonify({"error": "Paper ID is required"}), 400

    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("SELECT * FROM questions WHERE paper_id = ?", (paper_id,))
    questions = c.fetchall()
    conn.close()

    data = {
        "questions": [{"id": question[0], "question_text": question[1], "correct_answer": question[2]} for question in questions]
    }

    if questions:
        return jsonify({"data": data, "success": True}), 200
    else:
        return jsonify({"error": "No questions found for this paper", "success": False}), 404
    
@app.route("/end_session", methods=["POST"])
def end_session():
    if not request.is_json:
        return jsonify({"error": "Request must be JSON", "success": False}), 400

    data = request.get_json()
    session_id = data.get("session_id")
    
    if not session_id:
        return jsonify({"error": "Session ID is required"}), 400

    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("UPDATE sessions SET active = 0 WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()

    data = {
        "session_id": session_id,
    }

    return jsonify({"message": "Session ended successfully", "data": data, "success": True}), 200

@app.route("/ping", methods=["GET"])
def ping():
    return jsonify({"message": "Server is running", "success": True}), 200

@app.route("/get_hint", methods=["GET"])
def get_hint_endpoint():
    question_id = request.args.get("question_id")
    if not question_id:
        return jsonify({"error": "Question ID is required"}), 400
 

    
    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("SELECT session_id FROM sessions WHERE active = 1")
    session = c.fetchone()
    if not session:
        return jsonify({"error": "No active session found"}), 400
    session_id = session[0]
    c.execute("SELECT correct_answer FROM questions WHERE id = ?", (question_id,))
    c.execute("SELECT response FROM session_answers WHERE session_id = ? AND question_id = ?", (session_id, question_id))
    
    correct_answer = c.fetchone()
    response = c.fetchone()
    

    if correct_answer == response:
        data = {
            "question_id": question_id,
            "session_id": session_id,
            "hint": "You have already answered this question correctly."
        }
        c.execute("UPDATE sessions SET score = score + 1 WHERE id = ?", (session_id,))
        
        conn.commit()

        return jsonify({"data": data, "success": True}), 200
    elif correct_answer:
        
        hint = get_hint(question_id, response[0], correct_answer[0])
        data = {
            "question_id": question_id,
            "session_id": session_id,
            "hint": hint
        }

        c.execute("UPDATE sessions SET hint_count = hint_count + 1 WHERE id = ?", (session_id,))
        c.execute("UPDATE session_answers SET hint_used = 1 WHERE session_id = ? AND question_id = ?", (session_id, question_id))
        conn.commit()
    
        return jsonify({"data": data, "success": True}), 200

    return jsonify({"error": "No correct answer found for this question", "success": False}), 404


@app.route("/get_user_stats", methods=["GET"])
def get_user_stats():
    # count how many sessions users have completed
    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("SELECT users.user_id, COUNT(*), users.username FROM sessions JOIN users ON sessions.user_id = users.user_id WHERE sessions.active = 0 GROUP BY users.user_id")
    user_stats = c.fetchall()
    conn.close()
    data = {
        "user_stats": [{"user_id": stat[0], "completed_sessions": stat[1], "username": stat[2]} for stat in user_stats]
    }

    return jsonify({"data": data, "success": True}), 200

@app.route("/get_question_frequencies", methods=["GET"])
def get_question_frequencies():
    course_code = request.args.get("course_id")
    if not course_code:
        return jsonify({"error": "Course code is required"}), 400
    
    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("""
        SELECT q.question_text, COUNT(*) AS frequency
        FROM questions q
        JOIN papers p ON q.paper_id = p.id
        WHERE p.course_id = ?
        GROUP BY q.question_text
        ORDER BY frequency DESC
        LIMIT 10
        """, (course_code,))
    question_frequencies = c.fetchall()
    conn.close()
    
    data = {
        "question_frequencies": [{"question_text": freq[0], "count": freq[1]} for freq in question_frequencies]
    }
    
    return jsonify({"data": data, "success": True}), 200



@app.route("/get_paper_by_id", methods=["GET"])
def get_paper_by_id():
    paper_id = request.args.get("paper_id")
    if not paper_id:
        return jsonify({"error": "Paper ID is required"}), 400

    conn = sqlite3.connect("data.db")
    c = conn.cursor()
    c.execute("SELECT * FROM papers WHERE id = ?", (paper_id,))
    paper = c.fetchone()
    c.execute("SELECT * FROM questions WHERE paper_id = ?", (paper_id,))
    questions = c.fetchall()
    conn.close()
    if not paper:
        return jsonify({"error": "Paper not found", "success": False}), 404
    data = {
        "paper": {
            "id": paper[0],
            "year": paper[1],
            "course_id": paper[2],
            "type": paper[3]
        },
        "questions": [{"id": question[0], "question_text": question[1], "correct_answer": question[2]} for question in questions]
    }
    return jsonify({"data": data, "success": True}), 200
    
    
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

