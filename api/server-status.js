import { GameDig } from 'gamedig';
import dgram from 'dgram';

const gamedig = new GameDig();

function checkUdpPort(host, port, timeout) {
  return new Promise((resolve) => {
    const client = dgram.createSocket('udp4');
    let hasResponded = false;

    // If we get ICMP "port unreachable" error, port is closed
    client.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        hasResponded = true;
        client.close();
        resolve(false); // Port is closed
      }
    });

    // Send a probe packet
    const message = Buffer.from('NWN_PROBE');

    client.send(message, port, host, (err) => {
      if (err) {
        client.close();
        resolve(false);
        return;
      }

      // Wait for ICMP error or timeout
      setTimeout(() => {
        client.close();
        // If no ICMP error received, assume port is open
        // (server is listening even if it doesn't respond to our probe)
        resolve(!hasResponded);
      }, timeout);
    });
  });
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Content-Type', 'application/json');

  const SERVER_HOST = '34.39.255.135';
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

    // Fallback: UDP port check (NWN is UDP-only)
    try {
      const isReachable = await checkUdpPort(SERVER_HOST, SERVER_PORT, 2000);

      if (isReachable) {
        return res.status(200).json({
          online: true,
          host: SERVER_HOST,
          port: SERVER_PORT,
          method: 'udp-probe',
          note: 'Server reachable via UDP probe',
          checkedAt: new Date().toISOString()
        });
      }
    } catch (fallbackError) {
      console.error('UDP fallback also failed:', fallbackError.message);
    }

    return res.status(200).json({
      online: false,
      host: SERVER_HOST,
      port: SERVER_PORT,
      error: error.message,
      checkedAt: new Date().toISOString()
    });
  }
}
