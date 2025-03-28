/**
 * Domain Switcher - Background Service Worker
 * 
 * This script handles keyboard shortcuts and domain switching.
 * It follows Content Security Policy (CSP) best practices:
 * - No inline scripts
 * - No eval() or new Function()
 * - No remote script loading
 */

// Listen for keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  if (command.startsWith('switch-domain-')) {
    const domainIndex = parseInt(command.split('-')[2]) - 1; // Convert to 0-based index
    
    // Get the current tab URL
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) {
        console.error('No active tab found');
        return;
      }
      
      const currentUrl = tabs[0].url;
      
      // Get saved domains
      chrome.storage.sync.get('domains', (data) => {
        const domains = data.domains || [];
        
        // Check if we have the requested domain
        if (domains.length <= domainIndex) {
          console.error(`No domain found at index ${domainIndex}`);
          return;
        }
        
        // Switch to the selected domain
        try {
          const newDomain = domains[domainIndex].url;
          const url = new URL(currentUrl);
          const newUrl = new URL(url.pathname + url.search + url.hash, newDomain);
          
          // Update current tab with new URL
          chrome.tabs.update(tabs[0].id, { url: newUrl.toString() });
        } catch (e) {
          console.error('Error switching domain:', e.message);
          // Notify user of error
          chrome.action.setBadgeText({ text: 'ERR' });
          chrome.action.setBadgeBackgroundColor({ color: '#F44336' });
          
          // Clear the badge after 3 seconds
          setTimeout(() => {
            chrome.action.setBadgeText({ text: '' });
          }, 3000);
        }
      });
    });
  }
}); 