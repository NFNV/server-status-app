# Gaming Server Status Monitor

A sophisticated real-time status monitoring dashboard for gaming servers, featuring elegant design and automatic health checks.

## Overview

This application provides a clean, professional interface for monitoring the availability and performance of Neverwinter Nights: Enhanced Edition persistent world servers. Built with React and Vite, it combines technical precision with refined aesthetics.

## Features

- **Real-Time Monitoring**: Automatic server health checks every 15 seconds
- **Live Player Count**: Displays current players and server capacity
- **Server Information**: Shows server name and online/offline status
- **Response Time Tracking**: Displays API response times in milliseconds
- **Visual Status Indicators**: Color-coded status cards with animated pulse effects
- **Manual Refresh**: On-demand server status checks with a single click
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Elegant UI**: Technical monospace typography with sophisticated color palette

## Current Servers

- **Neverwinter Nights**: Live server monitoring with real-time status
- **Ryzom**: Coming soon

## Architecture

### Frontend (This App)
- **React** - UI framework
- **Vite** - Build tool and dev server
- **CSS3** - Advanced styling with animations and gradients
- **Google Fonts** - JetBrains Mono and Inter typefaces

### Backend API (Separate VM)
The frontend connects to a separate backend status API running on a VM that handles the actual game server queries:

- **Backend endpoints**:
  - `GET /health` → `{"status":"ok"}`
  - `GET /status` → Returns server status, player count, and server info

- **Backend handles**:
  - UDP communication with the game server
  - GameDig queries or custom UDP probes
  - CORS configuration for frontend access

### How It Works

1. **Frontend Configuration**: The backend API URL is configured via the `VITE_STATUS_API_BASE_URL` environment variable
2. **Status Polling**: Frontend polls the backend every 15 seconds
3. **Data Display**: Shows online/offline status, player count (X / Y players), server name, and response time
4. **Error Handling**: If the backend is unreachable, the frontend displays "OFFLINE" status gracefully

## Setup

### 1. Configure Backend URL

Create a `.env` file in the project root (or copy `.env.example`):

```bash
VITE_STATUS_API_BASE_URL=http://<VM_EXTERNAL_IP>:8080
```

For local development, you can point to localhost:
```bash
VITE_STATUS_API_BASE_URL=http://127.0.0.1:8080
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The app will run on `http://localhost:5173/` with hot module replacement.

### 4. Build for Production

```bash
npm run build
```

## Deployment

### Vercel (Recommended)

This app is designed to work seamlessly with Vercel's serverless deployment:

1. Connect your Git repository to Vercel
2. Add the `VITE_STATUS_API_BASE_URL` environment variable in Vercel's project settings
3. Deploy!

**CORS Note**: Ensure your backend API has CORS configured to allow requests from your Vercel domain.

### Other Platforms

The app is a static React SPA and can be deployed to any static hosting service (Netlify, Cloudflare Pages, AWS S3, etc.). Just make sure to set the `VITE_STATUS_API_BASE_URL` environment variable during build.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_STATUS_API_BASE_URL` | Backend API base URL | `http://123.45.67.89:8080` |

## Development

### Project Structure

```
demo-app/
├── src/
│   ├── api/
│   │   └── statusApi.js      # API client for backend communication
│   ├── App.jsx               # Main component with status logic
│   ├── App.css               # Styles
│   ├── main.jsx              # React entry point
│   └── index.css             # Global styles
├── public/                   # Static assets
├── .env                      # Environment configuration (not in git)
├── .env.example              # Example environment file
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies and scripts
```

### API Client

The `src/api/statusApi.js` module handles all backend communication:

- **`fetchServerStatus()`**: Fetches current server status
  - Returns normalized data: `{ online, name, players, maxPlayers, lastUpdated }`
  - Handles network errors gracefully with 10-second timeout
  - Returns safe "offline" object if backend is unreachable

- **`checkBackendHealth()`**: Checks if backend is healthy (optional utility)

## Status Indicators

- 🟢 **Online**: Server is responding normally with player count
- 🔴 **Offline**: Server is not reachable or reported as offline
- 🟡 **Coming Soon**: Server not yet deployed
- ⚪ **Checking**: Status check in progress

## Design Philosophy

The interface employs a "Technical Refinement" aesthetic with:
- **JetBrains Mono** typography for a command-center feel
- Sober color palette featuring deep navy, muted teal, terracotta, and warm amber
- Subtle atmospheric effects and animations
- Professional glassmorphism effects with backdrop blur

## Browser Compatibility

Works in all modern browsers that support ES6+ and CSS Grid. Tested on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

Private project
