import dotenv from "dotenv";
import connectDatabase from "./db/database.js";
import { app } from "./app.js";
import { Server } from "socket.io";
import User from "./models/userModel.js";
import oneToOneChat from "./models/oneToOneChatModel.js";

dotenv.config();

// database connectivity
connectDatabase()
  .then(() => {
    // handling uncaughtException error
    process.on("uncaughtException", (error) => {
      console.log(error.name, error.message);
      console.log("There is an uncaughtException occured..");
      process.exit(1);
    });

    const server = app.listen(process.env.PORT || 8080, () => {
      console.log("server is runing in port at 8080");
    });

    const io = new Server(server, {
      cors: {
        origin: [process.env.CORS_FRONTEND_URL],
      },
    });

    io.on("connection", async (socket) => {
      console.log("connection established");
      console.log(`User connected: ${socket.handshake.auth.id}`);
      await User.findByIdAndUpdate(
        { _id: socket.handshake.auth.id },
        { $set: { isOnline: true } }
      );
      socket.broadcast.emit("online", { id: socket.handshake.auth.id });

      socket.on("newMessage", function (data) {
        socket.broadcast.emit("receiveMessage", data);
      });

      socket.on("getAllChats", async function (data) {
        const chats = await oneToOneChat.find({
          $or: [
            { sender_id: data.sender_id, reciever_id: data.reciever_id },
            { sender_id: data.reciever_id, reciever_id: data.sender_id },
          ],
        });
        socket.emit("loadAllChats", { chats });
      });

      // disconnecting socket
      socket.on("disconnect", async function () {
        console.log("connection disconnect");
        console.log(`User disconnected: ${socket.handshake.auth.id}`);
        await User.findByIdAndUpdate(
          { _id: socket.handshake.auth.id },
          { $set: { isOnline: false } }
        );
        socket.broadcast.emit("offline", { id: socket.handshake.auth.id });
      });
    });
        
    // handling unhandleRejection error
    process.on("unhandledRejection", (error) => {
      console.log(error.name, error.message);
      console.log("UnhandledRejection occured.. Shutting down...");
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((error) => {
    console.log("Error : ", error);
  });
