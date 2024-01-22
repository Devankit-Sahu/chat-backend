import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(
  cors({
    origin: "https://chat-frontend-sage.vercel.app",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// import routes
import userRoutes from "./routes/userRoute.js";
import chatRoutes from "./routes/chatRoute.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chats", chatRoutes);

app.use(errorMiddleware);

export { app };
