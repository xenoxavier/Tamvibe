# Random Chat App

A modern Omegle-style anonymous text chat application with real-time messaging and 5-minute chat sessions.

## Features

- ✅ Anonymous random matchmaking between two users
- ✅ Real-time instant messaging with Socket.IO
- ✅ "Next" button to skip current chat and find new partner
- ✅ Responsive UI for mobile and desktop
- ✅ Modern dark mode design with TailwindCSS
- ✅ System messages for connection events
- ✅ 5-minute chat timer with extend functionality
- ✅ Both users must agree to extend chat before timer expires

## Tech Stack

### Backend
- Node.js + Express
- Socket.IO for real-time communication
- In-memory matchmaking queue
- Server-side chat timers

### Frontend
- React 18
- TailwindCSS for styling
- Socket.IO client
- React Router for navigation

## Local Development

### Backend Setup

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the server:
\`\`\`bash
npm run dev
\`\`\`

The server will run on http://localhost:3001

### Frontend Setup

1. Navigate to frontend directory:
\`\`\`bash
cd frontend
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Copy environment file:
\`\`\`bash
cp .env.example .env
\`\`\`

4. Start the development server:
\`\`\`bash
npm start
\`\`\`

The frontend will run on http://localhost:3000

## Deployment

### Backend (Render/Fly.io)

1. **Render:**
   - Connect your GitHub repository
   - Set build command: \`npm install\`
   - Set start command: \`npm start\`
   - Environment: Node.js

2. **Fly.io:**
   \`\`\`bash
   fly launch
   fly deploy
   \`\`\`

### Frontend (Vercel)

1. **Vercel:**
   - Connect your GitHub repository
   - Set root directory to \`frontend\`
   - Set environment variable: \`REACT_APP_SERVER_URL=https://your-backend-url.com\`
   - Build command: \`npm run build\`
   - Output directory: \`build\`

## Environment Variables

### Frontend
- \`REACT_APP_SERVER_URL\`: Backend server URL (e.g., https://your-backend.onrender.com)

### Backend
- \`PORT\`: Server port (automatically set by hosting providers)

## How It Works

1. **Matchmaking**: Users are placed in a waiting queue until paired with another user
2. **Chat Timer**: Each chat session has a 5-minute timer
3. **Extend Feature**: When 30 seconds remain, both users can request to extend
4. **Auto-disconnect**: If both users don't agree to extend, chat ends automatically
5. **Next Partner**: Users can skip to find a new chat partner anytime

## API Events

### Client → Server
- \`findPartner\`: Join matchmaking queue
- \`message\`: Send chat message
- \`extendRequest\`: Request to extend chat
- \`next\`: Skip to next partner
- \`disconnect\`: Leave chat

### Server → Client
- \`searching\`: User is in matchmaking queue
- \`partnerFound\`: Matched with another user
- \`message\`: Receive chat message
- \`systemMessage\`: System notification
- \`timerStarted\`: Chat timer begins
- \`chatExtended\`: Timer reset after both agreed
- \`chatEnded\`: Timer expired without extension
- \`partnerDisconnected\`: Partner left chat

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License