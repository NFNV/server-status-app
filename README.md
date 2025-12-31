# Gaming Server Status Monitor

A sophisticated real-time status monitoring dashboard for gaming servers, featuring elegant design and automatic health checks.

## Overview

This application provides a clean, professional interface for monitoring the availability and performance of multiple gaming servers. Built with React and Vite, it combines technical precision with refined aesthetics.

## Features

- **Real-Time Monitoring**: Automatic server health checks every 30 seconds
- **Response Time Tracking**: Displays server response times in milliseconds
- **Visual Status Indicators**: Color-coded status cards with animated pulse effects
- **Manual Refresh**: On-demand server status checks with a single click
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Elegant UI**: Technical monospace typography with sophisticated color palette

## Current Servers

- **Neverwinter Nights**: Live server monitoring with real-time status
- **Ryzom**: Coming soon

## Design Philosophy

The interface employs a "Technical Refinement" aesthetic with:
- **JetBrains Mono** typography for a command-center feel
- Sober color palette featuring deep navy, muted teal, terracotta, and warm amber
- Subtle atmospheric effects and animations
- Professional glassmorphism effects with backdrop blur

## Tech Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **CSS3** - Advanced styling with animations and gradients
- **Google Fonts** - JetBrains Mono and Inter typefaces
- **GameDig** - Game server query library
- **Express** - Local development API server
- **Node.js net module** - TCP connection fallback

## Technical Implementation

### The UDP Challenge

Game servers like Neverwinter Nights communicate primarily over **UDP**, but web browsers cannot make UDP requests due to security restrictions. This creates a challenge for web-based monitoring.

**Solution Architecture:**

1. **Backend API Layer** (`/api/server-status`)
   - Runs as a Node.js serverless function (Vercel) or Express server (local dev)
   - Has access to Node.js networking capabilities (UDP/TCP)

2. **Two-Tier Status Check**
   - **Primary**: GameDig query using GameSpy2 protocol over UDP
   - **Fallback**: UDP probe with ICMP error detection

3. **How the UDP Probe Works**
   - NWN:EE servers don't respond to GameSpy queries
   - NWN only listens on **UDP** (not TCP)
   - We send a UDP probe packet to port 5121
   - If the OS returns ICMP "port unreachable" → Server is **offline**
   - If no ICMP error is received → Server is **online** (listening)

This hybrid approach ensures accurate online/offline detection for UDP-only game servers, even when standard query protocols aren't available.

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Development

The app runs on `http://localhost:5173/` with hot module replacement enabled for instant updates during development.

## Status Indicators

- 🟢 **Online**: Server is responding normally
- 🔴 **Offline**: Server is not reachable
- 🟡 **Coming Soon**: Server not yet deployed
- ⚪ **Checking**: Status check in progress
