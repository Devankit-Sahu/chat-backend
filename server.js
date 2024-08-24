import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import connectDatabase from "./db/database.js";
import cloudinary from "cloudinary";
import { Server } from "socket.io";
import { Message } from "./models/MessageModel.js";
import { socketAuthenticator } from "./middlewares/authMiddleware.js";

dotenv.config();

// database connectivity
await connectDatabase();

// configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();

// middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// import routes
import authRoutes from "./routes/authRoute.js";
import userRoutes from "./routes/userRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import { getSocketIds } from "./lib/helper.js";
import {
  CONNECTION,
  DISCONNECT,
  NEW_MESSAGE,
  NEW_MESSAGE_RECIEVED,
  NEW_MESSAGE_NOTIFICATION,
  TYPING_START,
  TYPING_STOP,
  ONLINEUSERS,
} from "./constants/constants.js";
import { User } from "./models/userModel.js";
import { Chat } from "./models/chatModel.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat", chatRoutes);

const server = app.listen(process.env.PORT || 8080, () => {
  console.log("server is runing in port at 8080");
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", process.env.FRONTEND_URL],
    credentials: true,
  },
});

app.set("io", io);

io.use((socket, next) => {
  cookieParser()(
    socket.request,
    socket.request.res,
    async (err) => await socketAuthenticator(err, socket, next)
  );
});

const userSocketIds = new Map();
const onlineUsers = new Set();
// create socket connection
io.on(CONNECTION, async (socket) => {
  console.log("connection established");
  const user = socket.user;
  userSocketIds.set(user._id.toString(), socket.id);
  onlineUsers.add(user._id.toString());

  io.emit(ONLINEUSERS, Array.from(onlineUsers));

  // new message
  socket.on(
    NEW_MESSAGE,
    async ({ senderId, chatId, content, members, createdAt }) => {
      // storing message in db
      try {
        await Chat.findByIdAndUpdate(chatId, {
          $set: { latestMessage: content },
        });
        await Message.create({
          senderId,
          chatId,
          content,
        });
      } catch (error) {
        throw error;
      }
      const sender_avatar = await User.findById(senderId, "avatar -_id");
      const membersSocketId = getSocketIds(members);
      io.to(membersSocketId).emit(NEW_MESSAGE_RECIEVED, {
        senderId: {
          _id: senderId,
          avatar: sender_avatar,
        },
        chatId,
        content,
        createdAt,
      });
      const membersExceptSender = members.filter((m) => m !== senderId);
      const membersSocketIdExceptSender = getSocketIds(membersExceptSender);
      io.to(membersSocketIdExceptSender).emit(NEW_MESSAGE_NOTIFICATION, {
        chatId,
      });
    }
  );

  // typing indicator
  socket.on(TYPING_START, ({ members, chatId }) => {
    const membersSocketId = getSocketIds(members);
    io.to(membersSocketId).emit(TYPING_START, { chatId, members });
  });

  socket.on(TYPING_STOP, ({ members, chatId }) => {
    const membersSocketId = getSocketIds(members);
    io.to(membersSocketId).emit(TYPING_STOP, { chatId });
  });

  // disconnecting socket
  socket.on(DISCONNECT, async function () {
    console.log("connection disconnect");
    userSocketIds.delete(user._id.toString());
    onlineUsers.delete(user._id.toString());
    io.emit(ONLINEUSERS, Array.from(onlineUsers));
  });
});

app.use(errorMiddleware);

// handling uncaughtException error
process.on("uncaughtException", (error) => {
  console.log(error.name, error.message);
  console.log("There is an uncaughtException occured..");
  process.exit(1);
});

// handling unhandleRejection error
process.on("unhandledRejection", (error) => {
  console.log(error.name, error.message);
  console.log("UnhandledRejection occured.. Shutting down...");
  server.close(() => {
    process.exit(1);
  });
});

export { userSocketIds };
