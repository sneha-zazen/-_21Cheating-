import React, { useState, useRef } from 'react';

const themeColor = '#51257A';

const gradientBg = {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${themeColor} 0%, #a8edea 100%)`,
    fontFamily: 'Inter, Arial, sans-serif',
    paddingTop: 48
};

const cardStyle = {
    background: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    boxShadow: `0 4px 24px ${themeColor}22`,
    padding: 64,
    maxWidth: 480,
    margin: '0px auto'
};

const buttonStyle = {
    padding: '10px 24px',
    borderRadius: 8,
    border: 'none',
    background: `linear-gradient(90deg, ${themeColor} 0%, #a8edea 100%)`,
    color: '#fff',
    fontWeight: 600,
    fontSize: 16,
    cursor: 'pointer',
    marginRight: 12,
    boxShadow: `0 2px 8px ${themeColor}22`
};

const disabledButtonStyle = {
    ...buttonStyle,
    background: '#eee',
    color: '#aaa',
    cursor: 'not-allowed',
    boxShadow: 'none'
};

function Header({ page, setPage }) {
    return (
        <header style={{
            width: '100%',
            padding: '24px 0',
            background: themeColor,
            color: '#fff',
            textAlign: 'center',
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: 2,
            boxShadow: `0 2px 8px ${themeColor}22`,
            position: 'relative'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ flex: 1 }}>MCQ Study Assistant</span>
                <nav style={{ position: 'absolute', right: 32, top: 24, display: 'flex', gap: 12 }}>
                    <button
                        onClick={() => setPage('home')}
                        style={{
                            background: page === 'home' ? '#fff' : 'transparent',
                            color: page === 'home' ? themeColor : '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 18px',
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: 'pointer',
                            boxShadow: page === 'home' ? `0 2px 8px ${themeColor}22` : 'none',
                            transition: 'background 0.2s'
                        }}
                    >
                        Home
                    </button>
                    <button
                        onClick={() => setPage('report')}
                        style={{
                            background: page === 'report' ? '#fff' : 'transparent',
                            color: page === 'report' ? themeColor : '#fff',
                            border: 'none',
                            borderRadius: 6,
                            padding: '8px 18px',
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: 'pointer',
                            boxShadow: page === 'report' ? `0 2px 8px ${themeColor}22` : 'none',
                            transition: 'background 0.2s'
                        }}
                    >
                        Report
                    </button>
                    <button
                        onClick={() => setPage('user')}
                        style={{
                            background: page === 'user' ? '#fff' : 'transparent',
                            color: page === 'user' ? themeColor : '#fff',
                            border: 'none',
                            borderRadius: 1,
                            padding: '8px 18px',
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: 'pointer',
                            boxShadow: page === 'user' ? `0 2px 8px ${themeColor}22` : 'none',
                            transition: 'background 0.2s'
                        }}
                    >
                        User
                    </button>
                </nav>
            </div>
        </header>
    );
}

