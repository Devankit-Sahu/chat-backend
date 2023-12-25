import catchAsyncError from "../utils/catchAsyncErrors.js";
import OneToOneChat from "../models/oneToOneChatModel.js";

export const chatMessage = catchAsyncError(async (req, res, next) => {
  const { message, sender_id, reciever_id } = req.body;
  // Create a new chat message
  const newChat = new OneToOneChat({
    sender_id,
    reciever_id,
    message,
  });

  const chat = await newChat.save();

  res.status(200).json({
    success: true,
    message: "Message created",
    chat,
  });
});

export const getChats = catchAsyncError(async (req, res, next) => {
  const { sender_id, reciever_id } = req.params;

  // Find the chat document based on sender and receiver IDs
  const chats = await OneToOneChat.find({
    $or: [
      { sender_id, reciever_id },
      { sender_id: reciever_id, reciever_id: sender_id },
    ],
  });

  if (chats) {
    res.status(200).json({
      success: true,
      chats,
    });
  }
});
