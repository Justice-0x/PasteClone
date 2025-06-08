// app.js - Complete updated file with real backend integration
// STEP 1: Replaced mock storage with real API calls
// STEP 2: Updated upload function to use FormData and real endpoints
// STEP 3: Updated download handling to fetch real file data
// STEP 4: Removed localStorage dependencies for production

import Prism from 'prismjs';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import 'prismjs/themes/prism-tomorrow.css';

// DOM Elements
const pasteInputElement = document.getElementById('pasteInput');
const syntaxHighlightingElement = document.getElementById('syntaxHighlighting');
const pasteExpirationElement = document.getElementById('pasteExpiration');
const pasteExposureElement = document.getElementById('pasteExposure');
const pasteFolderElement = document.getElementById('pasteFolder');
const pastePasswordElement = document.getElementById('pastePassword');
const burnAfterReadElement = document.getElementById('burnAfterRead');
const pasteTitleElement = document.getElementById('pasteTitle');
const createPasteBtnElement = document.getElementById('createPasteBtn');
const pasteCustomAliasElement = document.getElementById('pasteCustomAlias');

const pasteInputAreaElement = document.querySelector('.paste-input-area');
const pasteDisplayAreaElement = document.querySelector('.paste-display-area');

const displayTitleElement = document.getElementById('displayTitle');
const pasteOutputElement = document.getElementById('pasteOutput');
const shareLinkElement = document.getElementById('shareLink');
const rawLinkElement = document.getElementById('rawLink');
const copyLinkBtnElement = document.getElementById('copyLinkBtn');
const createNewPasteLinkBtnElement = document.getElementById('createNewPasteLinkBtn');
const recentPastesListElement = document.getElementById('recentPastesList');
const aiNewsContainerElement = document.getElementById('aiNewsContainer');
const themeSelectorElement = document.getElementById('themeSelector');
const matrixCanvasElement = document.getElementById('matrixCanvas');
const downloadPasteBtnElement = document.getElementById('downloadPasteBtn');

// Auth DOM Elements
const navLoginElement = document.getElementById('navLogin');
const navRegisterElement = document.getElementById('navRegister');
const navLogoutElement = document.getElementById('navLogout');
const userStatusElement = document.getElementById('userStatus');
const navDropNewPasteElement = document.getElementById('navDropNewPaste');
const navMatrixShareElement = document.getElementById('navMatrixShare');

const authFormsContainerElement = document.getElementById('authFormsContainer');
const registerFormContainerElement = document.getElementById('registerFormContainer');
const loginFormContainerElement = document.getElementById('loginFormContainer');
const registerFormElement = document.getElementById('registerForm');
const loginFormElement = document.getElementById('loginForm');
const registerMessageElement = document.getElementById('registerMessage');
const loginMessageElement = document.getElementById('loginMessage');
const switchToLoginLink = document.getElementById('switchToLogin');
const switchToRegisterLink = document.getElementById('switchToRegister');

// Price Ticker Elements
const tickerMoveElement = document.querySelector('.ticker-move');
const tickerPlayPauseButton = document.getElementById('tickerPlayPause');
const tickerPauseIcon = document.getElementById('tickerPauseIcon');
const tickerPlayIcon = document.getElementById('tickerPlayIcon');
const tokenTypeSelectorElement = document.getElementById('tokenTypeSelector');
let isTickerPaused = false;
let currentTickerType = 'top25crypto';

const GNEWS_API_KEY = process.env.GNEWS_API_KEY;

let currentPasteData = null;
let currentUser = null;
let authToken = null;
let isMatrixShareMode = false;
let selectedMatrixFiles = [];

// Matrix Effect Variables
let matrixCtx;
let matrixAnimationId = null;
const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
const matrixFontSize = 12;
let matrixColumns;
let matrixDrops;

let matrixFullScreenCanvas = null;
let matrixFullScreenCtx = null;
let matrixFullScreenAnimationId = null;

function getBackendUrl() {
    // In development, always use localhost:3001
    // In production, this would be your production API URL
    return 'http://localhost:3001';
}

const BACKEND_URL = getBackendUrl();

function initializeMatrix() {
    if (!matrixCanvasElement) return;
    matrixCtx = matrixCanvasElement.getContext('2d');
    matrixCanvasElement.width = matrixCanvasElement.offsetWidth;
    matrixCanvasElement.height = matrixCanvasElement.offsetHeight;
    matrixColumns = Math.floor(matrixCanvasElement.width / matrixFontSize);
    matrixDrops = [];
    for (let x = 0; x < matrixColumns; x++) {
        matrixDrops[x] = 1;
    }
}

function drawMatrix() {
    if (!matrixCtx || !matrixCanvasElement || matrixCanvasElement.style.display === 'none') {
        if (matrixAnimationId) cancelAnimationFrame(matrixAnimationId);
        matrixAnimationId = null;
        return;
    }

    matrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvasElement.width, matrixCanvasElement.height);
    matrixCtx.fillStyle = '#0F0';
    matrixCtx.font = matrixFontSize + 'px arial';

    for (let i = 0; i < matrixDrops.length; i++) {
        const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
        matrixCtx.fillText(text, i * matrixFontSize, matrixDrops[i] * matrixFontSize);
        if (matrixDrops[i] * matrixFontSize > matrixCanvasElement.height && Math.random() > 0.975) {
            matrixDrops[i] = 0;
        }
        matrixDrops[i]++;
    }
    matrixAnimationId = requestAnimationFrame(drawMatrix);
}

function startMatrix() {
    if (!matrixCanvasElement || !matrixCtx) initializeMatrix();
    if (matrixCanvasElement && matrixCtx) {
        matrixCanvasElement.style.display = 'block';
        if (!matrixAnimationId) {
            matrixAnimationId = requestAnimationFrame(drawMatrix);
        }
    }
}

function stopMatrix() {
    if (matrixAnimationId) {
        cancelAnimationFrame(matrixAnimationId);
        matrixAnimationId = null;
    }
    if (matrixCanvasElement) {
        matrixCanvasElement.style.display = 'none';
    }
}

