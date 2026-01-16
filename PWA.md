# Progressive Web App (PWA) Implementation

This document describes the PWA features implemented in the GetLeads application.

## Overview

GetLeads is now a Progressive Web App (PWA), which means users can install it on their mobile devices (Android, iOS) and desktop computers for a native app-like experience.

## Features

### 1. Installability
- Users can install the app directly from their browser
- An install prompt automatically appears 3 seconds after visiting the site
- The prompt can be dismissed and won't show again until the user clears their browser data
- Works on Android, iOS (with "Add to Home Screen"), and desktop browsers

### 2. Offline Support
The app includes comprehensive caching strategies for offline functionality:
- **Static Assets**: Images, fonts, CSS, and JavaScript files are cached
- **API Responses**: GET requests are cached with a 24-hour expiration
- **Next.js Data**: Page data is cached for faster navigation
- **Network-First Strategy**: The app tries to fetch fresh data but falls back to cache when offline

### 3. Caching Strategies

The service worker implements different caching strategies for different types of resources:

| Resource Type | Strategy | Cache Duration | Description |
|--------------|----------|----------------|-------------|
| Google Fonts (webfonts) | CacheFirst | 365 days | Fonts are cached aggressively |
| Google Fonts (stylesheets) | StaleWhileRevalidate | 7 days | Stylesheets update in background |
| Images (jpg, png, svg, etc.) | StaleWhileRevalidate | 24 hours | Images cached with background updates |
| JavaScript files | StaleWhileRevalidate | 24 hours | Scripts update in background |
| CSS files | StaleWhileRevalidate | 24 hours | Styles update in background |
| API calls (GET) | NetworkFirst | 24 hours | Fresh data preferred, fallback to cache |
| Next.js data | StaleWhileRevalidate | 24 hours | Page data with background updates |

### 4. App Manifest

The web app manifest (`public/manifest.json`) defines:
- App name and description
- Icons for various sizes (192x192, 512x512)
- Theme color (#4f46e5 - Indigo)
- Display mode (standalone for full-screen experience)
- Start URL (/)
- Right-to-Left (RTL) support for Arabic language
- App categories (business, productivity)

## Installation Instructions

### Android
1. Open the app in Chrome or another compatible browser
2. Wait for the install prompt to appear (3 seconds after page load)
3. Tap "تثبيت" (Install) button
4. The app will be added to your home screen

Alternative method:
1. Tap the browser menu (three dots)
2. Select "Install app" or "Add to Home Screen"
3. Confirm the installation

### iOS
1. Open the app in Safari
2. Tap the Share button (square with arrow pointing up)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm

### Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge
2. Look for the install icon in the address bar (⊕ or computer icon)
3. Click it and select "Install"
4. The app will open in its own window

## Technical Details

### Dependencies
- `@ducanh2912/next-pwa`: PWA plugin for Next.js
- Workbox: Google's service worker library (included with next-pwa)

### Configuration

**next.config.js**
- PWA configuration with workbox options
- Service worker generation settings
- Runtime caching rules
- Webpack build (required for PWA support)

**app/layout.tsx**
- Manifest link in the head
- PWA meta tags for iOS and Android
- Theme color configuration
- Viewport settings optimized for mobile

**app/components/InstallPrompt.tsx**
- Custom install prompt component
- Handles the `beforeinstallprompt` event
- RTL-optimized UI with Arabic text
- Persistent dismissal using localStorage

### Service Worker

The service worker is automatically generated during the build process and includes:
- Pre-caching of critical assets
- Runtime caching with configurable strategies
- Automatic updates when new versions are deployed
- Skip waiting for immediate activation

### Build Process

The PWA requires webpack for building (Turbopack is not compatible with next-pwa):

```bash
# Development (no service worker)
npm run dev

# Production build (generates service worker)
npm run build

# Start production server
npm start
```

## Testing PWA Features

### Test Installation
1. Build the app: `npm run build`
2. Start the server: `npm start`
3. Open in browser: `http://localhost:3000`
4. Check for install prompt or use browser's install option

### Test Offline Functionality
1. Install the app
2. Open DevTools (F12)
3. Go to Network tab
4. Select "Offline" mode
5. Reload the page - it should still work

### Test Service Worker
1. Open DevTools (F12)
2. Go to Application tab
3. Click on "Service Workers" in the sidebar
4. You should see the registered service worker
5. Check "Manifest" to view the web app manifest

### Lighthouse Audit
1. Open DevTools (F12)
2. Go to Lighthouse tab
3. Run an audit with "Progressive Web App" selected
4. Review the PWA score and recommendations

## Browser Support

- ✅ Chrome/Chromium (Android, Desktop)
- ✅ Edge (Desktop)
- ✅ Samsung Internet (Android)
- ✅ Safari (iOS 16.4+) - Limited PWA features
- ✅ Firefox (Android) - Limited PWA features
- ⚠️ Opera (Android, Desktop)

## Files Modified/Added

### New Files
- `app/components/InstallPrompt.tsx` - Custom install prompt component
- `public/manifest.json` - Web app manifest
- `public/icon.svg` - Main app icon
- `public/icon-192x192.svg` - 192x192 icon
- `public/icon-512x512.svg` - 512x512 icon
- `public/screenshot-mobile.svg` - Mobile screenshot
- `public/screenshot-wide.svg` - Wide screenshot
- `PWA.md` - This documentation file

### Modified Files
- `next.config.js` - Added PWA configuration
- `app/layout.tsx` - Added manifest and PWA meta tags
- `app/globals.css` - Added install prompt animation
- `package.json` - Added next-pwa dependency, updated build script
- `.gitignore` - Added service worker files to ignore

### Generated Files (Not in Git)
- `public/sw.js` - Service worker
- `public/workbox-*.js` - Workbox runtime
- `public/swe-worker-*.js` - Service worker entry

## Future Enhancements

Potential improvements for the PWA:
1. Add push notifications for lead updates
2. Background sync for offline form submissions
3. Add share target functionality
4. Implement app shortcuts for quick actions
5. Add periodic background sync
6. Create better app screenshots
7. Convert SVG icons to PNG for better compatibility
8. Add update notification when new version is available

## Troubleshooting

### Install Prompt Not Showing
- Clear browser cache and cookies
- Check if app is already installed
- Ensure you're using HTTPS (or localhost)
- Check browser console for errors

### Service Worker Not Registering
- Check browser console for errors
- Verify service worker is built: check `public/sw.js`
- Ensure you're running production build, not dev mode
- Try unregistering old service workers in DevTools

### Caching Issues
- Clear application cache in DevTools
- Unregister and re-register service worker
- Check cache storage in DevTools > Application > Cache Storage

### Build Errors
- Ensure you're using webpack, not Turbopack: `npm run build -- --webpack`
- Check that all dependencies are installed: `npm install`
- Try deleting `.next` folder and rebuilding

## Resources

- [Next.js PWA Guide](https://github.com/DuCanhGH/next-pwa)
- [Web.dev PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
