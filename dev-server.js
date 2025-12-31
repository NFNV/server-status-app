import express from 'express';
import { GameDig } from 'gamedig';
import net from 'net';

const app = express();
const PORT = 3001;
const gamedig = new GameDig();

// Enable CORS for local development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Server status endpoint using Gamedig for proper NWN UDP queries
app.get('/api/server-status', async (req, res) => {
  const SERVER_HOST = '34.39.144.194';
  const SERVER_PORT = 5121;

  try {
    const state = await gamedig.query({
      type: 'neverwinternights',
      host: SERVER_HOST,
      port: SERVER_PORT,
      socketTimeout: 5000,
      attemptTimeout: 5000
    });

    return res.status(200).json({
      online: true,
      host: SERVER_HOST,
      port: SERVER_PORT,
      players: state.players?.length || 0,
      maxPlayers: state.maxplayers || 0,
      name: state.name || 'Unknown',
      map: state.map || 'Unknown',
      ping: state.ping || 0,
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('GameDig query failed, trying UDP fallback:', error.message);

    // Fallback: TCP port check (more reliable than UDP)
    try {
      const isReachable = await checkTcpPort(SERVER_HOST, SERVER_PORT, 3000);

      if (isReachable) {
        return res.status(200).json({
          online: true,
          host: SERVER_HOST,
          port: SERVER_PORT,
          method: 'tcp-fallback',
          note: 'Server reachable but query protocol not responding',
          checkedAt: new Date().toISOString()
        });
      }
    } catch (fallbackError) {
      console.error('TCP fallback also failed:', fallbackError.message);
    }

    return res.status(200).json({
      online: false,
      host: SERVER_HOST,
      port: SERVER_PORT,
      error: error.message,
      checkedAt: new Date().toISOString()
    });
  }
});

function checkTcpPort(host, port, timeout) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isResolved = false;

    const cleanup = (result) => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(result);
      }
    };

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      cleanup(true);
    });

    socket.on('timeout', () => {
      cleanup(false);
    });

    socket.on('error', () => {
      cleanup(false);
    });

    try {
      socket.connect(port, host);
    } catch (err) {
      cleanup(false);
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Dev API server running on http://localhost:${PORT}`);
  console.log(`📡 Server status endpoint: http://localhost:${PORT}/api/server-status`);
});