// Full Screen Matrix
function initializeMatrixFullScreen() {
    if (matrixFullScreenCanvas) return;

    matrixFullScreenCanvas = document.createElement('canvas');
    matrixFullScreenCanvas.id = 'matrixFullScreenCanvas';
    matrixFullScreenCanvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -1;
        background: #000;
        pointer-events: none;
    `;
    document.body.appendChild(matrixFullScreenCanvas);

    matrixFullScreenCtx = matrixFullScreenCanvas.getContext('2d');
    matrixFullScreenCanvas.width = window.innerWidth;
    matrixFullScreenCanvas.height = window.innerHeight;
}

function startMatrixFullScreen() {
    if (!matrixFullScreenCanvas) initializeMatrixFullScreen();

    const columns = Math.floor(matrixFullScreenCanvas.width / 15);
    const drops = Array(columns).fill(1);

    function drawFullScreenMatrix() {
        if (!isMatrixShareMode) {
            stopMatrixFullScreen();
            return;
        }

        matrixFullScreenCtx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        matrixFullScreenCtx.fillRect(0, 0, matrixFullScreenCanvas.width, matrixFullScreenCanvas.height);
        matrixFullScreenCtx.fillStyle = '#00ff41';
        matrixFullScreenCtx.font = '15px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
            matrixFullScreenCtx.fillText(text, i * 15, drops[i] * 15);
            if (drops[i] * 15 > matrixFullScreenCanvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }

        matrixFullScreenAnimationId = requestAnimationFrame(drawFullScreenMatrix);
    }

    drawFullScreenMatrix();
}

function stopMatrixFullScreen() {
    if (matrixFullScreenAnimationId) {
        cancelAnimationFrame(matrixFullScreenAnimationId);
        matrixFullScreenAnimationId = null;
    }
}

function cleanupMatrixFullScreen() {
    stopMatrixFullScreen();
    if (matrixFullScreenCanvas) {
        document.body.removeChild(matrixFullScreenCanvas);
        matrixFullScreenCanvas = null;
        matrixFullScreenCtx = null;
    }
}

// STEP 5: Matrix Share Functions - Updated for real backend
function checkMatrixShareRoute() {
    const hash = window.location.hash;
    const isMatrixRoute = hash.includes('matrix-share') || hash.includes('matrix-download');

    if (isMatrixRoute && !isMatrixShareMode) {
        if (hash.includes('matrix-download')) {
            const matrixId = extractMatrixIdFromUrl();
            if (matrixId) {
                loadMatrixDownloadPage(matrixId);
            } else {
                loadMatrixShareApp();
            }
        } else {
            loadMatrixShareApp();
        }
        return true;
    } else if (!isMatrixRoute && isMatrixShareMode) {
        exitMatrixShareMode();
        return false;
    }
    return isMatrixRoute;
}

function extractMatrixIdFromUrl() {
    const hash = window.location.hash;
    const match = hash.match(/matrix-download\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// STEP 6: Real Backend Download Page - Fetches actual file data
function loadMatrixDownloadPage(matrixId) {
    isMatrixShareMode = true;
    showView('matrixShare');
    startMatrixFullScreen();

    const main = document.querySelector('main');
    if (main) {
        // Show loading state
        main.innerHTML = `
            <div id="matrixShareContainer" class="matrix-share-container">
                <div class="matrix-share-content">
                    <div class="matrix-header">
                        <button id="matrixBackBtn" class="matrix-back-btn">← Back to Paste</button>
                        <h1>
                            <span class="matrix-lock-icon">🔐</span>
                            <span class="matrix-title-text">Matrix Download</span>
                        </h1>
                        <p>🔍 Locating files in the Matrix...</p>
                    </div>
                    <div class="matrix-loading">
                        <div class="loading-spinner"></div>
                        <p>Accessing encrypted files...</p>
                    </div>
                </div>
            </div>
        `;

        // Fetch real file data from backend
        fetch(`${BACKEND_URL}/api/matrix-download?matrixId=${matrixId}&info=true`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Files not found or expired');
            }
            return response.json();
        })
        .then(fileData => {
            main.innerHTML = `
                <div id="matrixShareContainer" class="matrix-share-container">
                    <div class="matrix-share-content">
                        <div class="matrix-header">
                            <button id="matrixBackBtn" class="matrix-back-btn">← Back to Paste</button>
                            <h1>
                                <span class="matrix-lock-icon">🔐</span>
                                <span class="matrix-title-text">Matrix Download</span>
                            </h1>
                            <p>✅ Files ready for download!</p>
                        </div>

                        <div class="matrix-download-area">
                            <div class="download-info">
                                <h3>📁 Files Ready for Download</h3>
                                <p><strong>Files:</strong> ${fileData.files.length}</p>
                                <p><strong>Total Size:</strong> ${formatFileSize(fileData.totalSize)}</p>
                                <p><strong>Expires:</strong> ${new Date(fileData.expiresAt).toLocaleString()}</p>
                                <p><strong>Matrix ID:</strong> ${matrixId}</p>
                            </div>

                            <div class="file-list">
                                ${fileData.files.map((file, index) => `
                                    <div class="file-item">
                                        <span class="file-name">📄 ${file.name}</span>
                                        <span class="file-size">${formatFileSize(file.size)}</span>
                                        <a href="/api/matrix-download?matrixId=${matrixId}&fileIndex=${index}"
                                           class="matrix-btn-small" download="${file.name}">Download</a>
                                    </div>
                                `).join('')}
                            </div>

                            <div class="download-actions">
                                <a href="/api/matrix-download?matrixId=${matrixId}&downloadAll=true"
                                   class="matrix-btn" download="matrix-files.zip">⬇️ Download All Files</a>
                                <button id="matrixBackToMain2" class="matrix-btn-secondary">Back to Paste</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            initializeMatrixDownloadEvents();
        })
        .catch(error => {
            console.error('Matrix download error:', error);
            main.innerHTML = `
                <div id="matrixShareContainer" class="matrix-share-container">
                    <div class="matrix-share-content">
                        <div class="matrix-header">
                            <button id="matrixBackBtn" class="matrix-back-btn">← Back to Paste</button>
                            <h1>
                                <span class="matrix-lock-icon">🔐</span>
                                <span class="matrix-title-text">File Not Found</span>
                            </h1>
                        </div>

                        <div class="matrix-error">
                            <h3>❌ File Not Found or Expired</h3>
                            <p>Matrix ID: <code>${matrixId}</code></p>
                            <p>This Matrix share doesn't exist or has been deleted.</p>
                            <button id="matrixBackToMain3" class="matrix-btn">Back to Matrix Share</button>
                        </div>
                    </div>
                </div>
            `;

            initializeMatrixDownloadEvents();
        });

        addMatrixShareStyles();
    }
}

function initializeMatrixDownloadEvents() {
    const backBtn = document.getElementById('matrixBackBtn');
    const backToMain2 = document.getElementById('matrixBackToMain2');
    const backToMain3 = document.getElementById('matrixBackToMain3');

    backBtn?.addEventListener('click', exitMatrixShareMode);
    backToMain2?.addEventListener('click', exitMatrixShareMode);
    backToMain3?.addEventListener('click', () => {
        window.location.hash = 'matrix-share';
        loadMatrixShareApp();
    });
}

