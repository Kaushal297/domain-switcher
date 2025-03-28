# Domain Switcher Chrome Extension

A Chrome extension that allows you to easily switch between different domains (like local, staging, and production) while keeping the same path and query parameters.

## Features

- Easily add and manage multiple domains
- Switch between domains with a single click
- Preserves path, query parameters, and hash fragments when switching domains
- Save your commonly used domains for quick access
- Keyboard shortcuts for fast domain switching
- Privacy-focused with no data collection

## Usage

1. Click on the extension icon in your toolbar to open the popup
2. Add your domains (e.g., "Local" for "localhost:3000", "Production" for "example.com")
3. When viewing a page, click the extension icon and then click "Switch" next to the domain you want to switch to
4. The page will reload with the same path but on the selected domain

## Keyboard Shortcuts

- `Ctrl+Shift+D` (or `⌘+Shift+D` on Mac): Open the Domain Switcher popup
- `Ctrl+Shift+1` (or `⌘+Shift+1` on Mac): Switch to the first domain in your list
- `Ctrl+Shift+2` (or `⌘+Shift+2` on Mac): Switch to the second domain in your list
- `Ctrl+Shift+3` (or `⌘+Shift+3` on Mac): Switch to the third domain in your list

## Security

Domain Switcher is built with security as a priority:

- **Content Security Policy (CSP)**: Prevents execution of unauthorized scripts and potential XSS attacks.
- **Minimal Permissions**: Only requests the minimum permissions required for functionality.
- **No Remote Code**: All code is bundled with the extension; no external scripts are loaded.
- **Data Security**: All data is stored locally in your browser's storage and never transmitted.
- **Input Validation**: All user inputs are validated to prevent security issues.

## Privacy Policy

Domain Switcher respects your privacy and does not collect any personal information. All domain configurations are stored locally in your browser using Chrome's storage API and are only synchronized across your Chrome browsers if you are signed into Chrome.

For more details, see the privacy policy in the extension options.

## License

This project is licensed under the MIT License - see the LICENSE file for details.