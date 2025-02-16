import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import universityRoutes from "./routes/universityRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import accommodationRoutes from "./routes/accommodationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from './routes/messageRoutes.js';
import conversationRoutes from './routes/conversationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "localhost";

const corsOptions = {
  origin: ['https://mycampushome.netlify.app', 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,  // Enable credentials (cookies, authorization headers, etc)
  optionsSuccessStatus: 200
};

// Middleware applied to all routes
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/listing", listingRoutes);
app.use("/api/accommodation", accommodationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);




// Set up the HTTP server and Socket.IO
const server = http.createServer(app); // `app` is your Express app instance
const io = new Server(server, {
  cors: {
    origin: 'https://mycampushome.netlify.app/', // Adjust based on your frontend's URL
    methods: ['GET', 'POST'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('sendMessage', (messageData) => {
    socket.to(messageData.receiver).emit('receiveMessage', messageData);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