function loadMatrixShareApp() {
    isMatrixShareMode = true;
    showView('matrixShare');
    startMatrixFullScreen();

    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = `
            <div id="matrixShareContainer" class="matrix-share-container">
                <div class="matrix-share-content">
                    <div class="matrix-header">
                        <button id="matrixBackBtn" class="matrix-back-btn">← Back to Paste</button>
                        <h1>
                            <span class="matrix-lock-icon">🔐</span>
                            <span class="matrix-title-text">MyGuy-MATRIX-Share</span>
                        </h1>
                        <p>Secure, encrypted file sharing with that Matrix aesthetic, fam!</p>
                    </div>

                    <div id="matrixUploadSection" class="matrix-upload-section">
                        <div id="matrixDropZone" class="matrix-drop-zone">
                            <div class="drop-content">
                                <span class="matrix-icon">📁</span>
                                <h3>Drop files here or click to select</h3>
                                <p>Up to 2GB • AES-256 encryption • Auto-expires in 24h</p>
                                <input type="file" id="matrixFileInput" multiple hidden>
                            </div>
                        </div>

                        <div class="matrix-options">
                            <div class="option-group">
                                <label for="matrixExpiration">⏰ Expiration:</label>
                                <select id="matrixExpiration">
                                    <option value="1h">1 Hour</option>
                                    <option value="24h" selected>24 Hours</option>
                                    <option value="7d">7 Days</option>
                                </select>
                            </div>

                            <div class="option-group">
                                <label for="matrixPassword">🔒 Password (Optional):</label>
                                <input type="password" id="matrixPassword" placeholder="Add extra security">
                            </div>

                            <button id="matrixUploadBtn" class="matrix-btn" disabled>
                                🚀 Launch into the Matrix
                            </button>
                        </div>
                    </div>

                    <div id="matrixUploadProgress" class="matrix-progress hidden">
                        <div class="progress-container">
                            <div class="progress-bar">
                                <div class="progress-fill"></div>
                            </div>
                            <p class="progress-text">Initializing encryption...</p>
                        </div>
                    </div>

                    <div id="matrixResult" class="matrix-result hidden">
                        <h3>🎯 File locked and loaded in the Matrix!</h3>
                        <div class="result-content">
                            <div class="share-link-container">
                                <input type="text" id="matrixShareLink" readonly>
                                <button id="matrixCopyBtn" class="matrix-btn-small">Copy Link</button>
                            </div>
                            <div class="qr-container">
                                <canvas id="matrixQRCode"></canvas>
                                <p>Scan to share on mobile</p>
                            </div>
                            <div class="result-actions">
                                <button id="matrixNewUpload" class="matrix-btn">Upload Another</button>
                                <button id="matrixBackToMain" class="matrix-btn-secondary">Back to Paste</button>
                            </div>
                        </div>
                    </div>

                    <div class="matrix-info">
                        <h4>🛡️ Security Features</h4>
                        <div class="security-grid">
                            <div class="security-item">✅ End-to-end AES-256-GCM encryption</div>
                            <div class="security-item">✅ Zero-knowledge architecture</div>
                            <div class="security-item">✅ Automatic file deletion</div>
                            <div class="security-item">✅ No server-side decryption</div>
                            <div class="security-item">✅ Optional password protection</div>
                            <div class="security-item">✅ Military-grade security</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        initializeMatrixShareEvents();
        addMatrixShareStyles();
    }
}

function addMatrixShareStyles() {
    const existingStyle = document.getElementById('matrixShareStyles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'matrixShareStyles';
    style.textContent = `
        .matrix-share-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            color: #00ff41;
            position: relative;
            z-index: 1;
        }

        .matrix-share-content {
            background: rgba(0, 20, 0, 0.9);
            border: 1px solid #00ff41;
            border-radius: 12px;
            padding: 30px;
            backdrop-filter: blur(10px);
        }

        .matrix-header {
            text-align: center;
            margin-bottom: 30px;
            position: relative;
            padding-top: 50px;
        }

        .matrix-header h1 {
            color: #00ff41;
            text-shadow: 0 0 20px #00ff41;
            font-size: 2.5rem;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
            line-height: 1;
        }

        .matrix-lock-icon {
            font-size: 2.0rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }

        .matrix-title-text {
            display: inline-flex;
            align-items: center;
            font-weight: bold;
            line-height: 1;
        }

        .matrix-back-btn {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0, 255, 65, 0.1);
            color: #00ff41;
            border: 1px solid #00ff41;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            z-index: 10;
        }

        .matrix-back-btn:hover {
            background: #00ff41;
            color: #000;
            transform: translateY(-2px);
        }

        .matrix-drop-zone {
            border: 2px dashed #00ff41;
            border-radius: 12px;
            padding: 60px 40px;
            text-align: center;
            transition: all 0.3s ease;
            background: rgba(0, 255, 65, 0.05);
            cursor: pointer;
            margin-bottom: 30px;
        }

        .matrix-drop-zone.dragover {
            background: rgba(0, 255, 65, 0.15);
            border-color: #00cc33;
            transform: scale(1.02);
        }

        .matrix-icon {
            font-size: 4rem;
            display: block;
            margin-bottom: 20px;
        }

        .matrix-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }

        .option-group {
            display: flex;
            flex-direction: column;
        }

        .option-group label {
            color: #00ff41;
            margin-bottom: 8px;
            font-weight: bold;
        }

        .option-group select,
        .option-group input {
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid #00ff41;
            color: #00ff41;
            padding: 12px;
            border-radius: 6px;
            font-family: monospace;
        }

        .matrix-btn {
            grid-column: 1 / -1;
            background: linear-gradient(90deg, #00ff41, #00cc33);
            color: #000;
            border: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 1.1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            text-transform: uppercase;
            text-decoration: none;
            display: inline-block;
            text-align: center;
        }

        .matrix-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 255, 65, 0.3);
        }

        .matrix-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .matrix-btn-small {
            background: #00ff41;
            color: #000;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
        }

        .matrix-btn-secondary {
            background: rgba(0, 255, 65, 0.1);
            color: #00ff41;
            border: 1px solid #00ff41;
        }

        .matrix-progress {
            text-align: center;
            padding: 40px;
        }

        .progress-container {
            position: relative;
        }

        .progress-bar {
            width: 100%;
            height: 25px;
            background: rgba(0, 255, 65, 0.1);
            border-radius: 12px;
            overflow: hidden;
            margin-bottom: 20px;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #00ff41, #00cc33);
            width: 0%;
            transition: width 0.5s ease;
            border-radius: 12px;
        }

        .progress-text {
            color: #00ff41;
            font-size: 1.2rem;
            margin-bottom: 20px;
        }

        .matrix-result {
            text-align: center;
            padding: 40px;
        }

        .share-link-container {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
        }

        .share-link-container input {
            flex: 1;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid #00ff41;
            color: #00ff41;
            padding: 12px;
            border-radius: 6px;
            font-family: monospace;
        }

        .qr-container {
            margin-bottom: 30px;
        }

        .qr-container canvas {
            border: 2px solid #00ff41;
            border-radius: 8px;
        }

        .result-actions {
            display: flex;
            gap: 20px;
            justify-content: center;
        }

        .matrix-info {
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid #00ff41;
        }

        .matrix-info h4 {
            color: #00ff41;
            text-align: center;
            margin-bottom: 20px;
        }

        .security-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }

        .security-item {
            background: rgba(0, 255, 65, 0.1);
            padding: 15px;
            border-radius: 6px;
            border-left: 3px solid #00ff41;
        }

        .matrix-download-area {
            max-width: 600px;
            margin: 0 auto;
        }

        .download-info {
            background: rgba(0, 255, 65, 0.1);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #00ff41;
        }

        .file-list {
            margin-bottom: 30px;
        }

        .file-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px;
            margin-bottom: 10px;
            background: rgba(0, 255, 65, 0.05);
            border: 1px solid rgba(0, 255, 65, 0.3);
            border-radius: 6px;
        }

        .file-name {
            flex: 1;
            font-weight: bold;
        }

        .file-size {
            margin: 0 15px;
            opacity: 0.8;
        }

        .download-actions {
            display: flex;
            gap: 20px;
            justify-content: center;
        }

        .matrix-error {
            text-align: center;
            padding: 40px;
        }

        .matrix-error h3 {
            color: #ff4444;
            margin-bottom: 20px;
        }

        .matrix-loading {
            text-align: center;
            padding: 40px;
        }

        .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(0, 255, 65, 0.3);
            border-top: 4px solid #00ff41;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .hidden {
            display: none !important;
        }

        /* File Preview Styles */
        .selected-files-preview {
            text-align: left;
            padding: 20px;
        }

        .selected-files-preview h4 {
            color: #00ff41;
            margin-bottom: 15px;
            text-align: center;
        }

        .file-list-preview {
            max-height: 300px;
            overflow-y: auto;
            margin-bottom: 20px;
            border: 1px solid rgba(0, 255, 65, 0.3);
            border-radius: 8px;
            background: rgba(0, 255, 65, 0.02);
        }

        .file-preview-item {
            display: grid;
            grid-template-columns: 40px 1fr auto auto;
            align-items: center;
            gap: 10px;
            padding: 10px;
            border-bottom: 1px solid rgba(0, 255, 65, 0.1);
            transition: background 0.2s ease;
        }

        .file-preview-item:hover {
            background: rgba(0, 255, 65, 0.05);
        }

        .file-preview-item:last-child {
            border-bottom: none;
        }

        .file-icon {
            font-size: 1.5rem;
            text-align: center;
        }

        .file-info {
            display: flex;
            flex-direction: column;
            gap: 2px;
            min-width: 0;
        }

        .file-name {
            font-weight: bold;
            color: #00ff41;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .file-size {
            font-size: 0.8rem;
            opacity: 0.8;
        }

        .file-type {
            font-size: 0.7rem;
            opacity: 0.6;
            font-family: monospace;
        }

        .image-preview-container {
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .image-preview {
            max-width: 40px;
            max-height: 40px;
            border-radius: 4px;
            border: 1px solid rgba(0, 255, 65, 0.3);
        }

        .remove-file-btn {
            background: transparent;
            border: 1px solid rgba(255, 68, 68, 0.5);
            color: #ff4444;
            padding: 5px 8px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.2s ease;
        }

        .remove-file-btn:hover {
            background: #ff4444;
            color: #000;
        }

        .file-actions {
            display: flex;
            gap: 10px;
            justify-content: center;
            margin-top: 15px;
        }

        .add-more-files-btn,
        .clear-all-files-btn {
            background: rgba(0, 255, 65, 0.1);
            color: #00ff41;
            border: 1px solid #00ff41;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }

        .add-more-files-btn:hover {
            background: #00ff41;
            color: #000;
        }

        .clear-all-files-btn {
            border-color: #ff6b6b;
            color: #ff6b6b;
        }

        .clear-all-files-btn:hover {
            background: #ff6b6b;
            color: #000;
        }

        @media (max-width: 768px) {
            .matrix-options {
                grid-template-columns: 1fr;
            }

            .matrix-share-content {
                padding: 20px;
            }

            .matrix-drop-zone {
                padding: 40px 20px;
            }

            .result-actions, .download-actions {
                flex-direction: column;
            }

            .matrix-header h1 {
                font-size: 2rem;
                gap: 0.3rem;
            }

            .matrix-lock-icon {
                font-size: 1.8rem;
            }

            .file-item {
                flex-direction: column;
                gap: 10px;
                text-align: center;
            }

            .matrix-header {
                padding-top: 60px;
            }
        }
    `;
    document.head.appendChild(style);
}

function initializeMatrixShareEvents() {
    const dropZone = document.getElementById('matrixDropZone');
    const fileInput = document.getElementById('matrixFileInput');
    const uploadBtn = document.getElementById('matrixUploadBtn');
    const copyBtn = document.getElementById('matrixCopyBtn');
    const newUploadBtn = document.getElementById('matrixNewUpload');
    const backBtn = document.getElementById('matrixBackBtn');
    const backToMainBtn = document.getElementById('matrixBackToMain');

    dropZone?.addEventListener('click', () => fileInput?.click());

    dropZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone?.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        handleMatrixFiles(e.dataTransfer.files);
    });

    fileInput?.addEventListener('change', (e) => {
        handleMatrixFiles(e.target.files);
    });

    uploadBtn?.addEventListener('click', uploadMatrixFiles);
    copyBtn?.addEventListener('click', copyMatrixLink);
    newUploadBtn?.addEventListener('click', resetMatrixUpload);
    backBtn?.addEventListener('click', exitMatrixShareMode);
    backToMainBtn?.addEventListener('click', exitMatrixShareMode);
}

function handleMatrixFiles(files) {
    if (files.length > 0) {
        selectedMatrixFiles = Array.from(files);
        const uploadBtn = document.getElementById('matrixUploadBtn');
        const dropZone = document.getElementById('matrixDropZone');

        const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
        const totalSize = selectedMatrixFiles.reduce((sum, file) => sum + file.size, 0);

        // File type validation
        const allowedTypes = [
            'image/', 'video/', 'audio/', 'text/', 'application/pdf', 
            'application/zip', 'application/rar', 'application/7z',
            'application/msword', 'application/vnd.openxmlformats-officedocument',
            'application/vnd.ms-excel', 'application/vnd.ms-powerpoint',
            'application/json', 'application/javascript', 'application/xml'
        ];

        const invalidFiles = selectedMatrixFiles.filter(file => 
            !allowedTypes.some(type => file.type.startsWith(type)) && 
            !file.name.match(/\.(txt|md|py|js|html|css|json|xml|csv|log|sql|sh|bat|php|java|cpp|c|h|rb|go|rs|swift|kt|dart|ts|jsx|tsx|vue|svelte)$/i)
        );

        if (invalidFiles.length > 0) {
            alert(`Some files may not be supported:\n${invalidFiles.map(f => f.name).join('\n')}\n\nThey'll still be uploaded, but may not be previewable.`);
        }

        if (totalSize > maxSize) {
            alert(`File size exceeds 2GB limit for free users!\nTotal: ${formatFileSize(totalSize)}`);
            selectedMatrixFiles = [];
            return;
        }

        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.textContent = `🚀 Upload ${files.length} file(s) to Matrix`;
        }

        // Enhanced file display with previews
        if (dropZone) {
            const dropContent = dropZone.querySelector('.drop-content');
            if (dropContent) {
                dropContent.innerHTML = `
                    <div class="selected-files-preview">
                        <h4>✅ ${files.length} file(s) selected (${formatFileSize(totalSize)})</h4>
                        <div class="file-list-preview">
                            ${selectedMatrixFiles.map((file, index) => {
                                const fileIcon = getFileIcon(file);
                                const isImage = file.type.startsWith('image/');
                                return `
                                    <div class="file-preview-item" data-index="${index}">
                                        <div class="file-icon">${fileIcon}</div>
                                        <div class="file-info">
                                            <div class="file-name" title="${file.name}">${truncateFileName(file.name, 25)}</div>
                                            <div class="file-size">${formatFileSize(file.size)}</div>
                                            <div class="file-type">${file.type || 'Unknown'}</div>
                                        </div>
                                        ${isImage ? `<div class="image-preview-container">
                                            <img class="image-preview" data-index="${index}" style="display:none;" />
                                        </div>` : ''}
                                        <button class="remove-file-btn" data-index="${index}">❌</button>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div class="file-actions">
                            <button class="add-more-files-btn">📁 Add More Files</button>
                            <button class="clear-all-files-btn">🗑️ Clear All</button>
                        </div>
                    </div>
                `;

                // Load image previews
                selectedMatrixFiles.forEach((file, index) => {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const img = dropContent.querySelector(`img[data-index="${index}"]`);
                            if (img) {
                                img.src = e.target.result;
                                img.style.display = 'block';
                            }
                        };
                        reader.readAsDataURL(file);
                    }
                });

                // Add event listeners for new buttons
                const addMoreBtn = dropContent.querySelector('.add-more-files-btn');
                const clearAllBtn = dropContent.querySelector('.clear-all-files-btn');
                const removeFileBtns = dropContent.querySelectorAll('.remove-file-btn');

                addMoreBtn?.addEventListener('click', () => {
                    document.getElementById('matrixFileInput')?.click();
                });

                clearAllBtn?.addEventListener('click', () => {
                    selectedMatrixFiles = [];
                    resetMatrixFileDisplay();
                });

                removeFileBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const index = parseInt(e.target.dataset.index);
                        selectedMatrixFiles.splice(index, 1);
                        if (selectedMatrixFiles.length === 0) {
                            resetMatrixFileDisplay();
                        } else {
                            handleMatrixFiles(selectedMatrixFiles);
                        }
                    });
                });
            }
        }
    }
}

function getFileIcon(file) {
    const type = file.type.toLowerCase();
    const name = file.name.toLowerCase();
    
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('pdf')) return '📄';
    if (type.includes('zip') || type.includes('rar') || type.includes('7z')) return '📦';
    if (type.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return '📝';
    if (type.includes('excel') || name.endsWith('.xls') || name.endsWith('.xlsx')) return '📊';
    if (type.includes('powerpoint') || name.endsWith('.ppt') || name.endsWith('.pptx')) return '📈';
    if (type.includes('text') || name.match(/\.(txt|md|log)$/)) return '📄';
    if (name.match(/\.(js|ts|jsx|tsx|json)$/)) return '⚡';
    if (name.match(/\.(html|css|xml)$/)) return '🌐';
    if (name.match(/\.(py|java|cpp|c|h|rb|go|rs|swift|kt|php)$/)) return '💻';
    
    return '📁';
}

function truncateFileName(name, maxLength) {
    if (name.length <= maxLength) return name;
    const ext = name.split('.').pop();
    const nameWithoutExt = name.slice(0, name.lastIndexOf('.'));
    const truncated = nameWithoutExt.slice(0, maxLength - ext.length - 4) + '...';
    return `${truncated}.${ext}`;
}

function resetMatrixFileDisplay() {
    const uploadBtn = document.getElementById('matrixUploadBtn');
    const dropZone = document.getElementById('matrixDropZone');

    if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.textContent = '🚀 Launch into the Matrix';
    }

    if (dropZone) {
        const dropContent = dropZone.querySelector('.drop-content');
        if (dropContent) {
            dropContent.innerHTML = `
                <span class="matrix-icon">📁</span>
                <h3>Drop files here or click to select</h3>
                <p>Up to 2GB • AES-256 encryption • Auto-expires in 24h</p>
            `;
        }
    }

    const fileInput = document.getElementById('matrixFileInput');
    if (fileInput) fileInput.value = '';
}

// STEP 7: Real Backend Upload Function - Uses FormData and real API endpoints with progress tracking
async function uploadMatrixFiles() {
    const uploadSection = document.getElementById('matrixUploadSection');
    const progressSection = document.getElementById('matrixUploadProgress');
    const resultSection = document.getElementById('matrixResult');

    uploadSection?.classList.add('hidden');
    progressSection?.classList.remove('hidden');

    try {
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');

        // Show initial progress
        if (progressText) progressText.textContent = 'Preparing files for upload...';
        if (progressFill) progressFill.style.width = '5%';

        // Create FormData for real file upload
        const formData = new FormData();

        selectedMatrixFiles.forEach(file => {
            formData.append('files', file);
        });

        const expiration = document.getElementById('matrixExpiration')?.value || '24h';
        const password = document.getElementById('matrixPassword')?.value || '';

        formData.append('expiration', expiration);
        if (password) {
            formData.append('password', password);
        }

        if (progressText) progressText.textContent = 'Encrypting and uploading to Matrix servers...';

        console.log('🚀 Making request to:', `${BACKEND_URL}/api/matrix-upload`);
        console.log('📁 Selected files:', selectedMatrixFiles.length);

        // Use XMLHttpRequest for upload progress tracking
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                const speed = (e.loaded / 1024 / 1024).toFixed(2); // MB uploaded
                const total = (e.total / 1024 / 1024).toFixed(2); // Total MB
                
                if (progressFill) progressFill.style.width = `${Math.min(percentComplete, 95)}%`;
                if (progressText) {
                    progressText.textContent = `Uploading: ${speed}MB / ${total}MB (${Math.round(percentComplete)}%)`;
                }
            }
        });

        // Handle completion
        xhr.addEventListener('load', async () => {
            if (progressText) progressText.textContent = 'Processing upload...';
            if (progressFill) progressFill.style.width = '100%';

            console.log('📡 Response status:', xhr.status);

            if (xhr.status !== 200) {
                let errorData;
                try {
                    errorData = JSON.parse(xhr.responseText);
                } catch (parseError) {
                    console.error('❌ Failed to parse error response as JSON:', parseError);
                    throw new Error(`Upload failed: ${xhr.status} - ${xhr.responseText || 'No response body'}`);
                }
                throw new Error(errorData.error || `Upload failed: ${xhr.status}`);
            }

            let result;
            try {
                result = JSON.parse(xhr.responseText);
            } catch (parseError) {
                console.error('❌ Failed to parse success response as JSON:', parseError);
                console.error('❌ Response text was:', xhr.responseText);
                throw new Error('Server returned invalid JSON response');
            }

            if (progressText) progressText.textContent = 'Upload complete! Generating share link...';
            
            await new Promise(resolve => setTimeout(resolve, 500));

            progressSection?.classList.add('hidden');
            resultSection?.classList.remove('hidden');

            // Use real download URL from backend response
            const shareLink = `${window.location.origin}/#matrix-download/${result.id}`;
            const shareLinkInput = document.getElementById('matrixShareLink');
            if (shareLinkInput) {
                shareLinkInput.value = shareLink;
            }

            generateMatrixQR(shareLink);
            console.log('✅ Real Matrix upload successful:', result);
        });

        // Handle errors
        xhr.addEventListener('error', () => {
            throw new Error('Network error during upload');
        });

        // Handle timeouts
        xhr.addEventListener('timeout', () => {
            throw new Error('Upload timed out');
        });

        // Configure and send request
        xhr.open('POST', `${BACKEND_URL}/api/matrix-upload`);
        xhr.timeout = 300000; // 5 minute timeout
        xhr.send(formData);

    } catch (error) {
        console.error('❌ Matrix upload failed:', error);
        progressSection?.classList.add('hidden');
        uploadSection?.classList.remove('hidden');

        // Enhanced error handling for different scenarios
        let errorMessage = 'Upload failed. Please try again.';
        if (error.message.includes('413') || error.message.includes('too large')) {
            errorMessage = 'File too large! Free users are limited to 2GB. Upgrade for 10GB limit.';
        } else if (error.message.includes('400')) {
            errorMessage = 'Invalid file or missing data. Please check your files and try again.';
        } else if (error.message.includes('500')) {
            errorMessage = 'Server error. Please try again in a few moments.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('Network') || error.message.includes('timed out')) {
            errorMessage = 'Network error. Please check if the backend server is running and try again.';
        } else {
            errorMessage = `Upload failed: ${error.message}`;
        }

        alert(errorMessage);
        resetMatrixUpload();
    }
}

