import Prism from 'prismjs';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
// Import specific languages you want to support with Prism
// Example: import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css'; // Or your preferred theme
import { Clerk } from '@clerk/clerk-js';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

const clerk = new Clerk('pk_test_c2VO...'); // <-- Replace with your actual Clerk Frontend API key
clerk.load();

function initializeAppUI() {
  // Re-select DOM elements to ensure fresh references
  const themeSelectorElement = document.getElementById('themeSelector');
  const pasteInputAreaElement = document.querySelector('.paste-input-area');
  const matrixCanvasElement = document.getElementById('matrixCanvas');
  const createPasteBtnElement = document.getElementById('createPasteBtn');
  const navDropNewPasteElement = document.getElementById('navDropNewPaste');
  const openFileUploadBtn = document.getElementById('openFileUploadBtn');
  const headerUpgradeBtn = document.getElementById('headerUpgradeBtn');
  const fileUploadModal = document.getElementById('fileUploadModal');
  const tickerMoveElement = document.querySelector('.ticker-move');
  const tickerPlayPauseButton = document.getElementById('tickerPlayPause');
  const tickerPauseIcon = document.getElementById('tickerPauseIcon');
  const tickerPlayIcon = document.getElementById('tickerPlayIcon');
  const tokenTypeSelectorElement = document.getElementById('tokenTypeSelector');

  // Theme selector
  if (themeSelectorElement) {
    themeSelectorElement.onchange = null;
    themeSelectorElement.addEventListener('change', (event) => {
      applyTheme(event.target.value);
    });
  }
  loadTheme();

  // Matrix effect
  if (pasteInputAreaElement && matrixCanvasElement) {
    initializeMatrix();
    startMatrix();
  }

  // Crypto ticker
  if (tickerMoveElement) {
    fetchCryptoPrices(currentTickerType);
    setInterval(() => fetchCryptoPrices(currentTickerType), 300000);
  }
  if (tokenTypeSelectorElement) {
    tokenTypeSelectorElement.onchange = null;
    tokenTypeSelectorElement.addEventListener('change', (event) => {
      fetchCryptoPrices(event.target.value);
    });
  }
  if (tickerPlayPauseButton) {
    tickerPlayPauseButton.onclick = null;
    tickerPlayPauseButton.addEventListener('click', toggleTickerAnimation);
  }

  // Paste creation and navigation
  if (createPasteBtnElement) {
    createPasteBtnElement.onclick = null;
    createPasteBtnElement.addEventListener('click', (e) => {
      e.preventDefault();
      // Add your paste creation logic here
    });
  }
  if (navDropNewPasteElement) {
    navDropNewPasteElement.onclick = null;
    navDropNewPasteElement.addEventListener('click', (e) => {
      e.preventDefault();
      showPasteInputArea();
    });
  }
  if (openFileUploadBtn && fileUploadModal) {
    openFileUploadBtn.onclick = null;
    openFileUploadBtn.addEventListener('click', () => {
      fileUploadModal.style.display = 'block';
      startFileMatrix();
    });
  }
  if (headerUpgradeBtn) {
    headerUpgradeBtn.onclick = null;
    headerUpgradeBtn.addEventListener('click', async () => {
      const res = await fetch('/api/create-checkout-session', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location = data.url;
      } else {
        alert('Could not start checkout.');
      }
    });
  }
}

clerk.addListener('user', (user) => {
  const clerkAuthContainer = document.getElementById('clerkAuthContainer');
  const mainAppContainer = document.querySelector('.paste-container');
  const sidebar = document.querySelector('.sidebar');
  if (user) {
    if (clerkAuthContainer) clerkAuthContainer.style.display = 'none';
    if (mainAppContainer) mainAppContainer.style.display = '';
    if (sidebar) sidebar.style.display = '';
    initializeAppUI();
  } else {
    if (clerkAuthContainer) clerkAuthContainer.style.display = '';
    if (mainAppContainer) mainAppContainer.style.display = 'none';
    if (sidebar) sidebar.style.display = 'none';
  }
});

