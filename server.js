const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "https://*.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

let waitingQueue = [];
let activeChatSessions = new Map();
let chatTimers = new Map();

const CHAT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

function findMatch(socket, userInterests = []) {
  if (waitingQueue.length > 0) {
    // Try to find a match with common interests first
    let bestMatch = null;
    let bestMatchIndex = -1;
    let maxCommonInterests = 0;

    for (let i = 0; i < waitingQueue.length; i++) {
      const potential = waitingQueue[i];
      if (!potential.connected) continue;
      
      const commonInterests = userInterests.filter(interest => 
        potential.interests && potential.interests.includes(interest)
      ).length;
      
      if (commonInterests > maxCommonInterests) {
        maxCommonInterests = commonInterests;
        bestMatch = potential;
        bestMatchIndex = i;
      }
    }
    
    // If no common interests found, take the first available user
    if (!bestMatch && waitingQueue.length > 0) {
      bestMatch = waitingQueue.find(user => user.connected);
      bestMatchIndex = waitingQueue.findIndex(user => user.connected);
    }
    
    if (bestMatch && bestMatchIndex !== -1) {
      const partner = bestMatch;
      waitingQueue.splice(bestMatchIndex, 1);
    
    if (partner.connected) {
      const chatId = `${socket.id}-${partner.id}`;
      
      activeChatSessions.set(socket.id, {
        partnerId: partner.id,
        chatId: chatId,
        extendRequest: false
      });
      
      activeChatSessions.set(partner.id, {
        partnerId: socket.id,
        chatId: chatId,
        extendRequest: false
      });
      
      socket.emit('partnerFound');
      partner.emit('partnerFound');
      
      const commonInterests = userInterests.filter(interest => 
        partner.interests && partner.interests.includes(interest)
      );
      
      if (commonInterests.length > 0) {
        const displayInterests = commonInterests.map(interest => 
          interest.charAt(0).toUpperCase() + interest.slice(1)
        ).join(', ');
        socket.emit('systemMessage', `Tambay partner found! You both vibe with: ${displayInterests} 💫`);
        partner.emit('systemMessage', `Tambay partner found! You both vibe with: ${displayInterests} 💫`);
      } else {
        socket.emit('systemMessage', 'Tambay partner connected! Start the vibe. 💬');
        partner.emit('systemMessage', 'Tambay partner connected! Start the vibe. 💬');
      }
      
      startChatTimer(chatId, socket.id, partner.id);
    } else {
      waitingQueue = waitingQueue.filter(user => user.connected);
      findMatch(socket);
    }
  } else {
    socket.interests = userInterests;
    waitingQueue.push(socket);
    socket.emit('searching');
  }
}

function startChatTimer(chatId, userId1, userId2) {
  const timer = setTimeout(() => {
    const session1 = activeChatSessions.get(userId1);
    const session2 = activeChatSessions.get(userId2);
    
    if (session1 && session2) {
      if (session1.extendRequest && session2.extendRequest) {
        io.to(userId1).emit('systemMessage', 'Chat extended by both users!');
        io.to(userId2).emit('systemMessage', 'Chat extended by both users!');
        
        session1.extendRequest = false;
        session2.extendRequest = false;
        activeChatSessions.set(userId1, session1);
        activeChatSessions.set(userId2, session2);
        
        io.to(userId1).emit('chatExtended');
        io.to(userId2).emit('chatExtended');
        
        startChatTimer(chatId, userId1, userId2);
      } else {
        io.to(userId1).emit('systemMessage', 'Chat ended due to time limit.');
        io.to(userId2).emit('systemMessage', 'Chat ended due to time limit.');
        
        io.to(userId1).emit('chatEnded');
        io.to(userId2).emit('chatEnded');
        
        disconnectUsers(userId1, userId2);
      }
    }
  }, CHAT_DURATION);
  
  chatTimers.set(chatId, timer);
  
  io.to(userId1).emit('timerStarted', CHAT_DURATION);
  io.to(userId2).emit('timerStarted', CHAT_DURATION);
}

function disconnectUsers(userId1, userId2) {
  const session1 = activeChatSessions.get(userId1);
  const session2 = activeChatSessions.get(userId2);
  
  if (session1 && session1.chatId) {
    const timer = chatTimers.get(session1.chatId);
    if (timer) {
      clearTimeout(timer);
      chatTimers.delete(session1.chatId);
    }
  }
  
  activeChatSessions.delete(userId1);
  activeChatSessions.delete(userId2);
  
  waitingQueue = waitingQueue.filter(user => user.id !== userId1 && user.id !== userId2);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('findPartner', (data) => {
    const interests = data && data.interests ? data.interests : [];
    findMatch(socket, interests);
  });
  
  socket.on('message', (data) => {
    const session = activeChatSessions.get(socket.id);
    if (session && session.partnerId) {
      const partner = io.sockets.sockets.get(session.partnerId);
      if (partner) {
        const messageData = {
          id: Date.now() + Math.random(),
          text: data.text,
          timestamp: new Date().toISOString(),
          sender: 'partner',
          type: data.type || 'text',
          reactions: {}
        };
        partner.emit('message', messageData);
      }
    }
  });

  socket.on('reaction', (data) => {
    const session = activeChatSessions.get(socket.id);
    if (session && session.partnerId) {
      const partner = io.sockets.sockets.get(session.partnerId);
      if (partner) {
        partner.emit('reaction', {
          messageId: data.messageId,
          emoji: data.emoji,
          sender: 'partner'
        });
      }
    }
  });

  socket.on('musicShare', (data) => {
    const session = activeChatSessions.get(socket.id);
    if (session && session.partnerId) {
      const partner = io.sockets.sockets.get(session.partnerId);
      if (partner) {
        partner.emit('musicShare', {
          track: data.track,
          action: data.action,
          sender: 'partner'
        });
      }
    }
  });

  socket.on('sharePlaylist', (data) => {
    const session = activeChatSessions.get(socket.id);
    if (session && session.partnerId) {
      const partner = io.sockets.sockets.get(session.partnerId);
      if (partner) {
        partner.emit('playlistReceived', {
          playlist: data.playlist,
          senderName: data.senderName || 'Your tambay buddy',
          sender: 'partner'
        });
      }
    }
  });
  
  socket.on('extendRequest', () => {
    const session = activeChatSessions.get(socket.id);
    if (session) {
      session.extendRequest = true;
      activeChatSessions.set(socket.id, session);
      
      const partner = io.sockets.sockets.get(session.partnerId);
      if (partner) {
        partner.emit('systemMessage', 'Your partner wants to extend the chat!');
      }
    }
  });
  
  socket.on('next', () => {
    const session = activeChatSessions.get(socket.id);
    if (session && session.partnerId) {
      const partner = io.sockets.sockets.get(session.partnerId);
      if (partner) {
        partner.emit('systemMessage', 'Partner disconnected.');
        partner.emit('partnerDisconnected');
      }
      
      disconnectUsers(socket.id, session.partnerId);
    }
    
    findMatch(socket, socket.interests || []);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    const session = activeChatSessions.get(socket.id);
    if (session && session.partnerId) {
      const partner = io.sockets.sockets.get(session.partnerId);
      if (partner) {
        partner.emit('systemMessage', 'Partner disconnected.');
        partner.emit('partnerDisconnected');
      }
      
      disconnectUsers(socket.id, session.partnerId);
    }
    
    waitingQueue = waitingQueue.filter(user => user.id !== socket.id);
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', activeChats: activeChatSessions.size / 2 });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});