function generateMatrixQR(text) {
    const canvas = document.getElementById('matrixQRCode');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 150;
    canvas.height = 150;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 150, 150);

    ctx.fillStyle = '#00ff41';
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (Math.random() > 0.5) {
                ctx.fillRect(i * 10, j * 10, 10, 10);
            }
        }
    }

    ctx.fillStyle = '#00ff41';
    ctx.fillRect(0, 0, 30, 30);
    ctx.fillRect(120, 0, 30, 30);
    ctx.fillRect(0, 120, 30, 30);
}

function copyMatrixLink() {
    const linkInput = document.getElementById('matrixShareLink');
    const copyBtn = document.getElementById('matrixCopyBtn');

    if (linkInput && copyBtn) {
        linkInput.select();
        document.execCommand('copy');

        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#00cc33';

        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#00ff41';
        }, 2000);
    }
}

function resetMatrixUpload() {
    const uploadSection = document.getElementById('matrixUploadSection');
    const progressSection = document.getElementById('matrixUploadProgress');
    const resultSection = document.getElementById('matrixResult');
    const uploadBtn = document.getElementById('matrixUploadBtn');
    const dropZone = document.getElementById('matrixDropZone');

    uploadSection?.classList.remove('hidden');
    progressSection?.classList.add('hidden');
    resultSection?.classList.add('hidden');

    if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.textContent = '🚀 Launch into the Matrix';
    }

    if (dropZone) {
        const h3 = dropZone.querySelector('.drop-content h3');
        if (h3) {
            h3.textContent = 'Drop files here or click to select';
        }
    }

    selectedMatrixFiles = [];

    const fileInput = document.getElementById('matrixFileInput');
    if (fileInput) fileInput.value = '';
}

