export const themeColor = '#51257A';

export const gradientBg = {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${themeColor} 0%, #a8edea 100%)`,
    fontFamily: 'Inter, Arial, sans-serif',
    paddingTop: 48
};

export const cardStyle = {
    background: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    boxShadow: `0 4px 24px ${themeColor}22`,
    padding: 64,
    maxWidth: 480,
    margin: '0px auto'
};

export const buttonStyle = {
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

export const disabledButtonStyle = {
    ...buttonStyle,
    background: '#eee',
    color: '#aaa',
    cursor: 'not-allowed',
    boxShadow: 'none'
};
