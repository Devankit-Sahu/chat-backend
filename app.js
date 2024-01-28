import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import corsOptions from "./config/corsOptions.js";
import credentials from "./middlewares/credentials.js";
dotenv.config();

const app = express();

app.use(credentials);

app.use(cors(corsOptions));
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