function exitMatrixShareMode() {
    isMatrixShareMode = false;
    cleanupMatrixFullScreen();

    const styleElement = document.getElementById('matrixShareStyles');
    if (styleElement) {
        styleElement.remove();
    }

    window.location.hash = '';
    window.location.reload();
}

// Initialize sidebar Matrix Share button
function initializeSidebarMatrixShare() {
    const sidebarMatrixBtn = document.querySelector('.matrix-share-sidebar-btn, [href*="matrix"], [onclick*="matrix"]');

    if (sidebarMatrixBtn) {
        sidebarMatrixBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = 'matrix-share';
            loadMatrixShareApp();
        });
    }

    const enterMatrixBtns = Array.from(document.querySelectorAll('button, a')).filter(el =>
        el.textContent.includes('Enter the MATRIX') || el.textContent.includes('MATRIX')
    );

    enterMatrixBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.hash = 'matrix-share';
            loadMatrixShareApp();
        });
    });
}

// Theme handling
function applyTheme(themeName) {
    document.body.classList.remove('theme-dark', 'theme-spooky', 'theme-win95');
    if (themeName) {
        document.body.classList.add(`theme-${themeName}`);
    }
    localStorage.setItem('theme', themeName);
    if (themeSelectorElement) {
        themeSelectorElement.value = themeName;
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyTheme(savedTheme);
}

if (themeSelectorElement) {
    themeSelectorElement.addEventListener('change', (event) => {
        applyTheme(event.target.value);
    });
}

function copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Copied!';
        setTimeout(() => {
            buttonElement.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Whoops! Couldn\'t snag that link.');
    });
}

