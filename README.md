# Nexus Meet - Video Conferencing Platform

![Nexus Meet](https://your-screenshot-url-here.png)

Nexus Meet is a modern video conferencing platform built with Next.js and WebRTC technology, designed to provide seamless communication for teams and individuals. The application offers high-quality video and audio streaming, real-time chat, screen sharing, and other collaborative features.

## Features

### Core Functionality
- **HD Video Conferencing**: Crystal clear video for seamless communication
- **Real-time Chat**: Send messages during meetings with instant delivery
- **User Authentication**: Secure sign-up and login with Clerk authentication
- **Custom Meeting Rooms**: Create and join meetings with unique room IDs
- **Pre-join Screen**: Check audio/video settings before entering a meeting

### Interactive Features
- **Reactions**: Send quick emoji reactions during meetings
- **Raise Hand**: Signal when you want to speak
- **Polls**: Create and participate in polls during meetings
- **Recording**: Record meetings for future reference
  - Local recording support
  - AI-powered recording and transcription

### User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Easy on the eyes with a modern dark UI
- **Prejoin Screen**: Test audio/video before joining
- **Dashboard**: View and manage your meetings

## Tech Stack

- **Frontend**: 
  - Next.js 13
  - React 18
  - Tailwind CSS
  - Framer Motion (animations)
  - Lucide React (icons)

- **Backend**:
  - Next.js API Routes
  - Socket.IO (real-time communication)
  - PeerJS (WebRTC wrapper)
  - Prisma ORM

- **Authentication**:
  - Clerk Authentication

- **Deployment**:
  - Vercel (recommended)

## Getting Started

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/google-meet-clone.git
   cd google-meet-clone
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory with the following variables:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   DATABASE_URL=your_database_connection_string
   ```

4. Set up the database
   ```bash
   npx prisma db push
   ```

5. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

```
/
├── component/          # Reusable UI components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── pages/              # Next.js pages and API routes
│   ├── api/            # Backend API endpoints
│   ├── dashboard/      # User dashboard
│   └── [roomId].js     # Dynamic meeting room page
├── prisma/             # Database schema and migrations
├── public/             # Static files
└── styles/             # Global styles and CSS modules
```

## Key Components

### Socket Communication

The application uses Socket.IO for real-time communication between clients. The socket connection is established in `context/socket.js` and provides events for:

- User presence (join/leave)
- Reactions and emojis
- Raise/lower hand functionality
- Recording status

### WebRTC Integration

WebRTC is used for peer-to-peer video and audio streaming, implemented with PeerJS for simplified connection management. The core functionality is in `hooks/useMediaStream.js` and `hooks/usePeer.js`.

### Meeting Room

The meeting room (`pages/[roomId].js`) is the main interface where users interact during video calls. It includes:

- Video grid layout
- Chat interface
- Bottom control bar
- Various interactive components

## Deployment

The application is optimized for deployment on Vercel:

1. Create a Vercel account and link your repository
2. Configure environment variables in the Vercel dashboard
3. Deploy the application

For other hosting providers, build the application with:
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Shlok Majmundar
- [LinkedIn](https://www.linkedin.com/in/shlok-majmundar-988851252/)
- [Instagram](https://www.instagram.com/shlok.majmundar)
- [GitHub](https://github.com/SHlok06majmundar)
- Email: majmundarshlok06@gmail.com

Project Link: [https://github.com/SHlok06majmundar/google-meet-clone](https://github.com/SHlok06majmundar/google-meet-clone)
