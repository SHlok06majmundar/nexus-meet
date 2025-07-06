import { NextApiRequest } from 'next';
import { NextApiResponseServerIO, initSocket } from '../../lib/socket';

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (res.socket.server.io) {
    console.log('Socket.IO server already running');
    res.status(200).json({ message: 'Socket.IO server already running' });
    return;
  }

  console.log('Initializing Socket.IO server...');
  initSocket(res);
  res.status(200).json({ message: 'Socket.IO server initialized successfully' });
}