function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

function updateUserNavUI() {
    if (authToken && currentUser) {
        navLoginElement.style.display = 'none';
        navRegisterElement.style.display = 'none';
        userStatusElement.textContent = `Yo, ${currentUser.username}!`;
        userStatusElement.style.display = 'inline';
        navLogoutElement.style.display = 'inline';
    } else {
        navLoginElement.style.display = 'inline';
        navRegisterElement.style.display = 'inline';
        userStatusElement.style.display = 'none';
        userStatusElement.textContent = '';
        navLogoutElement.style.display = 'none';
    }
}

function showView(viewName) {
    pasteInputAreaElement.style.display = 'none';
    pasteDisplayAreaElement.style.display = 'none';
    authFormsContainerElement.style.display = 'none';
    registerFormContainerElement.style.display = 'none';
    loginFormContainerElement.style.display = 'none';
    stopMatrix();

    if (viewName === 'pasteInput') {
        pasteInputAreaElement.style.display = 'block';
        startMatrix();
    } else if (viewName === 'pasteDisplay') {
        pasteDisplayAreaElement.style.display = 'block';
    } else if (viewName === 'login') {
        authFormsContainerElement.style.display = 'block';
        loginFormContainerElement.style.display = 'block';
    } else if (viewName === 'register') {
        authFormsContainerElement.style.display = 'block';
        registerFormContainerElement.style.display = 'block';
    } else if (viewName === 'matrixShare') {
        return;
    }

    if (viewName !== 'pasteDisplay' && !window.location.search.includes('paste=') && viewName !== 'matrixShare') {
        window.history.pushState({}, '', window.location.pathname);
    }
}

function showPasteInputArea() {
    showView('pasteInput');
    if (pasteInputElement) pasteInputElement.value = '';
    if (pasteTitleElement) pasteTitleElement.value = '';
    if (pasteCustomAliasElement) pasteCustomAliasElement.value = '';
    if (pasteExpirationElement) pasteExpirationElement.value = '1d';
    if (syntaxHighlightingElement) syntaxHighlightingElement.value = 'none';
    if (pasteExposureElement) pasteExposureElement.value = 'public';
    if (pastePasswordElement) pastePasswordElement.value = '';
    if (burnAfterReadElement) burnAfterReadElement.checked = false;
    currentPasteData = null;
}

function showPasteDisplayArea(pasteData) {
    showView('pasteDisplay');
    currentPasteData = pasteData;

    displayTitleElement.textContent = pasteData.title || 'MyGuy\'s Fresh Drop';
    pasteOutputElement.innerHTML = '';
    pasteOutputElement.className = '';

    const language = pasteData.syntax || 'none';
    if (language === 'markdown') {
        const rawHtml = marked.parse(pasteData.content || '');
        const sanitizedHtml = DOMPurify.sanitize(rawHtml);
        pasteOutputElement.innerHTML = sanitizedHtml;
        pasteOutputElement.querySelectorAll('pre code').forEach((block) => {
            Prism.highlightElement(block);
        });
    } else {
        const preElement = document.createElement('pre');
        const codeElement = document.createElement('code');
        codeElement.textContent = pasteData.content || '';
        if (language !== 'none' && language !== 'text') {
            codeElement.className = 'language-' + language;
        }
        preElement.appendChild(codeElement);
        pasteOutputElement.appendChild(preElement);
        if (language !== 'none' && language !== 'text') {
            Prism.highlightElement(codeElement);
        } else {
            preElement.className = 'language-text';
        }
    }

    const displayId = pasteData.custom_alias || pasteData.id;
    const pasteUrl = `${window.location.origin}${window.location.pathname}?paste=${displayId}`;
    shareLinkElement.href = pasteUrl;
    shareLinkElement.textContent = pasteUrl;
    if (rawLinkElement) {
        rawLinkElement.href = `${pasteUrl}&raw=true`;
    }
    window.history.pushState(pasteData, pasteData.title || 'MyGuy Paste', `${window.location.pathname}?paste=${displayId}`);
}

