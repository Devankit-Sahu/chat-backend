import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import connectDatabase from "./db/database.js";
import cloudinary from "cloudinary";
import { Server } from "socket.io";
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
    origin: [process.env.FRONTEND_URL],
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
import { socketHandler } from "./sockets/socket.js";

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat", chatRoutes);

const server = app.listen(process.env.PORT || 8080, () => {
  console.log("server is runing in port at 8080");
});

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL],
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

socketHandler(io);

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
