import Prism from 'prismjs';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
// Import specific languages you want to support with Prism
// Example: import 'prismjs/components/prism-python';
import 'prismjs/themes/prism-tomorrow.css'; // Or your preferred theme

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

const GNEWS_API_KEY = process.env.GNEWS_API_KEY; // USER PROVIDED API KEY

let currentPasteData = null; // To store the currently displayed paste data for download

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

function showPasteInputArea() {
    pasteInputAreaElement.style.display = 'block';
    pasteDisplayAreaElement.style.display = 'none';
    if (pasteInputElement) pasteInputElement.value = '';
    if (pasteTitleElement) pasteTitleElement.value = '';
    // Reset other options to default if needed
    if (pasteExpirationElement) pasteExpirationElement.value = '1d';
    if (syntaxHighlightingElement) syntaxHighlightingElement.value = 'none';
    if (pasteExposureElement) pasteExposureElement.value = 'public';
    if (pastePasswordElement) pastePasswordElement.value = '';
    if (burnAfterReadElement) burnAfterReadElement.checked = false;
    currentPasteData = null; // Clear current paste data when going to input area

    window.history.pushState({}, '', window.location.pathname); // Clear URL params
    startMatrix();
}

function showPasteDisplayArea(pasteData) {
    pasteInputAreaElement.style.display = 'none';
    pasteDisplayAreaElement.style.display = 'block';
    stopMatrix();

    currentPasteData = pasteData; // Store for download functionality

    displayTitleElement.textContent = pasteData.title || 'MyGuy\'s Fresh Drop';
    
    // Clear previous content and classes from pasteOutputElement
    pasteOutputElement.innerHTML = '';
    pasteOutputElement.className = ''; // Clear all previous classes

    const language = pasteData.syntax || 'none';

    if (language === 'markdown') {
        const rawHtml = marked.parse(pasteData.content || '');
        const sanitizedHtml = DOMPurify.sanitize(rawHtml);
        pasteOutputElement.innerHTML = sanitizedHtml;
        // Apply Prism highlighting to any code blocks within the Markdown
        pasteOutputElement.querySelectorAll('pre code').forEach((block) => {
            Prism.highlightElement(block);
        });
    } else {
        // For non-markdown, create pre and code elements for Prism
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
            // For plain text or 'none', no syntax highlighting, but ensure it's wrapped for consistent styling
            preElement.className = 'language-text'; // Or a generic class
        }
    }

    const pasteUrl = `${window.location.origin}${window.location.pathname}?paste=${pasteData.id}`;
    shareLinkElement.href = pasteUrl;
    shareLinkElement.textContent = pasteUrl;

    if (rawLinkElement) {
        rawLinkElement.href = `${pasteUrl}&raw=true`;
    }
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
    let fetchUrl = `/api/pastes?id=${pasteId}`;
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
        // Ensure URL reflects the paste ID, but not the password if it was in query params for fetch
        window.history.pushState(responseData, responseData.title || 'MyGuy Paste', `${window.location.pathname}?paste=${pasteId}`);

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

    const query = 'AI OR "Artificial Intelligence"';
    const url = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=3&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('GNews API key is invalid.');
            }
            if (response.status === 403) {
                throw new Error('GNews API daily quota reached or key forbidden.');
            }
            throw new Error(`HTTP error! status: ${response.status}`);
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
});

// Also update the header link to act like "create new paste"
const headerNewPasteLink = document.querySelector('header nav a');
if(headerNewPasteLink && headerNewPasteLink.textContent.includes("Drop a New Paste")) {
    headerNewPasteLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPasteInputArea();
    });
}