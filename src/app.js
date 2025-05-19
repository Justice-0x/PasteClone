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
const copyLinkBtnElement = document.getElementById('copyLinkBtn');
const createNewPasteLinkBtnElement = document.getElementById('createNewPasteLinkBtn');
const recentPastesListElement = document.getElementById('recentPastesList');
const aiNewsContainerElement = document.getElementById('aiNewsContainer');

const GNEWS_API_KEY = 'af40488155eaf6efee4246d45bc58de4'; // <<< REPLACE WITH YOUR ACTUAL API KEY

// Generate a random ID for pastes
function generatePasteId() {
    return Math.random().toString(36).substring(2, 10);
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
        alert('Failed to copy to clipboard');
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

    window.history.pushState({}, '', window.location.pathname); // Clear URL params
}

function showPasteDisplayArea(pasteData) {
    pasteInputAreaElement.style.display = 'none';
    pasteDisplayAreaElement.style.display = 'block';

    displayTitleElement.textContent = pasteData.title || 'Untitled Paste';
    
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
}

function loadRecentPastes() {
    if (!recentPastesListElement) return;
    recentPastesListElement.innerHTML = ''; // Clear existing
    const keys = Object.keys(localStorage);
    const pasteKeys = keys.filter(key => key.startsWith('paste_')).reverse().slice(0, 5); // Get last 5

    pasteKeys.forEach(key => {
        try {
            const pasteData = JSON.parse(localStorage.getItem(key));
            if (pasteData && pasteData.id && pasteData.title) {
                const listItem = document.createElement('li');
                const link = document.createElement('a');
                link.href = `${window.location.pathname}?paste=${pasteData.id}`;
                link.textContent = pasteData.title || 'Untitled Paste';
                listItem.appendChild(link);
                recentPastesListElement.appendChild(listItem);
            }
        } catch (e) {
            console.error("Error parsing recent paste from localStorage", e);
        }
    });
}

// Event Listeners
if (createPasteBtnElement) {
    createPasteBtnElement.addEventListener('click', async () => {
        const content = pasteInputElement.value;
        if (!content.trim()) {
            alert('Please enter some text to paste.');
            return;
        }

        const pasteId = generatePasteId();
        const pasteData = {
            id: pasteId,
            content: content,
            title: pasteTitleElement.value || 'Untitled',
            expiration: pasteExpirationElement.value,
            syntax: syntaxHighlightingElement.value,
            exposure: pasteExposureElement.value,
            folder: pasteFolderElement.value,
            // password: pastePasswordElement.value, // Implement secure handling for passwords
            // burnAfterRead: burnAfterReadElement.checked,
            timestamp: new Date().toISOString()
        };

        try {
            localStorage.setItem(`paste_${pasteId}`, JSON.stringify(pasteData));
            showPasteDisplayArea(pasteData);
            loadRecentPastes(); // Refresh recent pastes list
            // Update URL to reflect the paste ID without causing a page reload
            window.history.pushState(pasteData, pasteData.title || 'Yankee Paste', `${window.location.pathname}?paste=${pasteId}`);
        } catch (error) {
            console.error('Error saving paste:', error);
            alert('Error saving paste. LocalStorage might be full or unavailable.');
        }
    });
}

if (copyLinkBtnElement) {
    copyLinkBtnElement.addEventListener('click', () => {
        if (shareLinkElement.href && shareLinkElement.href !== '#') {
            copyToClipboard(shareLinkElement.href, copyLinkBtnElement);
        } else {
            alert('No link to copy!');
        }
    });
}

if (createNewPasteLinkBtnElement) {
    createNewPasteLinkBtnElement.addEventListener('click', () => {
        showPasteInputArea();
        loadRecentPastes();
    });
}

// Handle direct URL access to a paste and back/forward navigation
function handleUrlOrNavigation() {
    const urlParams = new URLSearchParams(window.location.search);
    const pasteId = urlParams.get('paste');

    if (pasteId) {
        const pasteDataString = localStorage.getItem(`paste_${pasteId}`);
        if (pasteDataString) {
            try {
                const pasteData = JSON.parse(pasteDataString);
                showPasteDisplayArea(pasteData);
            } catch (e) {
                console.error("Error parsing paste data from localStorage", e);
                alert("Could not load paste. Data might be corrupted.");
                showPasteInputArea();
            }
        } else {
            alert('Paste not found or expired.');
            showPasteInputArea(); // Show input area if paste not found
        }
    } else {
        showPasteInputArea();
    }
    loadRecentPastes();
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

// Listen for popstate events (back/forward browser buttons)
window.addEventListener('popstate', (event) => {
    handleUrlOrNavigation();
});

// Initial page load
document.addEventListener('DOMContentLoaded', () => {
    handleUrlOrNavigation();
    fetchAINews(GNEWS_API_KEY);
    setInterval(() => fetchAINews(GNEWS_API_KEY), 3600000); // Refresh every hour
});

// Also update the header link to act like "create new paste"
const headerNewPasteLink = document.querySelector('header nav a');
if(headerNewPasteLink && headerNewPasteLink.textContent.includes("Create New Paste")) {
    headerNewPasteLink.addEventListener('click', (e) => {
        e.preventDefault();
        showPasteInputArea();
        loadRecentPastes();
    });
}