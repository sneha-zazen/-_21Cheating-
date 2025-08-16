import React from 'react';
import { themeColor, gradientBg, cardStyle } from '../styles';

export default function ReportPage({ score, reportData, onGoBack }) {
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