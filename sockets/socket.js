import {
  CONNECTION,
  DISCONNECT,
  NEW_MESSAGE,
  NEW_MESSAGE_NOTIFICATION,
  NEW_MESSAGE_RECIEVED,
  ONLINEUSERS,
  TYPING_START,
  TYPING_STOP,
} from "../constants/constants.js";
import { getSocketIds } from "../lib/helper.js";
import { Chat } from "../models/chatModel.js";
import { Message } from "../models/MessageModel.js";
import { User } from "../models/userModel.js";

const userSocketIds = new Map();
const onlineUsers = new Set();

export const socketHandler = (io) => {
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
};

export { userSocketIds };