// DOM Elements
const pasteInputElement = document.getElementById('pasteInput');
const syntaxHighlightingElement = document.getElementById('syntaxHighlighting');
const pasteExpirationElement = document.getElementById('pasteExpiration');
const pasteExposureElement = document.getElementById('pasteExposure');
const pasteFolderElement = document.getElementById('pasteFolder');
const pastePasswordElement = document.getElementById('pastePassword');
const burnAfterReadElement = document.getElementById('burnAfterRead');
const pasteTitleElement = document.getElementById('pasteTitle');
const pasteCustomAliasElement = document.getElementById('pasteCustomAlias');

const pasteDisplayAreaElement = document.querySelector('.paste-display-area');

const displayTitleElement = document.getElementById('displayTitle');
const pasteOutputElement = document.getElementById('pasteOutput');
const shareLinkElement = document.getElementById('shareLink');
const rawLinkElement = document.getElementById('rawLink');
const copyLinkBtnElement = document.getElementById('copyLinkBtn');
const createNewPasteLinkBtnElement = document.getElementById('createNewPasteLinkBtn');
const recentPastesListElement = document.getElementById('recentPastesList');
const aiNewsContainerElement = document.getElementById('aiNewsContainer');

// Auth DOM Elements
const navLoginElement = document.getElementById('navLogin');
const navRegisterElement = document.getElementById('navRegister');
const navLogoutElement = document.getElementById('navLogout');
const userStatusElement = document.getElementById('userStatus');

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
let currentTickerType = 'top25crypto'; // Default to top 25 crypto

const GNEWS_API_KEY = process.env.GNEWS_API_KEY; // USER PROVIDED API KEY

let currentPasteData = null; // To store the currently displayed paste data for download
let currentUser = null; // To store logged-in user data { id, username, role }
let authToken = null; // To store JWT

// Matrix Effect Variables
let matrixCtx;
let matrixAnimationId = null;
const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";
const matrixFontSize = 12;
let matrixColumns;
let matrixDrops;

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

    matrixCtx.fillStyle = '#0F0'; // Green characters
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
    if (matrixCanvasElement.width !== matrixCanvasElement.offsetWidth || matrixCanvasElement.height !== matrixCanvasElement.offsetHeight) {
        // Responsive canvas resize if container size changed
        matrixCanvasElement.width = matrixCanvasElement.offsetWidth;
        matrixCanvasElement.height = matrixCanvasElement.offsetHeight;
        matrixColumns = Math.floor(matrixCanvasElement.width / matrixFontSize);
        matrixDrops = [];
        for (let x = 0; x < matrixColumns; x++) {
            matrixDrops[x] = 1 + Math.floor(Math.random() * (matrixCanvasElement.height / matrixFontSize));
        }
    }
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
  if (matrixCanvasElement && matrixCtx) {
    // Optionally clear the canvas when stopping
    // matrixCtx.clearRect(0, 0, matrixCanvasElement.width, matrixCanvasElement.height);
    matrixCanvasElement.style.display = 'none';
  }
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
    const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    applyTheme(savedTheme);
}

if (themeSelectorElement) {
    themeSelectorElement.addEventListener('change', (event) => {
        applyTheme(event.target.value);
    });
}

// Copy text to clipboard
function copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = buttonElement.textContent;
        buttonElement.textContent = 'Copied!';
        // Optional: Change button style on copy
        setTimeout(() => {
            buttonElement.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
        alert('Whoops! Couldn\'t snag that link.');
    });
}

// Function to parse JWT and get payload
function parseJwt(token) {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
}

// Function to update UI based on login status
function updateUserNavUI() {
    if (authToken && currentUser) {
        navLoginElement.style.display = 'none';
        navRegisterElement.style.display = 'none';
        userStatusElement.textContent = `Yo, ${currentUser.username}!`;
        userStatusElement.style.display = 'inline';
        navLogoutElement.style.display = 'inline';
        // Potentially enable/disable other features based on login
    } else {
        navLoginElement.style.display = 'inline';
        navRegisterElement.style.display = 'inline';
        userStatusElement.style.display = 'none';
        userStatusElement.textContent = '';
        navLogoutElement.style.display = 'none';
    }
}

