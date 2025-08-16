import React, { useState } from 'react';
import { themeColor, gradientBg, cardStyle } from '../styles';


export default 
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