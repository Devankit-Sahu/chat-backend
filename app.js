import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();


app.use(
  cors({
    origin: process.env.CORS_FRONTEND_URL,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// import routes
import userRoutes from "./routes/userRoute.js";
import chatRoutes from "./routes/chatRoute.js";
import groupRoutes from "./routes/groupRoute.js";

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/group", groupRoutes);

app.use(errorMiddleware);

export { app };
