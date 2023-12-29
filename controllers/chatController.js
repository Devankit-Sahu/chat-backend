import catchAsyncError from "../utils/catchAsyncErrors.js";
import OneToOneChat from "../models/oneToOneChatModel.js";
import { uploadOnCloudinary } from "../utils/cloudinaryFIleUpload.js";

export const chatMessage = catchAsyncError(async (req, res, next) => {
  const { message, sender_id, reciever_id } = req.body;

  let newChat;
  // handling files
  const attachmentPath = req.file?.path;

  if (!attachmentPath) {
    // Create a new chat message
    newChat = new OneToOneChat({
      sender_id,
      reciever_id,
      message,
    });
  } else {
    const attachmentObj = await uploadOnCloudinary(attachmentPath);
    const attachments = {
      public_id: attachmentObj.public_id,
      url: attachmentObj.url,
    };
    // Create a new chat message
    newChat = new OneToOneChat({
      sender_id,
      reciever_id,
      message,
      attachments,
    });
  }

  const chat = await newChat.save();

  res.status(200).json({
    success: true,
    message: "Message created",
    chat,
  });
});

export const getChats = catchAsyncError(async (req, res, next) => {
  const { sender_id, reciever_id } = req.body;
  // Find the chat documents based on sender and receiver IDs
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
  } else {
    // If no chats are found, return an empty array
    res.status(200).json({
      success: true,
      chats: [],
    });
  }
});