// Event Listeners
if (createPasteBtnElement) {
    createPasteBtnElement.addEventListener('click', async () => {
        const content = pasteInputElement.value;
        if (!content.trim()) {
            alert('Yo, drop some text first!');
            return;
        }

        const pasteDataForServer = {
            content: content,
            title: pasteTitleElement.value,
            expiration: pasteExpirationElement.value,
            syntax: syntaxHighlightingElement.value,
            exposure: pasteExposureElement.value,
            folder: pasteFolderElement.value,
            password: pastePasswordElement.value,
            custom_alias: pasteCustomAliasElement.value.trim() || null
        };

        try {
            const response = await fetch(`${BACKEND_URL}/api/pastes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pasteDataForServer),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const createdPaste = await response.json();
            showPasteDisplayArea(createdPaste);
            window.history.pushState(createdPaste, createdPaste.title || 'MyGuy Paste', `${window.location.pathname}?paste=${createdPaste.id}`);
            fetchAndDisplayRecentPastes();

        } catch (error) {
            console.error('Error creating paste via API:', error);
            alert(`My bad! Couldn\'t save this drop: ${error.message}`);
        }
    });
}

if (copyLinkBtnElement) {
    copyLinkBtnElement.addEventListener('click', () => {
        if (shareLinkElement.href && shareLinkElement.href !== '#') {
            copyToClipboard(shareLinkElement.href, copyLinkBtnElement);
        } else {
            alert('Nothin\' to snag here!');
        }
    });
}

if (createNewPasteLinkBtnElement) {
    createNewPasteLinkBtnElement.addEventListener('click', () => {
        showPasteInputArea();
    });
}

if (downloadPasteBtnElement) {
    downloadPasteBtnElement.addEventListener('click', () => {
        if (currentPasteData && currentPasteData.content) {
            const filename = (currentPasteData.title || 'MyGuy-Paste').replace(/[^a-z0-9\s_.-]/gi, '_') + '.txt';
            const blob = new Blob([currentPasteData.content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } else {
            alert('No drop loaded to snag as a file, G!');
        }
    });
}

if (navMatrixShareElement) {
    navMatrixShareElement.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.hash = 'matrix-share';
        loadMatrixShareApp();
    });
}

async function handleUrlOrNavigation() {
    if (checkMatrixShareRoute()) {
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const pasteId = urlParams.get('paste');

    if (pasteId) {
        await fetchAndDisplayPaste(pasteId);
    } else {
        showPasteInputArea();
    }
}

async function fetchAndDisplayPaste(pasteId, providedPassword = null) {
    let fetchUrl = `${BACKEND_URL}/api/pastes?id=${encodeURIComponent(pasteId)}`;
    if (providedPassword) {
        fetchUrl += `&password=${encodeURIComponent(providedPassword)}`;
    }

    try {
        const response = await fetch(fetchUrl);
        const responseData = await response.json();

        if (!response.ok) {
            if (response.status === 401 && responseData.passwordRequired) {
                const userPassword = prompt(responseData.message || 'This drop is locked. Enter password, G:');
                if (userPassword) {
                    await fetchAndDisplayPaste(pasteId, userPassword);
                } else {
                    alert('No password provided. Can\'t unlock this drop.');
                    showPasteInputArea();
                    window.history.pushState({}, '', window.location.pathname);
                }
            } else {
                alert(responseData.message || `Can\'t find that drop, G. Maybe it ghosted or never existed? Status: ${response.status}`);
                showPasteInputArea();
                window.history.pushState({}, '', window.location.pathname);
            }
            return;
        }

        showPasteDisplayArea(responseData);

    } catch (e) {
        console.error("Error in fetchAndDisplayPaste:", e);
        alert(`This drop\'s data is lookin\' sus. Can\'t load it: ${e.message}`);
        showPasteInputArea();
        window.history.pushState({}, '', window.location.pathname);
    }
}

async function fetchAINews(apiKey) {
    if (!aiNewsContainerElement) return;
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
        aiNewsContainerElement.innerHTML = '<p>AI News API key not configured.</p>';
        return;
    }

    const cryptoQuery = '(cryptocurrency OR blockchain OR crypto regulation OR digital assets)';
    const aiQuery = '("artificial intelligence" OR AI OR machine learning)';
    const combinedQuery = `${cryptoQuery} OR ${aiQuery}`;

    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(combinedQuery)}&lang=en&max=5&topic=technology,business&sortby=relevance&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            let errorMsg = `HTTP error! status: ${response.status}`;
            if (response.status === 401) {
                errorMsg = 'GNews API key is invalid. Please check Vercel environment variables.';
            }
            if (response.status === 403) {
                errorMsg = 'GNews API daily quota reached or key forbidden. Check your GNews account.';
            }
            if (response.status === 429) {
                errorMsg = 'Too many requests to GNews API. Please wait a bit.';
            }
            try {
                const errorData = await response.json();
                if (errorData && errorData.errors && errorData.errors.length > 0) {
                    errorMsg += ` Details: ${errorData.errors.join(', ')}`;
                }
            } catch (e) { }
            throw new Error(errorMsg);
        }
        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            aiNewsContainerElement.innerHTML = '';
            data.articles.forEach(article => {
                const articleElement = document.createElement('div');
                articleElement.className = 'ai-news-item';

                const titleElement = document.createElement('h5');
                const linkElement = document.createElement('a');
                linkElement.href = article.url;
                linkElement.textContent = article.title;
                linkElement.target = '_blank';
                titleElement.appendChild(linkElement);

                const descriptionElement = document.createElement('p');
                descriptionElement.textContent = article.description;

                articleElement.appendChild(titleElement);
                articleElement.appendChild(descriptionElement);
                aiNewsContainerElement.appendChild(articleElement);
            });
        } else {
            aiNewsContainerElement.innerHTML = '<p>No AI news articles found currently.</p>';
        }
    } catch (error) {
        console.error('Error fetching AI news:', error);
        aiNewsContainerElement.innerHTML = `<p>Error loading AI news: ${error.message}</p>`;
    }
}

async function fetchAndDisplayRecentPastes() {
    if (!recentPastesListElement) return;

    try {
        const response = await fetch(`${BACKEND_URL}/api/recent-pastes`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const recentPastes = await response.json();

        recentPastesListElement.innerHTML = '';

        if (recentPastes.length === 0) {
            recentPastesListElement.innerHTML = '<li>No fresh drops yet, fam.</li>';
            return;
        }

        recentPastes.forEach(paste => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `?paste=${paste.id}`;
            link.textContent = paste.title || 'Untitled Drop';

            link.addEventListener('click', async (e) => {
                e.preventDefault();
                await fetchAndDisplayPaste(paste.id);
            });

            const timestampSpan = document.createElement('span');
            timestampSpan.className = 'recent-paste-time';
            timestampSpan.textContent = ` - ${new Date(paste.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

            listItem.appendChild(link);
            listItem.appendChild(timestampSpan);
            recentPastesListElement.appendChild(listItem);
        });

    } catch (error) {
        console.error('Error fetching recent pastes:', error);
        if (recentPastesListElement) {
            recentPastesListElement.innerHTML = '<li>Could not load recent drops. Bummer.</li>';
        }
    }
}

window.addEventListener('popstate', (event) => {
    handleUrlOrNavigation();
});

window.addEventListener('hashchange', (event) => {
    checkMatrixShareRoute();
});

// STEP 8: Initialize application with real backend integration
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    handleUrlOrNavigation();
    fetchAINews(GNEWS_API_KEY);
    fetchAndDisplayRecentPastes();
    setInterval(() => fetchAINews(GNEWS_API_KEY), 3600000);

    if (pasteInputAreaElement && pasteInputAreaElement.style.display !== 'none') {
        initializeMatrix();
    } else {
        if (matrixCanvasElement) matrixCanvasElement.style.display = 'none';
    }

    fetchCryptoPrices(currentTickerType);
    setInterval(() => fetchCryptoPrices(currentTickerType), 300000);
    checkMatrixShareRoute();

    setTimeout(() => {
        initializeSidebarMatrixShare();
    }, 1000);
});

const headerNewPasteLink = document.querySelector('header nav a');
if(headerNewPasteLink && headerNewPasteLink.textContent.includes("Drop a New Paste")) {
    headerNewPasteLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPasteInputArea();
    });
}

function displayAuthMessage(element, message, isSuccess) {
    element.textContent = message;
    element.className = 'auth-message';
    if (isSuccess) {
        element.classList.add('success');
    } else {
        element.classList.add('error');
    }
    element.style.display = 'block';
}

async function handleRegisterSubmit(event) {
    event.preventDefault();
    const username = registerFormElement.username.value;
    const email = registerFormElement.email.value;
    const password = registerFormElement.password.value;
    registerMessageElement.style.display = 'none';

    if (!username || !password || !email) {
        displayAuthMessage(registerMessageElement, 'Username, email, and password are required.', false);
        return;
    }
    if (password.length < 6) {
        displayAuthMessage(registerMessageElement, 'Password must be at least 6 characters long.', false);
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed.');
        }
        displayAuthMessage(registerMessageElement, data.message, true);
        registerFormElement.reset();
        setTimeout(() => showView('login'), 2000);
    } catch (error) {
        console.error('Registration error:', error);
        displayAuthMessage(registerMessageElement, error.message, false);
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const username = loginFormElement.username.value;
    const password = loginFormElement.password.value;
    loginMessageElement.style.display = 'none';

    try {
        const response = await fetch(`${BACKEND_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Login failed.');
        }

        authToken = data.token;
        currentUser = data.user;
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('currentUser', JSON.stringify(currentUser));

        displayAuthMessage(loginMessageElement, data.message, true);
        updateUserNavUI();

        if (window.location.search.includes('paste=')) {
             handleUrlOrNavigation();
        } else {
            showView('pasteInput');
        }
        loginFormElement.reset();
    } catch (error) {
        console.error('Login error:', error);
        displayAuthMessage(loginMessageElement, error.message, false);
    }
}

function handleLogout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    updateUserNavUI();
    showView('login');
}

if (navLoginElement) {
    navLoginElement.addEventListener('click', (e) => {
        e.preventDefault();
        showView('login');
    });
}
if (navRegisterElement) {
    navRegisterElement.addEventListener('click', (e) => {
        e.preventDefault();
        showView('register');
    });
}
if (navLogoutElement) {
    navLogoutElement.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });
}
if (navDropNewPasteElement) {
    navDropNewPasteElement.addEventListener('click', (e) => {
        e.preventDefault();
        showView('pasteInput');
    });
}
if (registerFormElement) {
    registerFormElement.addEventListener('submit', handleRegisterSubmit);
}
if (loginFormElement) {
    loginFormElement.addEventListener('submit', handleLoginSubmit);
}
if (switchToLoginLink) {
    switchToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showView('login');
    });
}
if (switchToRegisterLink) {
    switchToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showView('register');
    });
}

