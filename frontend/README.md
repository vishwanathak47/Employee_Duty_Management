# Employee Duty Management System - Frontend

## Overview
A responsive React application with mobile-first design that behaves like a native app on phones and a web app on desktops.

## Features

### 🎨 **Theming System**
- Dark/Light mode toggle with CSS variables
- Automatic system preference detection
- Smooth theme transitions
- Persistent theme selection

### 📱 **Responsive Navigation**
- **Mobile (< 768px):** Fixed bottom navigation bar with native app aesthetics
- **Desktop (> 768px):** Traditional top navigation with logo and theme toggle
- Smooth transitions between layouts

### 🔐 **Authentication**
- JWT-based authentication
- Login/Signup forms
- Protected routes
- Automatic token refresh

### 🌐 **Network Handling**
- Real-time network status monitoring
- "No Internet" toast notifications
- Graceful offline handling

### 📊 **API Integration**
- Axios-based API client
- Automatic authentication headers
- Error handling and retries
- Centralized API utilities

## Project Structure
```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Layout.js & Layout.css
│   │   ├── ThemeToggle.js
│   │   └── NetworkStatus.js
│   ├── contexts/
│   │   ├── AuthContext.js
│   │   └── ThemeContext.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Home.js
│   │   ├── Schedule.js
│   │   ├── Register.js
│   │   └── Reports.js
│   ├── utils/
│   │   └── api.js
│   ├── styles/
│   │   └── index.css
│   ├── App.js
│   └── index.js
└── package.json
```

## Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Start Development Server:**
   ```bash
   npm start
   ```

3. **Build for Production:**
   ```bash
   npm run build
   ```

## Key Components

### ThemeContext
Manages application theming with CSS variables for consistent styling across light/dark modes.

### AuthContext
Handles user authentication state, login/signup operations, and token management.

### Layout Component
Implements dual navigation system that adapts based on screen size.

### NetworkStatus Component
Monitors online/offline status and displays toast notifications.

## Mobile App Experience

The app is designed to feel like a native mobile application:
- Bottom navigation bar on mobile devices
- Touch-friendly button sizes
- Smooth animations and transitions
- Responsive design that works on all screen sizes

## PWA Features

### 📱 **Progressive Web App**
- Service worker for offline caching
- App manifest for installability
- Standalone display mode
- Fast loading with cached resources

### 🚀 **Installation**
- Users can install the app on their devices
- Works offline with cached data
- Native app-like experience

## Deployment

### Netlify Deployment
1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy to Netlify:
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variables if needed

3. Configure redirects for SPA:
   - Add `_redirects` file in `public/`:
     ```
     /*    /index.html   200
     ```

### Vercel Deployment
1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy to Vercel:
   - Connect your GitHub repository
   - Vercel auto-detects React apps
   - Add environment variables in Vercel dashboard

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development Notes

- Uses React 18 with hooks
- CSS Variables for theming
- Axios for API calls
- React Router for navigation
- Mobile-first responsive design
- Service worker for PWA functionality