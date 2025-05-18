// Import Prism.js
import 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

// Generate a random ID for pastes
function generatePasteId() {
  return Math.random().toString(36).substring(2, 10);
}

// Copy text to clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    const copyBtn = document.getElementById('copyButton');
    const originalText = copyBtn.textContent;
    
    copyBtn.textContent = 'Copied!';
    copyBtn.style.backgroundColor = '#218838';
    
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.backgroundColor = '#28a745';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
    alert('Failed to copy to clipboard');
  });
}

document.getElementById('pasteForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const content = document.getElementById('pasteContent').value;
  if (!content.trim()) {
    alert('Please enter some text or code.');
    return;
  }

  try {
    // Generate a unique ID for the paste
    const pasteId = generatePasteId();
    
    // Store the paste in localStorage (for demo purposes)
    localStorage.setItem(`paste_${pasteId}`, content);

    // Construct the paste URL
    const pasteUrl = `${window.location.origin}?paste=${pasteId}`;

    // Display the result with animation
    document.getElementById('pasteLink').href = pasteUrl;
    document.getElementById('pasteLink').textContent = pasteUrl;
    document.getElementById('result').classList.remove('hidden');
    
    // Setup copy button
    document.getElementById('copyButton').addEventListener('click', () => {
      copyToClipboard(pasteUrl);
    });

    // Scroll to the result
    document.getElementById('result').scrollIntoView({ behavior: 'smooth' });

    // Show a preview with syntax highlighting
    document.getElementById('highlightedCode').textContent = content;
    Prism.highlightElement(document.getElementById('highlightedCode')); // Apply syntax highlighting
    document.getElementById('preview').classList.remove('hidden');
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
});

// Check if there's a paste ID in the URL when the page loads
window.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const pasteId = urlParams.get('paste');
  
  if (pasteId) {
    // We're in viewing mode
    // Hide the form and show the "create new paste" button
    document.getElementById('pasteForm').classList.add('hidden');
    document.getElementById('createNewContainer').classList.remove('hidden');
    document.getElementById('pageTitle').textContent = 'Viewing Paste';
    document.body.classList.add('view-mode');
    
    // Retrieve the paste content from localStorage
    const content = localStorage.getItem(`paste_${pasteId}`);
    
    if (content) {
      // Show the preview immediately as the main content
      document.getElementById('highlightedCode').textContent = content;
      Prism.highlightElement(document.getElementById('highlightedCode'));
      document.getElementById('preview').classList.remove('hidden');
      document.getElementById('previewTitle').textContent = 'Paste Content';
      
      // Show the "paste viewed" message
      document.getElementById('viewResult').classList.remove('hidden');
      
      // Setup copy content button
      document.getElementById('copyContentButton').addEventListener('click', () => {
        copyToClipboard(content);
      });
    } else {
      // Handle case where paste doesn't exist
      document.getElementById('notFoundMessage').classList.remove('hidden');
    }
  }
});