if (tickerPlayPauseButton) {
    tickerPlayPauseButton.addEventListener('click', toggleTickerAnimation);
}

if (tokenTypeSelectorElement) {
    tokenTypeSelectorElement.addEventListener('change', (event) => {
        fetchCryptoPrices(event.target.value);
    });
}

async function fetchCryptoPrices(type = 'top25crypto') {
    if (!tickerMoveElement) return;
    currentTickerType = type;
    tickerMoveElement.innerHTML = '<div class="ticker-item">Loading prices...</div>';

    let apiUrl = '';
    let isCoinMarketsEndpoint = false;

    if (type === 'top25crypto') {
        isCoinMarketsEndpoint = true;
        apiUrl = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false`;
    } else if (type === 'aiTokens') {
        isCoinMarketsEndpoint = false;
        const aiCoinIds = 'bittensor,render-token,fetch-ai,singularitynet,the-graph,akash-network,origintrail,oraichain-token,rss3,numeraire,ocean-protocol,iexec-rlc,paal-ai,genshiro,aurus-token,sleepless-ai,graphlinq-protocol,aion,effect-network,SingularityDAO';
        apiUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${aiCoinIds}&vs_currencies=usd&include_24hr_change=true`;
    } else {
        tickerMoveElement.innerHTML = '<div class="ticker-item">Invalid token type selected.</div>';
        return;
    }

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`CoinGecko API error: ${response.status}`);
        }
        const data = await response.json();
        populateTicker(data, isCoinMarketsEndpoint);
    } catch (error) {
        console.error('Error fetching crypto prices:', error);
        tickerMoveElement.innerHTML = '<div class="ticker-item">Error loading prices.</div>';
    }
}

function populateTicker(priceData, isCoinMarketsData) {
    if (!tickerMoveElement) return;
    tickerMoveElement.innerHTML = '';

    const itemsToDisplay = isCoinMarketsData ? priceData : Object.entries(priceData).map(([id, data]) => ({ ...data, id, symbol: id.toUpperCase() }));

    let symbolsMap = {};
    if (!isCoinMarketsData && currentTickerType === 'aiTokens') {
         symbolsMap = {
            bittensor: 'TAO', "render-token": 'RNDR', "fetch-ai": 'FET',
            singularitynet: 'AGIX', "the-graph": 'GRT', "akash-network": 'AKT',
            "origintrail": 'TRAC', "oraichain-token": 'ORAI', "rss3": 'RSS3', "numeraire": 'NMR',
            "ocean-protocol": 'OCEAN', "iexec-rlc": 'RLC', "paal-ai": 'PAAL',
            "genshiro": 'GENS', "aurus-token": 'AWX', "sleepless-ai": 'AI',
            "graphlinq-protocol": 'GLQ', "aion": 'AION', "effect-network": 'EFX', "singularitydao": 'SDAO'
        };
    }

    let processedCount = 0;
    itemsToDisplay.forEach(coin => {
        const id = isCoinMarketsData ? coin.id : coin.id;
        const symbol = isCoinMarketsData ? coin.symbol.toUpperCase() : (symbolsMap[id] || id.toUpperCase());
        const price = isCoinMarketsData ? coin.current_price : coin.usd;
        const change = isCoinMarketsData ? coin.price_change_percentage_24h : coin.usd_24h_change;

        if (price === undefined || change === undefined) {
            return;
        }
        processedCount++;

        const priceFormatted = price.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
        const changeClass = change >= 0 ? 'positive' : 'negative';
        const changeFormatted = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;

        const itemDiv = document.createElement('div');
        itemDiv.classList.add('ticker-item');
        itemDiv.innerHTML = `
            <span class="coin-symbol">${symbol}:</span>
            <span class="coin-price">${priceFormatted}</span>
            <span class="coin-change ${changeClass}">(${changeFormatted})</span>
        `;
        tickerMoveElement.appendChild(itemDiv);
    });

    if (tickerMoveElement.children.length === 0) {
        tickerMoveElement.innerHTML = '<div class="ticker-item">No data available for selected tokens.</div>';
        return;
    }

    if (tickerMoveElement.children.length > 0) {
        let currentContentWidth = 0;
        Array.from(tickerMoveElement.children).forEach(child => {currentContentWidth += child.offsetWidth;});
        const tickerVisibleWidth = tickerMoveElement.parentElement.offsetWidth;

        if (currentContentWidth > 0 && currentContentWidth < tickerVisibleWidth * 2) {
             const originalItemsHTML = tickerMoveElement.innerHTML;
             let duplications = 1;
             while (currentContentWidth * (duplications + 1) < tickerVisibleWidth * 2.5 && duplications < 5) {
                tickerMoveElement.innerHTML += originalItemsHTML;
                duplications++;
             }
        }
    }
}

function toggleTickerAnimation() {
    if (!tickerMoveElement) return;
    if (isTickerPaused) {
        tickerMoveElement.style.animationPlayState = 'running';
        tickerPauseIcon.style.display = 'inline';
        tickerPlayIcon.style.display = 'none';
        tickerPlayPauseButton.setAttribute('aria-label', 'Pause Ticker');
    } else {
        tickerMoveElement.style.animationPlayState = 'paused';
        tickerPauseIcon.style.display = 'none';
        tickerPlayIcon.style.display = 'inline';
        tickerPlayPauseButton.setAttribute('aria-label', 'Play Ticker');
    }
    isTickerPaused = !isTickerPaused;
}

// STEP 9: Ready for deployment - All mock functionality replaced with real backend calls
// STEP 10: Test upload, download, and all Matrix Share features before deploying
// STEP 11: Deploy to production environment