// Function to control visibility of main content areas
function showView(viewName) {
    // Hide all main views first
    pasteInputAreaElement.style.display = 'none';
    pasteDisplayAreaElement.style.display = 'none';
    authFormsContainerElement.style.display = 'none';
    registerFormContainerElement.style.display = 'none';
    loginFormContainerElement.style.display = 'none';
    stopMatrix(); // Stop matrix if it's running

    if (viewName === 'pasteInput') {
        pasteInputAreaElement.style.display = 'block';
        startMatrix(); // Start matrix for paste input view
    } else if (viewName === 'pasteDisplay') {
        pasteDisplayAreaElement.style.display = 'block';
    } else if (viewName === 'login') {
        authFormsContainerElement.style.display = 'block';
        loginFormContainerElement.style.display = 'block';
    } else if (viewName === 'register') {
        authFormsContainerElement.style.display = 'block';
        registerFormContainerElement.style.display = 'block';
    }
    // Clear URL params if not viewing a specific paste
    if (viewName !== 'pasteDisplay' && !window.location.search.includes('paste=')) {
        window.history.pushState({}, '', window.location.pathname);
    }
}

// Overwrite existing showPasteInputArea and showPasteDisplayArea to use showView
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
            const response = await fetch('/api/pastes', {
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
            fetchAndDisplayRecentPastes(); // Refresh recent pastes list
        
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

// Handle direct URL access to a paste and back/forward navigation
async function handleUrlOrNavigation() {
    const urlParams = new URLSearchParams(window.location.search);
    const pasteId = urlParams.get('paste');

    if (pasteId) {
        await fetchAndDisplayPaste(pasteId);       
    } else {
        showPasteInputArea();
    }
}

// New function to fetch and display a single paste, handling password protection
async function fetchAndDisplayPaste(pasteId, providedPassword = null) {
    let fetchUrl = `/api/pastes?id=${encodeURIComponent(pasteId)}`;
    if (providedPassword) {
        fetchUrl += `&password=${encodeURIComponent(providedPassword)}`;
    }

    try {
        const response = await fetch(fetchUrl);
        const responseData = await response.json(); // Try to parse JSON regardless of ok status for error messages

        if (!response.ok) {
            if (response.status === 401 && responseData.passwordRequired) {
                const userPassword = prompt(responseData.message || 'This drop is locked. Enter password, G:');
                if (userPassword) {
                    // User entered a password, try fetching again with it
                    await fetchAndDisplayPaste(pasteId, userPassword);
                } else {
                    // User cancelled prompt or entered nothing
                    alert('No password provided. Can\'t unlock this drop.');
                    showPasteInputArea(); // Go back to input area
                    window.history.pushState({}, '', window.location.pathname); // Clear URL params
                }
            } else {
                // Other errors (404, 500, or 401 without passwordRequired flag)
                alert(responseData.message || `Can\'t find that drop, G. Maybe it ghosted or never existed? Status: ${response.status}`);
                showPasteInputArea();
                window.history.pushState({}, '', window.location.pathname); // Clear URL params
            }
            return; // Stop further processing if not ok
        }
        
        // If response is OK (200)
        showPasteDisplayArea(responseData); // responseData is the pasteData here
        // The showPasteDisplayArea function will now handle updating the URL with alias or ID
        // window.history.pushState(responseData, responseData.title || 'MyGuy Paste', `${window.location.pathname}?paste=${pasteId}`); // This line is now handled by showPasteDisplayArea

    } catch (e) {
        console.error("Error in fetchAndDisplayPaste:", e);
        alert(`This drop\'s data is lookin\' sus. Can\'t load it: ${e.message}`);
        showPasteInputArea();
        window.history.pushState({}, '', window.location.pathname); // Clear URL params
    }
}

async function fetchAINews(apiKey) {
    if (!aiNewsContainerElement) return;
    if (!apiKey || apiKey === 'YOUR_API_KEY') {
        aiNewsContainerElement.innerHTML = '<p>AI News API key not configured.</p>';
        return;
    }

    // Refined query: Focus on broader crypto terms and ensure AI is distinct.
    const cryptoQuery = '(cryptocurrency OR blockchain OR crypto regulation OR digital assets)';
    const aiQuery = '("artificial intelligence" OR AI OR machine learning)';
    const combinedQuery = `${cryptoQuery} OR ${aiQuery}`;
    
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(combinedQuery)}&lang=en&max=5&topic=technology,business&sortby=relevance&apikey=${apiKey}`;
    console.log('Fetching GNews with URL:', url); // Log the exact URL

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
            // Attempt to get more details from the API response body if available
            try {
                const errorData = await response.json();
                if (errorData && errorData.errors && errorData.errors.length > 0) {
                    errorMsg += ` Details: ${errorData.errors.join(', ')}`;
                }
            } catch (e) { /* Ignore if error response is not JSON */ }
            throw new Error(errorMsg);
        }
        const data = await response.json();

        if (data.articles && data.articles.length > 0) {
            aiNewsContainerElement.innerHTML = ''; // Clear loading/previous message
            data.articles.forEach(article => {
                const articleElement = document.createElement('div');
                articleElement.className = 'ai-news-item';

                const titleElement = document.createElement('h5');
                const linkElement = document.createElement('a');
                linkElement.href = article.url;
                linkElement.textContent = article.title;
                linkElement.target = '_blank'; // Open in new tab
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

// Function to fetch and display recent pastes
async function fetchAndDisplayRecentPastes() {
    if (!recentPastesListElement) return;

    try {
        const response = await fetch('/api/recent-pastes');
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const recentPastes = await response.json();

        recentPastesListElement.innerHTML = ''; // Clear existing list

        if (recentPastes.length === 0) {
            recentPastesListElement.innerHTML = '<li>No fresh drops yet, fam.</li>';
            return;
        }

        recentPastes.forEach(paste => {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `?paste=${paste.id}`; // Relative link for SPA navigation
            link.textContent = paste.title || 'Untitled Drop';
            
            // Handle click to use SPA navigation for recent pastes
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                // Manually fetch and display this paste, and update history
                // No password prompt needed here as recent pastes are public
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

// Listen for popstate events (back/forward browser buttons)
window.addEventListener('popstate', (event) => {
    handleUrlOrNavigation();
});

// Initial page load
document.addEventListener('DOMContentLoaded', () => {
    loadTheme(); // Load theme first
    handleUrlOrNavigation();
    fetchAINews(GNEWS_API_KEY);
    fetchAndDisplayRecentPastes(); // Fetch recent pastes on load
    setInterval(() => fetchAINews(GNEWS_API_KEY), 3600000); // Refresh every hour
    // Initialize matrix here for the first load if input area is shown by default
    if (pasteInputAreaElement && pasteInputAreaElement.style.display !== 'none') {
      initializeMatrix(); // Initialize once
      // startMatrix(); // Don't auto-start here, showPasteInputArea will handle it
    } else {
      if (matrixCanvasElement) matrixCanvasElement.style.display = 'none';
    }
    fetchCryptoPrices(currentTickerType); // Fetch initial crypto prices based on default type
    setInterval(() => fetchCryptoPrices(currentTickerType), 300000); // Refresh prices for current type
});

// Also update the header link to act like "create new paste"
const headerNewPasteLink = document.querySelector('header nav a');
if(headerNewPasteLink && headerNewPasteLink.textContent.includes("Drop a New Paste")) {
    headerNewPasteLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPasteInputArea();
    });
}

// Function to display messages in auth forms
function displayAuthMessage(element, message, isSuccess) {
    element.textContent = message;
    element.className = 'auth-message'; // Reset classes
    if (isSuccess) {
        element.classList.add('success');
    } else {
        element.classList.add('error');
    }
    element.style.display = 'block';
}

// Event Handlers for Auth
async function handleRegisterSubmit(event) {
    event.preventDefault();
    const username = registerFormElement.username.value;
    const email = registerFormElement.email.value;
    const password = registerFormElement.password.value;
    registerMessageElement.style.display = 'none'; // Clear previous messages

    if (!username || !password || !email) {
        displayAuthMessage(registerMessageElement, 'Username, email, and password are required.', false);
        return;
    }
    if (password.length < 6) {
        displayAuthMessage(registerMessageElement, 'Password must be at least 6 characters long.', false);
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed.');
        }
        displayAuthMessage(registerMessageElement, data.message, true);
        // Optionally clear form or switch to login
        registerFormElement.reset();
        setTimeout(() => showView('login'), 2000); // Switch to login after 2s
    } catch (error) {
        console.error('Registration error:', error);
        displayAuthMessage(registerMessageElement, error.message, false);
    }
}

async function handleLoginSubmit(event) {
    event.preventDefault();
    const username = loginFormElement.username.value;
    const password = loginFormElement.password.value;
    loginMessageElement.style.display = 'none'; // Clear previous messages

    try {
        const response = await fetch('/api/login', {
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
        // Decide what view to show after login. If a paste was being viewed, stay there, otherwise go to input.
        if (window.location.search.includes('paste=')) {
             handleUrlOrNavigation(); // Re-evaluate URL to show paste if it was being viewed
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
    showView('login'); // Or 'pasteInput', depending on desired behavior after logout
    // Any other cleanup related to user session
}

// Initial Page Load Logic
function initializeAuth() {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');

    if (storedToken && storedUser) {
        authToken = storedToken;
        try {
            currentUser = JSON.parse(storedUser);
            // Optional: verify token with a backend call here if it could be expired
            // For now, we assume if it exists and parses, it's good for UI purposes
        } catch (e) {
            console.error('Error parsing stored user data:', e);
            // Clear invalid stored data
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            authToken = null;
            currentUser = null;
        }
    }
    updateUserNavUI(); // Update nav based on stored or null auth state
    // Determine initial view based on auth state and URL
    const urlParams = new URLSearchParams(window.location.search);
    const pasteId = urlParams.get('paste');
    if (pasteId) {
        handleUrlOrNavigation(); // This will show paste display or prompt for password
    } else if (currentUser) {
        showView('pasteInput');
    } else {
        showView('login'); // Default to login if not logged in and no specific paste
    }
}

// Add new Auth Event Listeners
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
        showView('pasteInput'); // Or handleUrlOrNavigation if you want to preserve query params
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

// Price Ticker Event Listener
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
        isCoinMarketsEndpoint = false; // Explicitly set for clarity
        const aiCoinIds = 'bittensor,render-token,fetch-ai,singularitynet,the-graph,akash-network,origintrail,oraichain-token,rss3,numeraire,ocean-protocol,iexec-rlc,paal-ai,genshiro,aurus-token,sleepless-ai,graphlinq-protocol,aion,effect-network,SingularityDAO'; // Expanded, verify these IDs from CoinGecko
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
    console.log(`Populating ticker. isCoinMarketsData: ${isCoinMarketsData}, Items received: ${itemsToDisplay.length}`);

    let symbolsMap = {}; // This will only be used if !isCoinMarketsData (i.e., for aiTokens)
    if (!isCoinMarketsData && currentTickerType === 'aiTokens') {
         symbolsMap = { // VERIFY ALL THESE IDs and SYMBOLS from CoinGecko
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
        const id = isCoinMarketsData ? coin.id : coin.id; // For AI tokens, coin.id comes from the map structure
        const symbol = isCoinMarketsData ? coin.symbol.toUpperCase() : (symbolsMap[id] || id.toUpperCase());
        const price = isCoinMarketsData ? coin.current_price : coin.usd;
        const change = isCoinMarketsData ? coin.price_change_percentage_24h : coin.usd_24h_change;

        if (price === undefined || change === undefined) {
            console.warn(`Skipping ticker item due to incomplete data for ID: ${id}`);
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
    console.log(`Processed ${processedCount} items for the ticker.`);
    
    // Duplicate items for seamless scrolling effect
    if (tickerMoveElement.children.length > 0 ) {
        let currentContentWidth = 0;
        Array.from(tickerMoveElement.children).forEach(child => {currentContentWidth += child.offsetWidth;});
        const tickerVisibleWidth = tickerMoveElement.parentElement.offsetWidth;
        
        if (currentContentWidth > 0 && currentContentWidth < tickerVisibleWidth * 2) { // If content is less than twice the visible width
             const originalItemsHTML = tickerMoveElement.innerHTML;
             let duplications = 1;
             while (currentContentWidth * (duplications + 1) < tickerVisibleWidth * 2.5 && duplications < 5) { // Ensure at least ~2.5x visible width or max 5 dups
                tickerMoveElement.innerHTML += originalItemsHTML;
                duplications++;
             }
             console.log(`Ticker content duplicated ${duplications} time(s). Original width: ${currentContentWidth}, Visible width: ${tickerVisibleWidth}`);
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

// File Upload Modal Logic
const fileUploadModal = document.getElementById('fileUploadModal');
const openFileUploadBtn = document.getElementById('openFileUploadBtn');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const fileList = document.getElementById('fileList');
const uploadBtn = document.getElementById('uploadBtn');
const expirationTime = document.getElementById('expirationTime');
const uploadStatus = document.getElementById('uploadStatus');
const closeModal = document.querySelector('.close');

// Add matrix canvas to file upload modal
let fileMatrixCanvas = document.getElementById('fileMatrixCanvas');
if (!fileMatrixCanvas) {
  fileMatrixCanvas = document.createElement('canvas');
  fileMatrixCanvas.id = 'fileMatrixCanvas';
  fileMatrixCanvas.style.position = 'absolute';
  fileMatrixCanvas.style.top = '0';
  fileMatrixCanvas.style.left = '0';
  fileMatrixCanvas.style.width = '100%';
  fileMatrixCanvas.style.height = '100%';
  fileMatrixCanvas.style.zIndex = '0';
  fileUploadModal.querySelector('.modal-content').prepend(fileMatrixCanvas);
}

let fileMatrixCtx, fileMatrixAnimationId = null, fileMatrixColumns, fileMatrixDrops;
const fileMatrixFontSize = 14;
const fileMatrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}", fileMatrixColor = '#0F0';

function initializeFileMatrix() {
  fileMatrixCtx = fileMatrixCanvas.getContext('2d');
  fileMatrixCanvas.width = fileUploadModal.offsetWidth;
  fileMatrixCanvas.height = fileUploadModal.offsetHeight;
  fileMatrixColumns = Math.floor(fileMatrixCanvas.width / fileMatrixFontSize);
  fileMatrixDrops = [];
  for (let x = 0; x < fileMatrixColumns; x++) fileMatrixDrops[x] = 1;
}
function drawFileMatrix() {
  if (!fileMatrixCtx || fileUploadModal.style.display === 'none') {
    if (fileMatrixAnimationId) cancelAnimationFrame(fileMatrixAnimationId);
    fileMatrixAnimationId = null;
    return;
  }
  fileMatrixCtx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  fileMatrixCtx.fillRect(0, 0, fileMatrixCanvas.width, fileMatrixCanvas.height);
  fileMatrixCtx.fillStyle = fileMatrixColor;
  fileMatrixCtx.font = fileMatrixFontSize + 'px arial';
  for (let i = 0; i < fileMatrixDrops.length; i++) {
    const text = fileMatrixChars.charAt(Math.floor(Math.random() * fileMatrixChars.length));
    fileMatrixCtx.fillText(text, i * fileMatrixFontSize, fileMatrixDrops[i] * fileMatrixFontSize);
    if (fileMatrixDrops[i] * fileMatrixFontSize > fileMatrixCanvas.height && Math.random() > 0.975) fileMatrixDrops[i] = 0;
    fileMatrixDrops[i]++;
  }
  fileMatrixAnimationId = requestAnimationFrame(drawFileMatrix);
}
function startFileMatrix() {
  if (!fileMatrixCtx) initializeFileMatrix();
  fileMatrixCanvas.style.display = 'block';
  if (!fileMatrixAnimationId) fileMatrixAnimationId = requestAnimationFrame(drawFileMatrix);
}
function stopFileMatrix() {
  if (fileMatrixAnimationId) cancelAnimationFrame(fileMatrixAnimationId);
  fileMatrixAnimationId = null;
  fileMatrixCanvas.style.display = 'none';
}

if (openFileUploadBtn) {
  openFileUploadBtn.addEventListener('click', () => {
    fileUploadModal.style.display = 'block';
    startFileMatrix();
  });
}
if (closeModal) {
  closeModal.onclick = function() {
    fileUploadModal.style.display = 'none';
    resetFileUpload();
    stopFileMatrix();
  };
}
window.onclick = function(event) {
  if (event.target == fileUploadModal) {
    fileUploadModal.style.display = 'none';
    resetFileUpload();
    stopFileMatrix();
  }
};

let selectedFiles = [];
function resetFileUpload() {
  selectedFiles = [];
  updateFileList();
  uploadBtn.disabled = true;
  uploadStatus.innerHTML = '';
}
if (selectFilesBtn) {
  selectFilesBtn.addEventListener('click', () => fileInput.click());
}
if (fileInput) {
  fileInput.addEventListener('change', handleFiles);
}
if (dropZone) {
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    handleFiles({ target: { files: e.dataTransfer.files } });
  });
}
function handleFiles(event) {
  const files = Array.from(event.target.files);
  const maxSize = window.isPaidUser ? 10 * 1024 * 1024 * 1024 : 2 * 1024 * 1024 * 1024;
  const validFiles = files.filter(file => {
    if (file.size > maxSize) {
      showUploadStatus(`File ${file.name} exceeds ${window.isPaidUser ? '10GB' : '2GB'} limit`, 'error');
      return false;
    }
    return true;
  });
  selectedFiles = [...selectedFiles, ...validFiles];
  updateFileList();
  uploadBtn.disabled = selectedFiles.length === 0;
}
function updateFileList() {
  fileList.innerHTML = '';
  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
      </div>
      <button onclick="removeFile(${index})" class="remove-btn">×</button>
    `;
    fileList.appendChild(fileItem);
  });
}
window.removeFile = function(index) {
  selectedFiles.splice(index, 1);
  updateFileList();
  uploadBtn.disabled = selectedFiles.length === 0;
};
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
function showUploadStatus(message, type = '') {
  uploadStatus.textContent = message;
  uploadStatus.className = `upload-status ${type}`;
}
if (uploadBtn) {
  uploadBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;
    const formData = new FormData();
    // Only allow one file at a time for now
    formData.append('file', selectedFiles[0]);
    formData.append('expiration', expirationTime.value);
    try {
      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Uploading...';
      const response = await fetch('/api/file/upload', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Upload failed');
      }
      const result = await response.json();
      // Get presigned download link
      const downloadRes = await fetch(`/api/file/download/${encodeURIComponent(result.key)}`);
      const downloadData = await downloadRes.json();
      if (downloadData.url) {
        showUploadStatus(`File uploaded! <a href="${downloadData.url}" target="_blank">Download Link</a>`, 'success');
      } else {
        showUploadStatus('File uploaded, but could not get download link.', 'error');
      }
      setTimeout(() => {
        fileUploadModal.style.display = 'none';
        resetFileUpload();
        stopFileMatrix();
      }, 5000);
    } catch (error) {
      console.error('Upload error:', error);
      showUploadStatus(error.message || 'Failed to upload file', 'error');
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = 'Upload';
    }
  });
}

const upgradeBtn = document.getElementById('upgradeBtn');
if (upgradeBtn) {
  upgradeBtn.addEventListener('click', async () => {
    const res = await fetch('/api/create-checkout-session', { method: 'POST' });
    const data = await res.json();
    if (data.url) {
      window.location = data.url;
    } else {
      alert('Could not start checkout.');
    }
  });
}

// Update DOM element selectors for new header buttons
const headerUpgradeBtn = document.getElementById('headerUpgradeBtn');

if (headerUpgradeBtn) {
  headerUpgradeBtn.addEventListener('click', async () => {
    const res = await fetch('/api/create-checkout-session', { method: 'POST' });
    const data = await res.json();
    if (data.url) {
      window.location = data.url;
    } else {
      alert('Could not start checkout.');
    }
  });
}

// Ensure file upload modal matrix is only a background
if (fileMatrixCanvas) {
  fileMatrixCanvas.style.zIndex = '0';
  // Ensure upload-container and its children are above the canvas
  const uploadContainer = fileUploadModal.querySelector('.upload-container');
  if (uploadContainer) uploadContainer.style.position = 'relative';
}