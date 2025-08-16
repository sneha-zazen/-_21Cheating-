import React, { useState, useRef } from 'react';
import { themeColor, gradientBg, cardStyle, buttonStyle, disabledButtonStyle } from '../styles';


export default function HomePage({ onStop, onStart, timer, running, files, addFile, removeFile, selectedCourse, setSelectedCourse, subjects, setSubjects }) {
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