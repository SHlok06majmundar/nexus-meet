# Nexus Meet

**Professional Video Conferencing Platform**

Nexus Meet is a modern, professional video conferencing solution designed to make virtual meetings seamless and engaging. Built with cutting-edge web technologies, it provides a frictionless experience for video, voice, chat, and content sharing across all devices.

![Nexus Meet](/screenshot/nexus-meet.png)

## ✨ Features

- 🎥 **HD Video Conferencing** - Crystal clear video and audio quality
- 💬 **Real-time Chat** - Instant messaging during meetings
- 🔗 **Easy Sharing** - QR codes and direct links for quick joining
- 🎨 **Modern UI** - Professional, responsive design with dark theme
- 🔒 **Secure** - Google authentication and encrypted connections
- 📱 **Cross-platform** - Works on desktop, tablet, and mobile devices
- ⚡ **Fast** - Built with React and optimized for performance

## 🚀 Live Demo

https://nexus-meet.netlify.app/

## 📱 Screenshots

### Home Page
![Home](/screenshot/home.png)

### Meeting Room
![Meeting Room](/screenshot/room.png)

## 🛠️ Tech Stack

**Frontend:**
- React 17
- Tailwind CSS
- Framer Motion
- Socket.io Client
- Simple Peer (WebRTC)

**Backend:**
- Node.js
- Express.js
- Socket.io
- CORS

**Authentication:**
- Firebase Auth (Google OAuth)

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/theviralboy/nexus-meet
cd nexus-meet
```

2. **Install dependencies**
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../backend
npm install
```

3. **Firebase Setup**

- Go to [Firebase Console](https://console.firebase.google.com/)
- Create a new project
- Enable **Authentication** (Google Sign-in method)
- Enable **Firestore Database**
- Go to Project Settings and copy your config credentials
- Update the Firebase configuration in `/client/src/firebase/config.js`

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

4. **Start the application**
```bash
# Start the backend server (from backend directory)
npm run dev

# Start the frontend (from client directory)
npm start
```

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`

## 🎯 Usage

1. **Join a Meeting**
   - Open the application
   - Sign in with your Google account
   - Click "New Meeting" to start instantly
   - Share the meeting link or QR code with participants

2. **Meeting Controls**
   - Toggle camera/microphone
   - Chat with participants
   - Pin/unpin video feeds
   - Leave meeting

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with React and modern web technologies
- Inspired by the need for better video conferencing experiences
- Thanks to the open-source community for amazing tools and libraries

---

<div align="center">
  <p>Made with ❤️ by Shlok Majmundar</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
  projectId: "xxxxxxx-xxxxxxxxx-xxxxxx",
  storageBucket: "xxxxxxx-xxxxxxxxx-xxxxxx",
  messagingSenderId: "xxxxxxx-xxxxxxxxx-xxxxxx",
  appId: "xxxxxxx-xxxxxxxxx-xxxxxx",
};
```

Start the client server

```bash
  npm run start # on client folder and it will run on localhost:3000
```

Start the backend server

```bash
  npm run start # on backend folder and it will run a server on localhost:5000
  npm run dev # on backend folder and it will run a development server on localhost:5000
```

And you are ready to go!

## Tech Stack

React, Firebase 9, TailwindCSS 3, simple-peer, Node JS, Socket IO

## Feedback

If you have any feedback, please reach out to us at sahilverma.webdev@gmail.com
