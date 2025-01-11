const WebSocket = require("ws");
const mongoose = require("mongoose");
const MessageModel = require("./models/message");

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://zainabubaker2002:qLPVFU.vLk2WBWe@villagemanagement.i6egh.mongodb.net/?retryWrites=true&w=majority&appName=VillageManagement",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const server = new WebSocket.Server({ port: 8000 });
const activeConnections = new Map(); // Map to track active connections (userId -> socket)

server.on("connection", (socket) => {
  let currentUserId = null;

  console.log("Client connected");

  socket.on("message", async (data) => {
    try {
      const parsedData = JSON.parse(data);
      console.log("Received data:", parsedData);

      if (parsedData.type === "login") {
        currentUserId = parsedData.userId;
        if (!currentUserId) {
          console.error("User ID is missing in login message");
          return;
        }
        activeConnections.set(currentUserId, socket);
        console.log(`User ${currentUserId} logged in`);
      } else if (parsedData.type === "join") {
        const { userId, conversationId } = parsedData;
        if (!userId || !conversationId) {
          console.error("Invalid join message data:", parsedData);
          return;
        }
        console.log(`User ${userId} joined conversation ${conversationId}`);
      } else if (parsedData.type === "message") {
        const { conversationId, senderId, receiverId, message } = parsedData;

        if (!conversationId || !senderId || !receiverId || !message) {
          console.error("Invalid message data:", parsedData);
          return;
        }

        const newMessage = await MessageModel.create({
          conversationId,
          senderId,
          receiverId,
          message,
          timestamp: new Date(),
        });

        console.log("Message saved to database:", newMessage);

        const receiverSocket = activeConnections.get(receiverId);
        if (receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
          receiverSocket.send(
            JSON.stringify({
              type: "message",
              conversationId,
              senderId,
              receiverId,
              message,
              timestamp: newMessage.timestamp,
            })
          );
          console.log(`Message sent to receiver: ${receiverId}`);
        } else {
          console.log(`Receiver ${receiverId} is offline`);
        }

        if (socket.readyState === WebSocket.OPEN) {
          socket.send(
            JSON.stringify({
              type: "message",
              conversationId,
              senderId,
              receiverId,
              message,
              timestamp: newMessage.timestamp,
            })
          );
        }
      } else {
        console.error("Unknown message type:", parsedData.type);
      }
    } catch (err) {
      console.error("Error processing message:", err.message);
    }
  });

  socket.on("close", () => {
    if (currentUserId) {
      activeConnections.delete(currentUserId);
      console.log(`User ${currentUserId} disconnected`);
    }
  });
});

console.log("WebSocket server running on ws://localhost:8000");
