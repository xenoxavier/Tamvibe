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

function findMatch(socket, userInterests = [], allowAnyMatch = false) {
  if (waitingQueue.length > 0) {
    let bestMatch = null;
    let bestMatchIndex = -1;
    let maxCommonInterests = 0;
    let bestCommonInterests = [];

    // First, try to find matches with common interests
    console.log(`💭 User ${socket.id} checking ${waitingQueue.length} users in queue`);
    for (let i = 0; i < waitingQueue.length; i++) {
      const potential = waitingQueue[i];
      if (!potential.connected) continue;
      
      console.log(`⚖️ Comparing interests: User ${socket.id}(${JSON.stringify(userInterests)}) vs User ${potential.id}(${JSON.stringify(potential.interests)})`);
      
      const commonInterests = userInterests.filter(interest => 
        potential.interests && potential.interests.includes(interest)
      );
      
      console.log(`🎯 Common interests found:`, commonInterests);
      
      if (commonInterests.length > maxCommonInterests) {
        maxCommonInterests = commonInterests.length;
        bestMatch = potential;
        bestMatchIndex = i;
        bestCommonInterests = commonInterests;
        console.log(`✨ New best match: ${potential.id} with ${commonInterests.length} common interests`);
      }
    }
    
    // If no common interests found and allowAnyMatch is true, match with anyone
    if (!bestMatch && allowAnyMatch) {
      for (let i = 0; i < waitingQueue.length; i++) {
        const potential = waitingQueue[i];
        if (potential.connected) {
          bestMatch = potential;
          bestMatchIndex = i;
          bestCommonInterests = [];
          console.log(`Fallback match: ${socket.id} with ${potential.id} (no common interests)`);
          break;
        }
      }
    }
    
    if (bestMatch && bestMatchIndex !== -1) {
      const partner = bestMatch;
      waitingQueue.splice(bestMatchIndex, 1);
      
      console.log(`Matching users: ${socket.id} with ${partner.id}, common interests:`, bestCommonInterests);
      
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
        
        // Show message based on whether interests matched
        if (bestCommonInterests.length > 0) {
          const displayInterests = bestCommonInterests.map(interest => 
            interest.charAt(0).toUpperCase() + interest.slice(1)
          ).join(', ');
          const message = `🎯 Perfect match! You both love: ${displayInterests} 💫`;
          socket.emit('systemMessage', message);
          partner.emit('systemMessage', message);
        } else {
          const message = `🌟 Connected with a tambay buddy! Start the conversation! 💬`;
          socket.emit('systemMessage', message);
          partner.emit('systemMessage', message);
        }
        
        startChatTimer(chatId, socket.id, partner.id);
      } else {
        waitingQueue = waitingQueue.filter(user => user.connected);
        findMatch(socket, userInterests, allowAnyMatch);
      }
    } else if (!allowAnyMatch) {
      // No match found yet, add to queue and set fallback timer
      socket.interests = userInterests;
      waitingQueue.push(socket);
      socket.emit('searching');
      console.log(`User ${socket.id} added to queue, waiting for match with interests:`, userInterests);
      
      // Set fallback timer: after 15 seconds, allow matching with anyone
      setTimeout(() => {
        // Check if user is still in queue and not matched
        if (waitingQueue.find(user => user.id === socket.id) && socket.connected) {
          console.log(`Fallback matching activated for user ${socket.id}`);
          // Remove from queue first
          waitingQueue = waitingQueue.filter(user => user.id !== socket.id);
          // Try again with allowAnyMatch = true
          findMatch(socket, userInterests, true);
        }
      }, 15000); // 15 seconds fallback
    }
  } else {
    // No users in queue, add this user
    socket.interests = userInterests;
    waitingQueue.push(socket);
    socket.emit('searching');
    console.log(`User ${socket.id} added to queue, waiting for match with interests:`, userInterests);
    
    // Set fallback timer for first user too
    setTimeout(() => {
      if (waitingQueue.find(user => user.id === socket.id) && socket.connected) {
        console.log(`Fallback matching activated for user ${socket.id}`);
        waitingQueue = waitingQueue.filter(user => user.id !== socket.id);
        findMatch(socket, userInterests, true);
      }
    }, 15000);
  }
}

function startChatTimer(chatId, userId1, userId2) {
  let timeLeft = CHAT_DURATION / 1000; // Convert to seconds
  
  // Send initial timer
  io.to(userId1).emit('timerUpdate', timeLeft);
  io.to(userId2).emit('timerUpdate', timeLeft);
  
  const timer = setInterval(() => {
    timeLeft--;
    
    // Send synchronized timer updates every second
    io.to(userId1).emit('timerUpdate', timeLeft);
    io.to(userId2).emit('timerUpdate', timeLeft);
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      chatTimers.delete(chatId);
      
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
    }
  }, 1000);
  
  chatTimers.set(chatId, timer);
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
    console.log(`🔍 User ${socket.id} looking for match with interests:`, interests);
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