import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/errorMiddleware.js";
dotenv.config();

const app = express();

app.use(
  cors({
    credentials: true,
    origin: "https://chat-app-alpha-seven-93.vercel.app",
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// import routes
import userRoutes from "./routes/userRoute.js";
import chatRoutes from "./routes/chatRoute.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chats", chatRoutes);

app.use(errorMiddleware);

export { app };
