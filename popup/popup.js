/**
 * Domain Switcher - Popup Script
 * 
 * This script handles the popup UI functionality.
 * It follows Content Security Policy (CSP) best practices:
 * - No inline scripts
 * - No eval() or new Function()
 * - No remote script loading
 * - Proper error handling
 */

document.addEventListener('DOMContentLoaded', function () {
	// Elements
	const domainNameInput = document.getElementById('domainName');
	const domainUrlInput = document.getElementById('domainUrl');
	const saveDomainButton = document.getElementById('saveDomain');
	const addDomainButton = document.getElementById('addDomain');
	const domainList = document.getElementById('domainList');
	const errorDisplay = document.createElement('div');

	// Add error display element
	errorDisplay.className = 'error-message';
	errorDisplay.style.color = '#F44336';
	errorDisplay.style.marginTop = '10px';
	errorDisplay.style.display = 'none';
	document.body.appendChild(errorDisplay);

	// Load saved domains
	loadDomains();

	// Hide the domain entry form initially
	const domainEntry = document.querySelector('.domain-entry');
	domainEntry.style.display = 'none';

	// Show domain entry form when "Add Domain" is clicked
	addDomainButton.addEventListener('click', function () {
		domainEntry.style.display = 'flex';
		domainNameInput.value = '';
		domainUrlInput.value = '';
		domainNameInput.focus();
		hideError();
	});

	// Save domain when button is clicked
	saveDomainButton.addEventListener('click', saveDomain);

	// Add keyboard event listeners for domain input fields
	domainNameInput.addEventListener('keypress', function (e) {
		if (e.key === 'Enter') {
			domainUrlInput.focus();
		}
	});

	domainUrlInput.addEventListener('keypress', function (e) {
		if (e.key === 'Enter') {
			saveDomain();
		}
	});

	// Show an error message to the user
	function showError(message) {
		errorDisplay.textContent = message;
		errorDisplay.style.display = 'block';

		// Auto-hide after 5 seconds
		setTimeout(hideError, 5000);
	}

	// Hide the error message
	function hideError() {
		errorDisplay.style.display = 'none';
	}

	function saveDomain() {
		const name = domainNameInput.value.trim();
		let url = domainUrlInput.value.trim();

		if (!name || !url) {
			showError('Please enter both a name and domain URL');
			return;
		}

		// Validate domain format
		try {
			// Handle localhost special case
			if (url === 'localhost' || url.startsWith('localhost:')) {
				url = 'http://' + url;
			}
			// Add https:// if not present and not http://
			else if (!url.startsWith('http://') && !url.startsWith('https://')) {
				url = 'https://' + url;
			}

			// Test if it's a valid URL
			new URL(url);

			// Remove trailing slash if present
			if (url.endsWith('/')) {
				url = url.slice(0, -1);
			}
		} catch (e) {
			showError('Invalid URL format: ' + e.message);
			return;
		}

		// Save domain to storage
		chrome.storage.sync.get('domains', function (data) {
			const domains = data.domains || [];

			// Check if domain with same name already exists
			const existingIndex = domains.findIndex(domain => domain.name === name);
			const urlExists = domains.some(domain => domain.url === url && domain.name !== name);

			if (urlExists) {
				// Just show a warning but allow save
				showError('Warning: This URL already exists with a different name');
			}

			if (existingIndex !== -1) {
				// Update existing domain
				domains[existingIndex] = { name, url };
			} else {
				// Add new domain
				domains.push({ name, url });
			}

			chrome.storage.sync.set({ domains }, function () {
				if (chrome.runtime.lastError) {
					showError('Error saving domain: ' + chrome.runtime.lastError.message);
					return;
				}

				// Hide domain entry form
				domainEntry.style.display = 'none';
				hideError();

				// Update domain list
				loadDomains();
			});
		});
	}

	function loadDomains() {
		chrome.storage.sync.get('domains', function (data) {
			if (chrome.runtime.lastError) {
				showError('Error loading domains: ' + chrome.runtime.lastError.message);
				return;
			}

			const domains = data.domains || [];

			// Clear current domain list
			domainList.innerHTML = '';

			if (domains.length === 0) {
				domainList.innerHTML = '<p>No domains added yet. Click "Add Domain" to get started.</p>';
				// Display keyboard shortcut info
				const shortcutInfo = document.createElement('p');
				shortcutInfo.innerHTML = '<small>Tip: Use <kbd>Ctrl+Shift+D</kbd> (or <kbd>⌘+Shift+D</kbd> on Mac) to open this panel quickly.</small>';
				domainList.appendChild(shortcutInfo);
				return;
			}

			// Add shortcut info
			const shortcutInfo = document.createElement('div');
			shortcutInfo.innerHTML = '<small>Keyboard shortcuts: Press <kbd>Ctrl+Shift+1</kbd> through <kbd>Ctrl+Shift+3</kbd> (or <kbd>⌘+Shift+1</kbd> through <kbd>⌘+Shift+3</kbd> on Mac) to quickly switch to your first 3 domains</small>';
			shortcutInfo.style.marginBottom = '10px';
			domainList.appendChild(shortcutInfo);

			// Get current tab URL to display active domain
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				if (!tabs || tabs.length === 0) {
					showError('No active tab found');
					return;
				}

				const currentUrl = tabs[0].url;
				let currentDomain;

				try {
					currentDomain = new URL(currentUrl).origin;
				} catch (e) {
					showError('Invalid current URL: ' + e.message);
					return;
				}

				// Add each domain to the list
				domains.forEach(function (domain, index) {
					const domainDiv = document.createElement('div');
					domainDiv.className = 'domain-entry';

					// Add shortcut indicator for first 3 domains
					if (index < 3) {
						domainDiv.style.position = 'relative';
						const shortcutLabel = document.createElement('small');
						shortcutLabel.textContent = `#${index + 1}`;
						shortcutLabel.style.position = 'absolute';
						shortcutLabel.style.left = '-15px';
						shortcutLabel.style.color = '#666';
						domainDiv.appendChild(shortcutLabel);
					}

					// Create switch button
					const switchButton = document.createElement('button');
					switchButton.textContent = 'Switch';
					switchButton.className = 'switch-button';
					switchButton.addEventListener('click', function () {
						switchDomain(domain.url, currentUrl);
					});

					// Create edit button
					const editButton = document.createElement('button');
					editButton.textContent = 'Edit';
					editButton.className = 'switch-button'
					editButton.addEventListener('click', function () {
						domainNameInput.value = domain.name;
						domainUrlInput.value = domain.url.replace(/^https?:\/\//, '');
						domainEntry.style.display = 'flex';
						domainNameInput.focus();
					});

					// Create delete button
					const deleteButton = document.createElement('button');
					deleteButton.textContent = 'Delete';
					deleteButton.addEventListener('click', function () {
						deleteDomain(index);
					});

					// Create domain name label
					const nameSpan = document.createElement('span');
					nameSpan.textContent = domain.name;
					nameSpan.style.flexGrow = '1';
					nameSpan.style.fontWeight = currentDomain === domain.url ? 'bold' : 'normal';

					// Highlight active domain
					if (currentDomain === domain.url) {
						domainDiv.style.backgroundColor = '#f0f8ff';
						nameSpan.style.fontWeight = 'bold';
					}

					// Add all elements to domain entry
					domainDiv.appendChild(nameSpan);
					domainDiv.appendChild(switchButton);
					domainDiv.appendChild(editButton);
					domainDiv.appendChild(deleteButton);

					domainList.appendChild(domainDiv);
				});
			});
		});
	}

	function switchDomain(newDomain, currentUrl) {
		try {
			const url = new URL(currentUrl);
			const newUrl = new URL(url.pathname + url.search + url.hash, newDomain);

			// Update current tab with new URL
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				if (!tabs || tabs.length === 0) {
					showError('No active tab found');
					return;
				}

				chrome.tabs.update(tabs[0].id, { url: newUrl.toString() }, function () {
					if (chrome.runtime.lastError) {
						showError('Error updating tab: ' + chrome.runtime.lastError.message);
						return;
					}
					window.close(); // Close popup after switching
				});
			});
		} catch (e) {
			showError('Error switching domain: ' + e.message);
		}
	}

	function deleteDomain(index) {
		if (confirm('Are you sure you want to delete this domain?')) {
			chrome.storage.sync.get('domains', function (data) {
				if (chrome.runtime.lastError) {
					showError('Error accessing domains: ' + chrome.runtime.lastError.message);
					return;
				}

				const domains = data.domains || [];
				domains.splice(index, 1);

				chrome.storage.sync.set({ domains }, function () {
					if (chrome.runtime.lastError) {
						showError('Error saving domains: ' + chrome.runtime.lastError.message);
						return;
					}
					loadDomains();
				});
			});
		}
	}
}); 