// API endpoint to test basic connectivity and show deployment info
// This will help diagnose Vercel-specific issues

export default function handler(req, res) {
  // Set CORS headers for this endpoint
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Return system information to help with debugging
  res.status(200).json({
    status: 'online',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    vercel: Boolean(process.env.VERCEL),
    vercelEnv: process.env.VERCEL_ENV || 'local',
    region: process.env.VERCEL_REGION || 'local',
    request: {
      url: req.url,
      method: req.method,
      headers: {
        host: req.headers.host,
        origin: req.headers.origin,
        referer: req.headers.referer,
        'user-agent': req.headers['user-agent'],
      }
    },
    socketInstructions: 'To test socket.io connections, visit your meeting URL and check the browser console',
    troubleshooting: {
      socketErrors: 'If you see "Error establishing socket", ensure your vercel.json has the correct headers set',
      peerErrors: 'If peers can\'t connect, check that the TURN servers are accessible',
      meetingIssues: 'If users can\'t see each other, both socket.io and WebRTC/PeerJS must be working correctly'
    }
  });
}
