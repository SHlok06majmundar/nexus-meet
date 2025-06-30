// This file handles socket.io specific API calls
// This is needed for proper Socket.io functioning in production environments like Vercel

export default function handler(req, res) {
    // This endpoint is just a placeholder to ensure the API route exists
    // The actual socket connection is handled by the socket.io middleware
    if (req.method === 'GET') {
        res.status(200).json({ message: 'Socket.io connection endpoint ready' });
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};