function HomePage({ onStop, onStart, timer, running, files, addFile, removeFile, selectedCourse, setSelectedCourse, subjects, setSubjects }) {
    const [inputValue, setInputValue] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const inputRef = useRef(null); // Add this line

    // Filter subjects based on input
    const filteredSubjects = subjects.filter(sub =>
        sub.toLowerCase().includes(inputValue.toLowerCase())
    );

    // Timer formatting
    const seconds = Math.floor(timer / 1000);
    const milliseconds = Math.floor((timer % 1000) / 10);

    const handleInputChange = e => {
        setInputValue(e.target.value);
        setShowDropdown(true);
    };

    const handleSelectSubject = subject => {
        setSelectedCourse(subject);
        setInputValue(subject);
        setShowDropdown(false);
        if (inputRef.current) inputRef.current.blur(); // Blur input to hide dropdown
    };

    const handleAddSubject = () => {
        if (inputValue && !subjects.includes(inputValue)) {
            setSubjects([...subjects, inputValue]);
            setSelectedCourse(inputValue);
            setShowDropdown(false);
        }
    };

    return (
        <div style={gradientBg}>
            <div style={cardStyle}>
                <label style={{ display: 'block', marginBottom: 20, fontWeight: 500, color: themeColor }}>
                    <span style={{ marginRight: 12 }}>Course Type:</span>
                    <div style={{ position: 'relative', display: 'inline-block', width: '70%' }}>
                        <input
                            ref={inputRef} // Add this prop
                            type="text"
                            value={inputValue}
                            onChange={handleInputChange}
                            // onFocus={() => setShowDropdown(true)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 6,
                                border: `1px solid ${themeColor}`,
                                fontSize: 16,
                                background: '#f7f7f7',
                                color: themeColor,
                                width: '100%'
                            }}
                            placeholder="Type or select a subject..."
                        />
                        {showDropdown && (
                            <div style={{
                                position: 'absolute',
                                top: '110%',
                                left: 0,
                                right: 0,
                                background: '#fff',
                                border: `1px solid ${themeColor}33`,
                                borderRadius: 6,
                                boxShadow: '0 2px 8px rgba(81,37,122,0.08)',
                                zIndex: 10,
                                maxHeight: 150,
                                overflowY: 'auto'
                            }}>
                                {filteredSubjects.length > 0 ? (
                                    filteredSubjects.map(sub => (
                                        <div
                                            key={sub}
                                            onClick={() => handleSelectSubject(sub)}
                                            style={{
                                                padding: '10px 16px',
                                                cursor: 'pointer',
                                                color: themeColor,
                                                background: sub === selectedCourse ? '#f3eaff' : '#fff'
                                            }}
                                        >
                                            {sub}
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ padding: '10px 16px', color: '#aaa' }}>
                                        No subjects found.
                                    </div>
                                )}
                                {inputValue && !subjects.includes(inputValue) && (
                                    <div
                                        onClick={handleAddSubject}
                                        style={{
                                            padding: '10px 16px',
                                            cursor: 'pointer',
                                            color: themeColor,
                                            background: '#e6e6fa',
                                            fontWeight: 600
                                        }}
                                    >
                                        + Add "{inputValue}"
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </label>
                <h1 style={{
                    width: '100%',
                    padding: '16px 0',
                    color: themeColor,
                    textAlign: 'center',
                    fontSize: 24,
                    fontWeight: 700,
                    letterSpacing: 1,
                    marginBottom: 24
                }}>
                    Study Session
                </h1>
            
                <div style={{ margin: '24px 0', textAlign: 'center' }}>
                    <button
                        onClick={onStart}
                        disabled={running || !selectedCourse}
                        style={running || !selectedCourse ? disabledButtonStyle : buttonStyle}
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
                <div style={{
                    marginBottom: 24,
                    textAlign: 'center',
                    fontSize: 20,
                    fontWeight: 600,
                    color: themeColor
                }}>
                    <span role="img" aria-label="timer" style={{ marginRight: 8 }}>⏱️</span>
                    Timer: {seconds}.{milliseconds.toString().padStart(2, '0')}s
                </div>
                <div style={{ marginBottom: 8, fontWeight: 500, color: themeColor }}>
                    Upload Files:
                </div>
                <input
                    type="file"
                    multiple
                    onChange={e => addFile(Array.from(e.target.files))}
                    style={{
                        display: 'block',
                        margin: '8px 0 16px 0',
                        padding: '8px',
                        borderRadius: 6,
                        border: `1px solid ${themeColor}`,
                        background: '#f7f7f7',
                        color: themeColor
                    }}
                />
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {files.map((file, idx) => (
                        <li key={file.name + idx} style={{
                            background: '#f7f7f7',
                            borderRadius: 6,
                            marginBottom: 8,
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            border: `1px solid ${themeColor}33`
                        }}>
                            <span style={{ fontWeight: 500, color: themeColor }}>{file.name}</span>
                            <button
                                onClick={() => removeFile(idx)}
                                style={{
                                    ...buttonStyle,
                                    background: `linear-gradient(90deg, #ffecd2 0%, ${themeColor} 100%)`,
                                    color: '#fff',
                                    fontSize: 14,
                                    padding: '6px 14px',
                                    marginRight: 0
                                }}
                            >
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

function ReportPage({ score, reportData, onGoBack }) {
    return (
       <div style={gradientBg}>
            <div style={cardStyle}>
                <h1 style={{ textAlign: 'center', marginBottom: 24, fontWeight: 700, letterSpacing: 1, color: themeColor }}>Report</h1>
                <div style={{
                    marginBottom: 24,
                    textAlign: 'center',
                    fontSize: 22,
                    fontWeight: 600,
                    color: themeColor
                }}>
                    <span role="img" aria-label="score" style={{ marginRight: 8 }}>🏆</span>
                    Score: {score}
                </div>
                <div
                    style={{
                        display: 'flex',
                        border: `1px solid ${themeColor}22`,
                        borderRadius: 12,
                        overflow: 'hidden',
                        background: 'rgba(250,250,250,0.95)',
                        boxShadow: `0 2px 8px ${themeColor}11`
                    }}
                >
                    <div style={{ flex: 1, overflowY: 'auto', borderRight: `1px solid ${themeColor}22`, padding: 16 }}>
                        <strong style={{ color: themeColor, fontSize: 16 }}>Column 1</strong>
                        <ul style={{ marginTop: 12 }}>
                            {reportData.left.map((item, idx) => <li key={idx} style={{ marginBottom: 8 }}>{item}</li>)}
                        </ul>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
                        <strong style={{ color: themeColor, fontSize: 16 }}>Column 2</strong>
                        <ul style={{ marginTop: 12 }}>
                            {reportData.right.map((item, idx) => <li key={idx} style={{ marginBottom: 8 }}>{item}</li>)}
                        </ul>
                    </div>
                </div>
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <button
                        onClick={onGoBack}
                        style={{
                            padding: '10px 24px',
                            borderRadius: 8,
                            border: 'none',
                            background: `linear-gradient(90deg, #a8edea 0%, ${themeColor} 100%)`,
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: 16,
                            cursor: 'pointer',
                            boxShadow: `0 2px 8px ${themeColor}22`
                        }}
                    >
                        Go Back to Home Page
                    </button>
                </div>
            </div>
        </div>
    );
}

function UserInfoPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    return (
        <div style={gradientBg}>
            <div style={cardStyle}>
                <h1 style={{
                    textAlign: 'center',
                    marginBottom: 24,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: themeColor
                }}>User</h1>
                <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <label style={{ color: themeColor, fontWeight: 500 }}>
                        Name:
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            style={{
                                marginLeft: 12,
                                padding: '8px 16px',
                                borderRadius: 6,
                                border: `1px solid ${themeColor}`,
                                fontSize: 16,
                                background: '#f7f7f7',
                                color: themeColor,
                                width: '70%'
                            }}
                            placeholder="Enter your name"
                        />
                    </label>
                    <label style={{ color: themeColor, fontWeight: 500 }}>
                        Email:
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            style={{
                                marginLeft: 12,
                                padding: '8px 16px',
                                borderRadius: 6,
                                border: `1px solid ${themeColor}`,
                                fontSize: 16,
                                background: '#f7f7f7',
                                color: themeColor,
                                width: '70%'
                            }}
                            placeholder="Enter your email"
                        />
                    </label>
                   
                </form>
            </div>
        </div>
    );
}

export default function App() {
    const [page, setPage] = useState('home');
    const [subjects, setSubjects] = useState(['ENGG4901', 'CSSE1001', 'PYSCH', 'Programming']);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [timer, setTimer] = useState(0); // timer in ms
    const [running, setRunning] = useState(false);
    const [files, setFiles] = useState([]);
    const intervalRef = useRef(null);

    // Dummy report data
    const [score, setScore] = useState(0);
    const reportData = {
        left: ['Result A', 'Result B', 'Result C'],
        right: ['Detail 1', 'Detail 2', 'Detail 3']
    };

    const addFile = newFiles => {
        setFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = idx => {
        setFiles(prev => prev.filter((_, i) => i !== idx));
    };

    const handleStart = () => {
        setRunning(true);
        intervalRef.current = setInterval(() => {
            setTimer(t => t + 10); // update every 10ms
        }, 10);
    };

    const handleStop = () => {
        setRunning(false);
        clearInterval(intervalRef.current);
        setScore(Math.floor(Math.random() * 100)); // Dummy score
        setPage('report');
    };

    const handleGoBack = () => {
        setPage('home');
        setTimer(0);
        setRunning(false);
        setFiles([]);
        setSelectedCourse('');
    };

    // Pass setPage to Header and all pages
    return (
        <>
            <Header page={page} setPage={setPage} />
            {page === 'home' && (
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
            {page === 'report' && (
                <ReportPage score={score} reportData={reportData} onGoBack={handleGoBack} />
            )}
            {page === 'user' && (
                <UserInfoPage />
            )}
        </>
    );
}