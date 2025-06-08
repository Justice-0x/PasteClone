import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  // styles.css
  ':root': {
    // Default Dark Theme Variables (current Yankee theme)
    ThemeBg: '#0C2340',
    // yankee-navy
    ThemeText: '#FFFFFF',
    // yankee-white
    ThemeContainerBg: '#1E2D3B',
    ThemeBorder: '#C4CED3',
    // yankee-gray
    ThemeButtonBg: '#C4CED3',
    ThemeButtonText: '#0C2340',
    ThemeInputBg: '#F0F0F0',
    // yankee-light-gray
    ThemeInputText: '#0C2340',
    ThemeLink: '#6CB6FF',
    ThemeSidebarText: '#C4CED3',
    // For .sidebar p and .ai-news-item p
    // Matrix Theme Colors
    MatrixGreen: '#00ff41',
    MatrixGreenDark: '#00cc33',
    MatrixGreenGlow: 'rgba(0, 255, 65, 0.1)',
    MatrixGreenBorder: 'rgba(0, 255, 65, 0.3)'
  },
  'bodytheme-dark': {
    ThemeBg: '#0C2340',
    ThemeText: '#FFFFFF',
    ThemeContainerBg: '#1E2D3B',
    ThemeBorder: '#C4CED3',
    ThemeButtonBg: '#C4CED3',
    ThemeButtonText: '#0C2340',
    ThemeInputBg: '#F0F0F0',
    ThemeInputText: '#0C2340',
    ThemeLink: '#6CB6FF',
    ThemeSidebarText: '#C4CED3'
  },
  'bodytheme-spooky': {
    ThemeBg: '#1A1A1A',
    // Very dark gray/black
    ThemeText: '#E0E0E0',
    // Light gray
    ThemeContainerBg: '#2C2C2C',
    // Darker container
    ThemeBorder: '#5D3FD3',
    // Purple for borders
    ThemeButtonBg: '#FF6600',
    // Orange for buttons
    ThemeButtonText: '#1A1A1A',
    // Black text on orange buttons
    ThemeInputBg: '#333333',
    // Dark input bg
    ThemeInputText: '#E0E0E0',
    // Light gray input text
    ThemeLink: '#FF8C00',
    // Dark Orange for links
    ThemeSidebarText: '#AAAAAA',
    // Medium gray for sidebar text
  },
  'bodytheme-win95': {
    // Windows 95 Theme Variables
    ThemeBg: '#C0C0C0',
    // Classic W95 Gray
    ThemeText: '#000000',
    // Black
    ThemeContainerBg: '#C0C0C0',
    // Same gray for containers initially
    ThemeBorder: '#808080',
    // Darker Gray for borders
    ThemeButtonBg: '#C0C0C0',
    // Button face gray
    ThemeButtonText: '#000000',
    // Black button text
    ThemeInputBg: '#FFFFFF',
    // White input background
    ThemeInputText: '#000000',
    // Black input text
    ThemeLink: '#0000FF',
    // Standard Blue link
    ThemeSidebarText: '#000000',
    ThemeHeaderBg: '#000080',
    // Navy Blue for "title bars"
    ThemeHeaderText: '#FFFFFF',
    // White text on title bars
    // Specific W95 font - system-ui is a good modern fallback, then Arial
    fontFamily: ''MS Sans Serif', 'Tahoma', 'Geneva', 'system-ui', 'Arial', sans-serif'
  },
  body: {
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Ubuntu, "Helvetica Neue", sans-serif',
    margin: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }],
    padding: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }],
    backgroundColor: 'var(--theme-bg)',
    color: 'var(--theme-text)',
    lineHeight: [{ unit: 'px', value: 1.6 }],
    transition: 'background-color 0.3s, color 0.3s'
  },
  // Apply a different background in viewing mode
  'bodyview-mode': {
    backgroundColor: '#f0f2f5'
  },
  container: {
    maxWidth: [{ unit: 'px', value: 800 }],
    margin: [{ unit: 'px', value: 0 }, { unit: 'string', value: 'auto' }, { unit: 'px', value: 0 }, { unit: 'string', value: 'auto' }],
    padding: [{ unit: 'px', value: 20 }, { unit: 'px', value: 20 }, { unit: 'px', value: 20 }, { unit: 'px', value: 20 }]
  },
  h1: {
    marginBottom: [{ unit: 'px', value: 20 }],
    color: '#333',
    textAlign: 'center',
    fontSize: [{ unit: 'rem', value: 2.5 }]
  },
  textarea: {
    width: [{ unit: '%H', value: 1 }],
    height: [{ unit: 'px', value: 200 }],
    padding: [{ unit: 'px', value: 12 }, { unit: 'px', value: 12 }, { unit: 'px', value: 12 }, { unit: 'px', value: 12 }],
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#ddd' }],
    borderRadius: '8px',
    fontFamily: 'Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace',
    fontSize: [{ unit: 'px', value: 14 }],
    resize: 'vertical',
    marginBottom: [{ unit: 'px', value: 15 }],
    boxShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 2 }, { unit: 'px', value: 8 }, { unit: 'string', value: 'rgba(0, 0, 0, 0.05)' }],
    transition: 'border-color 0.3s, box-shadow 0.3s'
  },
  'textarea:focus': {
    outline: 'none',
    borderColor: '#4b3edf',
    boxShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 2 }, { unit: 'px', value: 12 }, { unit: 'string', value: 'rgba(75, 62, 223, 0.15)' }]
  },
  button: {
    backgroundColor: '#4b3edf',
    color: 'white',
    border: [{ unit: 'string', value: 'none' }],
    padding: [{ unit: 'px', value: 10 }, { unit: 'px', value: 20 }, { unit: 'px', value: 10 }, { unit: 'px', value: 20 }],
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: [{ unit: 'px', value: 16 }],
    fontWeight: 'bold',
    transition: 'transform 0.2s, background-color 0.3s',
    display: 'block',
    margin: [{ unit: 'px', value: 0 }, { unit: 'string', value: 'auto' }, { unit: 'px', value: 0 }, { unit: 'string', value: 'auto' }]
  },
  'button:hover': {
    backgroundColor: '#3730a3',
    transform: 'translateY(-2px)'
  },
  'button:active': {
    transform: 'translateY(0)'
  },
  hidden: {
    display: 'none'
  },
  '#result': {
    marginTop: [{ unit: 'px', value: 30 }],
    padding: [{ unit: 'px', value: 25 }, { unit: 'px', value: 25 }, { unit: 'px', value: 25 }, { unit: 'px', value: 25 }],
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 10 }, { unit: 'px', value: 30 }, { unit: 'string', value: 'rgba(0, 0, 0, 0.1)' }],
    textAlign: 'center',
    animation: 'popIn 0.5s ease-out forwards'
  },
  'success-icon': {
    fontSize: [{ unit: 'px', value: 50 }],
    marginBottom: [{ unit: 'px', value: 15 }],
    animation: 'bounce 1s ease infinite'
  },
  '#result h2': {
    color: '#4b3edf',
    margin: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 15 }, { unit: 'px', value: 0 }],
    fontSize: [{ unit: 'px', value: 28 }]
  },
  'link-container': {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    padding: [{ unit: 'px', value: 12 }, { unit: 'px', value: 12 }, { unit: 'px', value: 12 }, { unit: 'px', value: 12 }],
    marginTop: [{ unit: 'px', value: 15 }],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: [{ unit: 'string', value: 'inset' }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 5 }, { unit: 'string', value: 'rgba(0, 0, 0, 0.05)' }]
  },
  '#pasteLink': {
    color: '#1890ff',
    wordBreak: 'break-all',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: [{ unit: 'px', value: 16 }],
    flex: '1',
    textAlign: 'left',
    paddingRight: [{ unit: 'px', value: 10 }]
  },
  '#pasteLink:hover': {
    textDecoration: 'underline'
  },
  'copy-btn': {
    backgroundColor: '#28a745',
    padding: [{ unit: 'px', value: 8 }, { unit: 'px', value: 12 }, { unit: 'px', value: 8 }, { unit: 'px', value: 12 }],
    margin: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }],
    fontSize: [{ unit: 'px', value: 14 }],
    whiteSpace: 'nowrap'
  },
  'copy-btn:hover': {
    backgroundColor: '#218838'
  },
  // Styling for the view result message
  'view-result': {
    marginTop: [{ unit: 'px', value: 20 }],
    padding: [{ unit: 'px', value: 20 }, { unit: 'px', value: 20 }, { unit: 'px', value: 20 }, { unit: 'px', value: 20 }],
    backgroundColor: '#e8f4fd',
    borderRadius: '12px',
    boxShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 5 }, { unit: 'px', value: 15 }, { unit: 'string', value: 'rgba(0, 0, 0, 0.1)' }],
    textAlign: 'center',
    animation: 'fadeIn 0.5s ease-out forwards'
  },
  'view-icon': {
    fontSize: [{ unit: 'px', value: 40 }],
    marginBottom: [{ unit: 'px', value: 10 }]
  },
  'view-result h2': {
    color: '#2c5282',
    margin: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 15 }, { unit: 'px', value: 0 }],
    fontSize: [{ unit: 'px', value: 24 }]
  },
  'action-buttons': {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: [{ unit: 'px', value: 15 }]
  },
  'copy-content-btn': {
    backgroundColor: '#3182ce',
    padding: [{ unit: 'px', value: 8 }, { unit: 'px', value: 15 }, { unit: 'px', value: 8 }, { unit: 'px', value: 15 }]
  },
  'copy-content-btn:hover': {
    backgroundColor: '#2b6cb0'
  },
  // Create New Paste button styling
  '#createNewContainer': {
    margin: [{ unit: 'px', value: 20 }, { unit: 'px', value: 0 }, { unit: 'px', value: 20 }, { unit: 'px', value: 0 }],
    textAlign: 'center'
  },
  'new-paste-btn': {
    display: 'inline-block',
    backgroundColor: '#4b3edf',
    color: 'white',
    textDecoration: 'none',
    padding: [{ unit: 'px', value: 12 }, { unit: 'px', value: 25 }, { unit: 'px', value: 12 }, { unit: 'px', value: 25 }],
    borderRadius: '8px',
    fontWeight: 'bold',
    transition: 'transform 0.2s, background-color 0.3s, box-shadow 0.3s',
    boxShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 4 }, { unit: 'px', value: 6 }, { unit: 'string', value: 'rgba(75, 62, 223, 0.2)' }]
  },
  'new-paste-btn:hover': {
    backgroundColor: '#3730a3',
    transform: 'translateY(-2px)',
    boxShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 6 }, { unit: 'px', value: 8 }, { unit: 'string', value: 'rgba(75, 62, 223, 0.25)' }]
  },
  'new-paste-btn:active': {
    transform: 'translateY(0)'
  },
  // Matrix Share Navigation and Promo Styling
  'matrix-nav-link': {
    background: 'linear-gradient(90deg, var(--matrix-green), var(--matrix-green-dark))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    fontWeight: 'bold',
    textShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 10 }, { unit: 'string', value: 'var(--matrix-green)' }],
    position: 'relative',
    transition: 'all 0.3s ease'
  },
  'matrix-nav-link:hover': {
    textShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 15 }, { unit: 'string', value: 'var(--matrix-green)' }],
    transform: 'scale(1.05)'
  },
  'matrix-nav-link::before': {
    content: '""',
    position: 'absolute',
    top: [{ unit: 'px', value: 0 }],
    left: [{ unit: 'px', value: 0 }],
    right: [{ unit: 'px', value: 0 }],
    bottom: [{ unit: 'px', value: 0 }],
    background: 'linear-gradient(90deg, var(--matrix-green), var(--matrix-green-dark))',
    opacity: '0',
    transition: 'opacity 0.3s ease',
    zIndex: '-1',
    borderRadius: '4px'
  },
  'matrix-nav-link:hover::before': {
    opacity: '0.1'
  },
  // Matrix Share Promo Section
  'matrix-promo': {
    background: 'var(--matrix-green-glow)',
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: 'var(--matrix-green)' }],
    borderRadius: '8px',
    padding: [{ unit: 'px', value: 15 }, { unit: 'px', value: 15 }, { unit: 'px', value: 15 }, { unit: 'px', value: 15 }],
    marginBottom: [{ unit: 'px', value: 20 }],
    position: 'relative',
    overflow: 'hidden'
  },
  'matrix-promo::before': {
    content: '""',
    position: 'absolute',
    top: [{ unit: '%V', value: -0.5 }],
    left: [{ unit: '%H', value: -0.5 }],
    width: [{ unit: '%H', value: 2 }],
    height: [{ unit: '%V', value: 2 }],
    background: 'linear-gradient(
    45deg,
    transparent,
    var(--matrix-green-border),
    transparent
  )',
    animation: 'matrixScan 3s infinite',
    opacity: '0.3'
  },
  'matrix-promo p': {
    position: 'relative',
    zIndex: '2',
    color: 'var(--theme-text)',
    marginBottom: [{ unit: 'px', value: 10 }]
  },
  'matrix-link': {
    color: 'var(--matrix-green)',
    textDecoration: 'none',
    fontWeight: 'bold',
    display: 'inline-block',
    marginTop: [{ unit: 'px', value: 10 }],
    padding: [{ unit: 'px', value: 8 }, { unit: 'px', value: 15 }, { unit: 'px', value: 8 }, { unit: 'px', value: 15 }],
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: 'var(--matrix-green)' }],
    borderRadius: '4px',
    transition: 'all 0.3s ease',
    position: 'relative',
    zIndex: '2',
    background: 'rgba(0, 0, 0, 0.2)'
  },
  'matrix-link:hover': {
    color: 'var(--theme-bg)',
    backgroundColor: 'var(--matrix-green)',
    textShadow: [{ unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }],
    boxShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 20 }, { unit: 'string', value: 'var(--matrix-green-border)' }],
    transform: 'translateY(-2px)'
  },
  // Theme-specific Matrix adjustments
  'bodytheme-spooky matrix-nav-link': {
    textShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 10 }, { unit: 'string', value: 'var(--matrix-green)' }]
  },
  'bodytheme-spooky matrix-link': {
    textShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 10 }, { unit: 'string', value: 'var(--matrix-green)' }]
  },
  'bodytheme-win95 matrix-nav-link': {
    background: 'var(--matrix-green)',
    WebkitBackgroundClip: 'unset',
    WebkitTextFillColor: 'unset',
    backgroundClip: 'unset',
    color: 'var(--matrix-green)',
    textShadow: [{ unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }]
  },
  'bodytheme-win95 matrix-promo': {
    background: '#E0E0E0',
    border: [{ unit: 'px', value: 2 }, { unit: 'string', value: 'inset' }, { unit: 'string', value: '#C0C0C0' }]
  },
  'bodytheme-win95 matrix-link': {
    border: [{ unit: 'px', value: 2 }, { unit: 'string', value: 'outset' }, { unit: 'string', value: '#C0C0C0' }],
    background: '#C0C0C0',
    color: 'var(--matrix-green)',
    textShadow: [{ unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }]
  },
  'bodytheme-win95 matrix-link:hover': {
    border: [{ unit: 'px', value: 2 }, { unit: 'string', value: 'inset' }, { unit: 'string', value: '#C0C0C0' }],
    background: '#A0A0A0'
  },
  // Auth Forms Styling
  'auth-forms-container': {
    maxWidth: [{ unit: 'px', value: 500 }],
    margin: [{ unit: 'px', value: 20 }, { unit: 'string', value: 'auto' }, { unit: 'px', value: 20 }, { unit: 'string', value: 'auto' }],
    padding: [{ unit: 'px', value: 20 }, { unit: 'px', value: 20 }, { unit: 'px', value: 20 }, { unit: 'px', value: 20 }],
    backgroundColor: 'var(--theme-container-bg, #f9f9f9)',
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    borderRadius: '8px'
  },
  'form-container h2': {
    textAlign: 'center',
    marginBottom: [{ unit: 'px', value: 20 }],
    color: 'var(--theme-text)'
  },
  'form-container div': {
    marginBottom: [{ unit: 'px', value: 15 }]
  },
  'form-container label': {
    display: 'block',
    marginBottom: [{ unit: 'px', value: 5 }],
    fontWeight: 'bold',
    color: 'var(--theme-text)'
  },
  'form-container input[type="text"]': {
    width: [{ unit: '%H', value: 1 }],
    padding: [{ unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }],
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    borderRadius: '4px',
    boxSizing: 'border-box',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-input-text)'
  },
  'form-container input[type="email"]': {
    width: [{ unit: '%H', value: 1 }],
    padding: [{ unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }],
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    borderRadius: '4px',
    boxSizing: 'border-box',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-input-text)'
  },
  'form-container input[type="password"]': {
    width: [{ unit: '%H', value: 1 }],
    padding: [{ unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }],
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    borderRadius: '4px',
    boxSizing: 'border-box',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-input-text)'
  },
  'form-container button[type="submit"]': {
    width: [{ unit: '%H', value: 1 }],
    padding: [{ unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }],
    backgroundColor: 'var(--theme-button-bg, #007bff)',
    color: 'var(--theme-button-text, white)',
    border: [{ unit: 'string', value: 'none' }],
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: [{ unit: 'px', value: 16 }]
  },
  'form-container button[type="submit"]:hover': {
    opacity: '0.9'
  },
  'auth-message': {
    marginTop: [{ unit: 'px', value: 15 }],
    padding: [{ unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }],
    borderRadius: '4px',
    textAlign: 'center'
  },
  'auth-messagesuccess': {
    backgroundColor: '#d4edda',
    color: '#155724',
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#c3e6cb' }]
  },
  'auth-messageerror': {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#f5c6cb' }]
  },
  'auth-switch': {
    marginTop: [{ unit: 'px', value: 15 }],
    textAlign: 'center',
    fontSize: [{ unit: 'em', value: 0.9 }]
  },
  'auth-switch a': {
    color: 'var(--theme-link)',
    textDecoration: 'underline'
  },
  // End Auth Forms Styling
  // Price Ticker Styling
  'price-ticker-container': {
    backgroundColor: 'var(--theme-container-bg, #1f1f1f)',
    color: 'var(--theme-text, #fff)',
    padding: [{ unit: 'px', value: 5 }, { unit: 'px', value: 0 }, { unit: 'px', value: 5 }, { unit: 'px', value: 0 }],
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    // Crucial for ticker effect
    borderBottom: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    whiteSpace: 'nowrap',
    // Prevent items from wrapping
  },
  'ticker-wrap': {
    flexGrow: '1',
    overflow: 'hidden',
    // Hide the overflowing content
  },
  'ticker-move': {
    display: 'inline-block',
    // Allows animation
    paddingLeft: [{ unit: '%H', value: 1 }],
    // Start with items off-screen to the right
    animation: 'ticker-scroll 60s linear infinite',
    // Slowed down from 30s
    // animation-play-state: running; by default
  },
  'ticker-item': {
    display: 'inline-block',
    padding: [{ unit: 'px', value: 0 }, { unit: 'rem', value: 1.5 }, { unit: 'px', value: 0 }, { unit: 'rem', value: 1.5 }],
    // Space between items
    fontSize: [{ unit: 'em', value: 0.85 }]
  },
  'ticker-item coin-symbol': {
    fontWeight: 'bold',
    color: 'var(--theme-link, #6CB6FF)',
    // Use link color for emphasis
  },
  'ticker-item coin-price': {
    marginLeft: [{ unit: 'px', value: 5 }]
  },
  'ticker-item coin-change': {
    marginLeft: [{ unit: 'px', value: 5 }],
    fontSize: [{ unit: 'em', value: 0.9 }]
  },
  'ticker-item positive': {
    color: '#4CAF50',
    // Green for positive change
  },
  'ticker-item negative': {
    color: '#F44336',
    // Red for negative change
  },
  'ticker-controls': {
    padding: [{ unit: 'px', value: 0 }, { unit: 'px', value: 10 }, { unit: 'px', value: 0 }, { unit: 'px', value: 10 }],
    display: 'flex',
    // Align items in controls
    alignItems: 'center'
  },
  'ticker-controls select': {
    backgroundColor: 'var(--theme-input-bg, #333)',
    color: 'var(--theme-input-text, #fff)',
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    borderRadius: '4px',
    padding: [{ unit: 'px', value: 3 }, { unit: 'px', value: 5 }, { unit: 'px', value: 3 }, { unit: 'px', value: 5 }],
    fontSize: [{ unit: 'em', value: 0.8 }],
    marginRight: [{ unit: 'px', value: 10 }],
    // Space between dropdown and button
  },
  'ticker-controls button': {
    background: 'transparent',
    border: [{ unit: 'string', value: 'none' }],
    color: 'var(--theme-text, #fff)',
    cursor: 'pointer',
    padding: [{ unit: 'px', value: 5 }, { unit: 'px', value: 5 }, { unit: 'px', value: 5 }, { unit: 'px', value: 5 }],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  'ticker-controls button svg': {
    width: [{ unit: 'px', value: 16 }],
    height: [{ unit: 'px', value: 16 }]
  },
  // End Price Ticker Styling
  // Not found message styling
  'not-found': {
    margin: [{ unit: 'px', value: 40 }, { unit: 'string', value: 'auto' }, { unit: 'px', value: 40 }, { unit: 'string', value: 'auto' }],
    padding: [{ unit: 'px', value: 25 }, { unit: 'px', value: 25 }, { unit: 'px', value: 25 }, { unit: 'px', value: 25 }],
    backgroundColor: '#fff0f0',
    borderRadius: '12px',
    boxShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 5 }, { unit: 'px', value: 15 }, { unit: 'string', value: 'rgba(0, 0, 0, 0.1)' }],
    textAlign: 'center',
    maxWidth: [{ unit: 'px', value: 500 }]
  },
  'error-icon': {
    fontSize: [{ unit: 'px', value: 40 }],
    marginBottom: [{ unit: 'px', value: 10 }],
    color: '#e53e3e'
  },
  'not-found h2': {
    color: '#e53e3e',
    margin: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 10 }, { unit: 'px', value: 0 }],
    fontSize: [{ unit: 'px', value: 24 }]
  },
  'not-found p': {
    margin: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }],
    color: '#666',
    fontSize: [{ unit: 'px', value: 16 }]
  },
  // Preview styling - enhanced for viewing mode
  'bodyview-mode #preview': {
    marginTop: [{ unit: 'px', value: 20 }],
    boxShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 8 }, { unit: 'px', value: 25 }, { unit: 'string', value: 'rgba(0, 0, 0, 0.15)' }]
  },
  '#preview': {
    marginTop: [{ unit: 'px', value: 30 }],
    padding: [{ unit: 'px', value: 20 }, { unit: 'px', value: 20 }, { unit: 'px', value: 20 }, { unit: 'px', value: 20 }],
    background: '#2d2d2d',
    borderRadius: '12px',
    color: '#fff',
    boxShadow: [{ unit: 'px', value: 0 }, { unit: 'px', value: 5 }, { unit: 'px', value: 15 }, { unit: 'string', value: 'rgba(0, 0, 0, 0.2)' }]
  },
  '#preview h2': {
    marginBottom: [{ unit: 'px', value: 15 }],
    fontSize: [{ unit: 'px', value: 20 }],
    color: '#fff',
    borderBottom: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#444' }],
    paddingBottom: [{ unit: 'px', value: 10 }]
  },
  '#highlightedCode': {
    fontFamily: 'Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace',
    fontSize: [{ unit: 'px', value: 14 }],
    lineHeight: [{ unit: 'px', value: 1.5 }],
    whiteSpace: 'pre-wrap',
    maxHeight: [{ unit: 'px', value: 400 }],
    overflowY: 'auto',
    padding: [{ unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }],
    borderRadius: '8px',
    background: '#222'
  },
  header: {
    backgroundColor: 'var(--theme-container-bg)',
    padding: [{ unit: 'rem', value: 1 }, { unit: 'rem', value: 2 }, { unit: 'rem', value: 1 }, { unit: 'rem', value: 2 }],
    borderBottom: [{ unit: 'px', value: 2 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  'header h1': {
    margin: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }],
    color: 'var(--theme-text)',
    fontSize: [{ unit: 'rem', value: 1.8 }]
  },
  'bodytheme-win95 header h1': {
    color: 'var(--theme-header-text)',
    // White text for W95 header
  },
  'header nav a': {
    color: 'var(--theme-link)',
    textDecoration: 'none',
    marginLeft: [{ unit: 'rem', value: 1 }],
    fontSize: [{ unit: 'rem', value: 1 }]
  },
  'bodytheme-win95 header nav a': {
    color: 'var(--theme-header-text)',
    // White links in W95 header
  },
  'header nav a:hover': {
    textDecoration: 'underline'
  },
  main: {
    display: 'flex',
    padding: [{ unit: 'rem', value: 1 }, { unit: 'rem', value: 1 }, { unit: 'rem', value: 1 }, { unit: 'rem', value: 1 }],
    gap: '1rem',
    // Space between main content and sidebar
    '<w768': {
      flexDirection: 'column'
    }
  },
  'paste-container': {
    flex: '3',
    // Takes up 3/4 of the space
    backgroundColor: 'var(--theme-container-bg)',
    padding: [{ unit: 'rem', value: 1.5 }, { unit: 'rem', value: 1.5 }, { unit: 'rem', value: 1.5 }, { unit: 'rem', value: 1.5 }],
    borderRadius: '8px',
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }]
  },
  'bodytheme-win95 paste-container': {
    border: [{ unit: 'px', value: 2 }, { unit: 'string', value: 'outset' }, { unit: 'string', value: '#FFFFFF' }],
    // Classic 3D border
    boxShadow: [{ unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#000000,' }, { unit: 'string', value: 'inset' }, { unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#808080' }]
  },
  'bodytheme-win95 sidebar': {
    border: [{ unit: 'px', value: 2 }, { unit: 'string', value: 'outset' }, { unit: 'string', value: '#FFFFFF' }],
    // Classic 3D border
    boxShadow: [{ unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#000000,' }, { unit: 'string', value: 'inset' }, { unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#808080' }]
  },
  'paste-input-area h2': {
    marginTop: [{ unit: 'px', value: 0 }],
    color: 'var(--theme-text)',
    borderBottom: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    paddingBottom: [{ unit: 'rem', value: 0.5 }],
    marginBottom: [{ unit: 'rem', value: 1 }]
  },
  'paste-display-area h2': {
    marginTop: [{ unit: 'px', value: 0 }],
    color: 'var(--theme-text)',
    borderBottom: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    paddingBottom: [{ unit: 'rem', value: 0.5 }],
    marginBottom: [{ unit: 'rem', value: 1 }]
  },
  'bodytheme-win95 paste-input-area h2': {
    backgroundColor: 'var(--theme-header-bg)',
    color: 'var(--theme-header-text)',
    padding: [{ unit: 'px', value: 3 }, { unit: 'px', value: 5 }, { unit: 'px', value: 3 }, { unit: 'px', value: 5 }],
    marginTop: [{ unit: 'px', value: 0 }],
    // Reset margin for these title bars
    marginLeft: [{ unit: 'px', value: -2 }],
    // Adjust to align with border
    marginRight: [{ unit: 'px', value: -2 }],
    // Adjust to align with border
    borderBottom: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#000000' }],
    fontSize: [{ unit: 'rem', value: 0.9 }]
  },
  'bodytheme-win95 paste-display-area h2': {
    backgroundColor: 'var(--theme-header-bg)',
    color: 'var(--theme-header-text)',
    padding: [{ unit: 'px', value: 3 }, { unit: 'px', value: 5 }, { unit: 'px', value: 3 }, { unit: 'px', value: 5 }],
    marginTop: [{ unit: 'px', value: 0 }],
    // Reset margin for these title bars
    marginLeft: [{ unit: 'px', value: -2 }],
    // Adjust to align with border
    marginRight: [{ unit: 'px', value: -2 }],
    // Adjust to align with border
    borderBottom: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#000000' }],
    fontSize: [{ unit: 'rem', value: 0.9 }]
  },
  'bodytheme-win95 sidebar h4': {
    backgroundColor: 'var(--theme-header-bg)',
    color: 'var(--theme-header-text)',
    padding: [{ unit: 'px', value: 3 }, { unit: 'px', value: 5 }, { unit: 'px', value: 3 }, { unit: 'px', value: 5 }],
    marginTop: [{ unit: 'px', value: 0 }],
    // Reset margin for these title bars
    marginLeft: [{ unit: 'px', value: -2 }],
    // Adjust to align with border
    marginRight: [{ unit: 'px', value: -2 }],
    // Adjust to align with border
    borderBottom: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#000000' }],
    fontSize: [{ unit: 'rem', value: 0.9 }]
  },
  'textarea#pasteInput': {
    width: [{ unit: '%H', value: 0.98 }],
    // Changed from 100% to account for padding/border better within flex item
    minHeight: [{ unit: 'px', value: 250 }],
    // Ensure a decent minimum height
    padding: [{ unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }, { unit: 'px', value: 10 }],
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-input-text)',
    fontFamily: ''Courier New', Courier, monospace',
    fontSize: [{ unit: 'rem', value: 0.95 }],
    marginBottom: [{ unit: 'rem', value: 1 }],
    boxSizing: 'border-box',
    // Ensure padding and border are included in the element's total width and height
  },
  'bodytheme-win95 textarea#pasteInput': {
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#000000' }],
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    boxShadow: [{ unit: 'string', value: 'inset' }, { unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#808080,' }, { unit: 'string', value: 'inset' }, { unit: 'px', value: -1 }, { unit: 'px', value: -1 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#FFFFFF' }],
    fontFamily: ''MS Sans Serif', 'Tahoma', 'Geneva', 'system-ui', 'Arial', sans-serif'
  },
  'bodytheme-win95 paste-options select': {
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#000000' }],
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    boxShadow: [{ unit: 'string', value: 'inset' }, { unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#808080,' }, { unit: 'string', value: 'inset' }, { unit: 'px', value: -1 }, { unit: 'px', value: -1 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#FFFFFF' }],
    fontFamily: ''MS Sans Serif', 'Tahoma', 'Geneva', 'system-ui', 'Arial', sans-serif'
  },
  'bodytheme-win95 paste-options input[type="text"]': {
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#000000' }],
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    boxShadow: [{ unit: 'string', value: 'inset' }, { unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#808080,' }, { unit: 'string', value: 'inset' }, { unit: 'px', value: -1 }, { unit: 'px', value: -1 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#FFFFFF' }],
    fontFamily: ''MS Sans Serif', 'Tahoma', 'Geneva', 'system-ui', 'Arial', sans-serif'
  },
  'bodytheme-win95 paste-options input[type="password"]': {
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#000000' }],
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    boxShadow: [{ unit: 'string', value: 'inset' }, { unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#808080,' }, { unit: 'string', value: 'inset' }, { unit: 'px', value: -1 }, { unit: 'px', value: -1 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#FFFFFF' }],
    fontFamily: ''MS Sans Serif', 'Tahoma', 'Geneva', 'system-ui', 'Arial', sans-serif'
  },
  'paste-options': {
    backgroundColor: 'var(--theme-bg)',
    // Use main bg for options contrast
    padding: [{ unit: 'rem', value: 1 }, { unit: 'rem', value: 1 }, { unit: 'rem', value: 1 }, { unit: 'rem', value: 1 }],
    borderRadius: '4px',
    marginBottom: [{ unit: 'rem', value: 1 }],
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }]
  },
  'paste-options h3': {
    marginTop: [{ unit: 'px', value: 0 }],
    color: 'var(--theme-text)',
    fontSize: [{ unit: 'rem', value: 1.1 }],
    marginBottom: [{ unit: 'rem', value: 0.8 }]
  },
  'paste-options label': {
    display: 'block',
    marginBottom: [{ unit: 'rem', value: 0.3 }],
    color: 'var(--theme-sidebar-text)',
    // Using sidebar-text as it's generally lighter
    fontSize: [{ unit: 'rem', value: 0.9 }]
  },
  'paste-options select': {
    width: [{ unit: '%H', value: 1 }],
    padding: [{ unit: 'px', value: 8 }, { unit: 'px', value: 8 }, { unit: 'px', value: 8 }, { unit: 'px', value: 8 }],
    marginBottom: [{ unit: 'rem', value: 0.8 }],
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-input-text)',
    boxSizing: 'border-box'
  },
  'paste-options input[type="text"]': {
    width: [{ unit: '%H', value: 1 }],
    padding: [{ unit: 'px', value: 8 }, { unit: 'px', value: 8 }, { unit: 'px', value: 8 }, { unit: 'px', value: 8 }],
    marginBottom: [{ unit: 'rem', value: 0.8 }],
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-input-text)',
    boxSizing: 'border-box'
  },
  'paste-options input[type="password"]': {
    width: [{ unit: '%H', value: 1 }],
    padding: [{ unit: 'px', value: 8 }, { unit: 'px', value: 8 }, { unit: 'px', value: 8 }, { unit: 'px', value: 8 }],
    marginBottom: [{ unit: 'rem', value: 0.8 }],
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    borderRadius: '4px',
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-input-text)',
    boxSizing: 'border-box'
  },
  'paste-options div': {
    marginBottom: [{ unit: 'rem', value: 0.8 }],
    // Add spacing for the checkbox div
  },
  'paste-options inline-label': {
    display: 'inline',
    // Make label sit next to checkbox
    marginLeft: [{ unit: 'rem', value: 0.3 }],
    fontWeight: 'normal',
    // Override general label boldness if any
    color: 'var(--theme-sidebar-text)',
    fontSize: [{ unit: 'rem', value: 0.9 }]
  },
  'expiration-note': {
    fontSize: [{ unit: 'rem', value: 0.85 }],
    color: 'var(--theme-sidebar-text)',
    marginTop: [{ unit: 'rem', value: -0.5 }],
    marginBottom: [{ unit: 'rem', value: 1 }]
  },
  'expiration-info-sidebar': {
    fontSize: [{ unit: 'rem', value: 0.85 }],
    color: 'var(--theme-sidebar-text)',
    marginTop: [{ unit: 'rem', value: -0.5 }],
    marginBottom: [{ unit: 'rem', value: 1 }]
  },
  'button#createPasteBtn': {
    backgroundColor: 'var(--theme-button-bg)',
    color: 'var(--theme-button-text)',
    padding: [{ unit: 'px', value: 10 }, { unit: 'px', value: 15 }, { unit: 'px', value: 10 }, { unit: 'px', value: 15 }],
    border: [{ unit: 'string', value: 'none' }],
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: [{ unit: 'rem', value: 1 }],
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease, color 0.2s ease'
  },
  'button#copyLinkBtn': {
    backgroundColor: 'var(--theme-button-bg)',
    color: 'var(--theme-button-text)',
    padding: [{ unit: 'px', value: 10 }, { unit: 'px', value: 15 }, { unit: 'px', value: 10 }, { unit: 'px', value: 15 }],
    border: [{ unit: 'string', value: 'none' }],
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: [{ unit: 'rem', value: 1 }],
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease, color 0.2s ease'
  },
  'button#createNewPasteLinkBtn': {
    backgroundColor: 'var(--theme-button-bg)',
    color: 'var(--theme-button-text)',
    padding: [{ unit: 'px', value: 10 }, { unit: 'px', value: 15 }, { unit: 'px', value: 10 }, { unit: 'px', value: 15 }],
    border: [{ unit: 'string', value: 'none' }],
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: [{ unit: 'rem', value: 1 }],
    fontWeight: 'bold',
    transition: 'background-color 0.2s ease, color 0.2s ease'
  },
  'bodytheme-win95 button': {
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#000000' }],
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    boxShadow: [{ unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#000000' }],
    backgroundColor: 'var(--theme-button-bg)',
    color: 'var(--theme-button-text)',
    padding: [{ unit: 'px', value: 5 }, { unit: 'px', value: 10 }, { unit: 'px', value: 5 }, { unit: 'px', value: 10 }],
    // W95 buttons are typically smaller
    fontSize: [{ unit: 'rem', value: 0.9 }],
    borderRadius: '0',
    // No rounded corners
    fontFamily: ''MS Sans Serif', 'Tahoma', 'Geneva', 'system-ui', 'Arial', sans-serif'
  },
  'bodytheme-win95 button#createPasteBtn': {
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#000000' }],
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    boxShadow: [{ unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#000000' }],
    backgroundColor: 'var(--theme-button-bg)',
    color: 'var(--theme-button-text)',
    padding: [{ unit: 'px', value: 5 }, { unit: 'px', value: 10 }, { unit: 'px', value: 5 }, { unit: 'px', value: 10 }],
    // W95 buttons are typically smaller
    fontSize: [{ unit: 'rem', value: 0.9 }],
    borderRadius: '0',
    // No rounded corners
    fontFamily: ''MS Sans Serif', 'Tahoma', 'Geneva', 'system-ui', 'Arial', sans-serif'
  },
  'bodytheme-win95 button#copyLinkBtn': {
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#000000' }],
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    boxShadow: [{ unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#000000' }],
    backgroundColor: 'var(--theme-button-bg)',
    color: 'var(--theme-button-text)',
    padding: [{ unit: 'px', value: 5 }, { unit: 'px', value: 10 }, { unit: 'px', value: 5 }, { unit: 'px', value: 10 }],
    // W95 buttons are typically smaller
    fontSize: [{ unit: 'rem', value: 0.9 }],
    borderRadius: '0',
    // No rounded corners
    fontFamily: ''MS Sans Serif', 'Tahoma', 'Geneva', 'system-ui', 'Arial', sans-serif'
  },
  'bodytheme-win95 button#createNewPasteLinkBtn': {
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#000000' }],
    borderTopColor: '#FFFFFF',
    borderLeftColor: '#FFFFFF',
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    boxShadow: [{ unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#000000' }],
    backgroundColor: 'var(--theme-button-bg)',
    color: 'var(--theme-button-text)',
    padding: [{ unit: 'px', value: 5 }, { unit: 'px', value: 10 }, { unit: 'px', value: 5 }, { unit: 'px', value: 10 }],
    // W95 buttons are typically smaller
    fontSize: [{ unit: 'rem', value: 0.9 }],
    borderRadius: '0',
    // No rounded corners
    fontFamily: ''MS Sans Serif', 'Tahoma', 'Geneva', 'system-ui', 'Arial', sans-serif'
  },
  'bodytheme-win95 button:active': {
    borderTopColor: '#808080',
    borderLeftColor: '#808080',
    borderRightColor: '#FFFFFF',
    borderBottomColor: '#FFFFFF',
    boxShadow: [{ unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }],
    transform: 'none',
    // No translate for W95 buttons
  },
  'bodytheme-win95 button#createPasteBtn:active': {
    borderTopColor: '#808080',
    borderLeftColor: '#808080',
    borderRightColor: '#FFFFFF',
    borderBottomColor: '#FFFFFF',
    boxShadow: [{ unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }],
    transform: 'none',
    // No translate for W95 buttons
  },
  'bodytheme-win95 button#copyLinkBtn:active': {
    borderTopColor: '#808080',
    borderLeftColor: '#808080',
    borderRightColor: '#FFFFFF',
    borderBottomColor: '#FFFFFF',
    boxShadow: [{ unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }],
    transform: 'none',
    // No translate for W95 buttons
  },
  'bodytheme-win95 button#createNewPasteLinkBtn:active': {
    borderTopColor: '#808080',
    borderLeftColor: '#808080',
    borderRightColor: '#FFFFFF',
    borderBottomColor: '#FFFFFF',
    boxShadow: [{ unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }, { unit: 'string', value: 'none' }],
    transform: 'none',
    // No translate for W95 buttons
  },
  'button#createPasteBtn:hover': {
    backgroundColor: 'var(--theme-text)',
    // Example: Invert for hover - might need adjustment
    color: 'var(--theme-bg)'
  },
  'button#copyLinkBtn:hover': {
    backgroundColor: 'var(--theme-text)',
    // Example: Invert for hover - might need adjustment
    color: 'var(--theme-bg)'
  },
  'button#createNewPasteLinkBtn:hover': {
    backgroundColor: 'var(--theme-text)',
    // Example: Invert for hover - might need adjustment
    color: 'var(--theme-bg)'
  },
  'paste-display-area pre#pasteOutput': {
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-input-text)',
    padding: [{ unit: 'rem', value: 1 }, { unit: 'rem', value: 1 }, { unit: 'rem', value: 1 }, { unit: 'rem', value: 1 }],
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    borderRadius: '4px',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
    minHeight: [{ unit: 'px', value: 150 }],
    // Give it some base height
    maxHeight: [{ unit: 'px', value: 400 }],
    overflowY: 'auto',
    fontFamily: ''Courier New', Courier, monospace'
  },
  'bodytheme-win95 paste-display-area pre#pasteOutput': {
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-input-text)',
    overflowY: 'auto',
    fontFamily: ''Courier New', Courier, monospace'
  },
  'bodytheme-win95 paste-display-area div#pasteOutput': {
    backgroundColor: 'var(--theme-input-bg)',
    color: 'var(--theme-input-text)',
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#000000' }],
    borderRightColor: '#808080',
    borderBottomColor: '#808080',
    boxShadow: [{ unit: 'string', value: 'inset' }, { unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#808080,' }, { unit: 'string', value: 'inset' }, { unit: 'px', value: -1 }, { unit: 'px', value: -1 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#FFFFFF' }],
    fontFamily: ''MS Sans Serif', 'Tahoma', 'Geneva', 'system-ui', 'Arial', sans-serif',
    // Use system font for text display in W95
    padding: [{ unit: 'px', value: 5 }, { unit: 'px', value: 5 }, { unit: 'px', value: 5 }, { unit: 'px', value: 5 }]
  },
  // Ensure Markdown code blocks in W95 theme also get W95 styling
  'bodytheme-win95 paste-display-area div#pasteOutput pre': {
    backgroundColor: 'var(--theme-input-bg) !important',
    // Override Prism's default if necessary
    color: 'var(--theme-input-text) !important',
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'string', value: '#808080' }],
    padding: [{ unit: 'px', value: 5 }, { unit: 'px', value: 5 }, { unit: 'px', value: 5 }, { unit: 'px', value: 5 }]
  },
  'bodytheme-win95 paste-display-area div#pasteOutput pre code': {
    fontFamily: ''Courier New', Courier, monospace !important',
    // Keep code monospaced
  },
  'paste-display-area #shareLink': {
    color: 'var(--theme-link)',
    wordBreak: 'break-all'
  },
  'paste-display-area h3': {
    // Style for the paste title in display view
    color: 'var(--theme-text)',
    marginTop: [{ unit: 'px', value: 0 }],
    marginBottom: [{ unit: 'rem', value: 0.5 }]
  },
  sidebar: {
    flex: '1',
    backgroundColor: 'var(--theme-container-bg)',
    padding: [{ unit: 'rem', value: 1.5 }, { unit: 'rem', value: 1.5 }, { unit: 'rem', value: 1.5 }, { unit: 'rem', value: 1.5 }],
    borderRadius: '8px',
    border: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    minHeight: [{ unit: 'px', value: 300 }],
    // Give sidebar some min height
  },
  'bodytheme-win95 sidebar': {
    border: [{ unit: 'px', value: 2 }, { unit: 'string', value: 'outset' }, { unit: 'string', value: '#FFFFFF' }],
    // Classic 3D border
    boxShadow: [{ unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#000000,' }, { unit: 'string', value: 'inset' }, { unit: 'px', value: 1 }, { unit: 'px', value: 1 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'string', value: '#808080' }]
  },
  'sidebar h4': {
    color: 'var(--theme-text)',
    borderBottom: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    paddingBottom: [{ unit: 'rem', value: 0.5 }],
    marginTop: [{ unit: 'px', value: 0 }],
    // Remove default margin
  },
  'sidebar ul': {
    listStyle: 'none',
    padding: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }]
  },
  'sidebar ul li': {
    marginBottom: [{ unit: 'rem', value: 0.5 }],
    // Add some spacing between recent pastes
  },
  'sidebar ul li a': {
    color: 'var(--theme-link)',
    textDecoration: 'none'
  },
  'sidebar ul li a:hover': {
    textDecoration: 'underline'
  },
  'sidebar p': {
    marginBottom: [{ unit: 'px', value: 10 }],
    fontSize: [{ unit: 'em', value: 0.9 }],
    color: 'var(--theme-sidebar-text)'
  },
  footer: {
    textAlign: 'center',
    padding: [{ unit: 'rem', value: 1 }, { unit: 'rem', value: 1 }, { unit: 'rem', value: 1 }, { unit: 'rem', value: 1 }],
    marginTop: [{ unit: 'rem', value: 1 }],
    backgroundColor: 'var(--theme-container-bg)',
    borderTop: [{ unit: 'px', value: 2 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }],
    color: 'var(--theme-sidebar-text)',
    fontSize: [{ unit: 'rem', value: 0.9 }]
  },
  // Utility classes
  hidden: {
    display: 'none !important'
  },
  // Responsive adjustments
  // AI News Container Styling
  '#aiNewsContainer': {
    marginTop: [{ unit: 'px', value: 15 }],
    paddingTop: [{ unit: 'px', value: 10 }],
    borderTop: [{ unit: 'px', value: 1 }, { unit: 'string', value: 'solid' }, { unit: 'em', value: NaN }]
  },
  'ai-news-item': {
    marginBottom: [{ unit: 'px', value: 15 }]
  },
  'ai-news-item h5': {
    margin: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 5 }, { unit: 'px', value: 0 }],
    fontSize: [{ unit: 'em', value: 1 }]
  },
  'ai-news-item h5 a': {
    color: 'var(--theme-link)',
    textDecoration: 'none'
  },
  'ai-news-item h5 a:hover': {
    textDecoration: 'underline'
  },
  'ai-news-item p': {
    fontSize: [{ unit: 'em', value: 0.85 }],
    margin: [{ unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }, { unit: 'px', value: 0 }],
    color: 'var(--theme-sidebar-text)'
  },
  'bodytheme-win95 ai-news-item h5 a': {
    color: 'var(--theme-link)'
  },
  'bodytheme-win95 sidebar ul li a': {
    color: 'var(--theme-link)'
  },
  // Matrix Canvas Styling
  'paste-input-area': {
    position: 'relative',
    // Needed for absolute positioning of the canvas
  },
  '#matrixCanvas': {
    position: 'absolute',
    top: [{ unit: 'px', value: 0 }],
    left: [{ unit: 'px', value: 0 }],
    width: [{ unit: '%H', value: 1 }],
    height: [{ unit: '%V', value: 1 }],
    zIndex: '0',
    // Behind other direct children of paste-input-area
    display: 'none',
    // Initially hidden, JS will show it
  },
  // Ensure textarea is above the canvas
  'paste-input-area textarea#pasteInput': {
    position: 'relative',
    zIndex: '1'
  },
  'paste-input-area paste-options': {
    position: 'relative',
    zIndex: '1'
  },
  'paste-input-area h2': {
    position: 'relative',
    zIndex: '1'
  },
  // ASCII Logo Styling
  '#asciiLogo': {
    fontFamily: ''Courier New', Courier, monospace',
    color: 'var(--theme-text)',
    // Use theme text color
    fontSize: [{ unit: 'px', value: 7 }],
    // Adjusted font size
    lineHeight: [{ unit: 'px', value: 1 }],
    // Critical: Set line height to 1 times font-size
    whiteSpace: 'pre',
    margin: [{ unit: 'px', value: 0 }, { unit: 'string', value: 'auto' }, { unit: 'px', value: 0 }, { unit: 'string', value: 'auto' }],
    // Center it
    textAlign: 'center',
    // Center the text within the pre block
    padding: [{ unit: 'px', value: 5 }, { unit: 'px', value: 0 }, { unit: 'px', value: 5 }, { unit: 'px', value: 0 }],
    // Fixed vertical padding
    letterSpacing: [{ unit: 'string', value: 'normal' }],
    // Default letter spacing
    display: 'block',
    // Ensure block behavior
    overflowX: 'auto',
    // Add horizontal scroll if wider than container
    overflowY: 'hidden',
    // Typically hide vertical scroll for pre
  },
  'bodytheme-win95 #asciiLogo': {
    color: 'var(--theme-header-text)',
    // Match W95 header text color
    fontFamily: ''Fixedsys', 'Terminal', 'Courier New', Courier, monospace',
    // Classic monospaced for W95
  }
});
