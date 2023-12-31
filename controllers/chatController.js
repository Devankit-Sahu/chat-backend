import catchAsyncError from "../utils/catchAsyncErrors.js";
import OneToOneChat from "../models/oneToOneChatModel.js";
import { uploadOnCloudinary } from "../utils/cloudinaryFIleUpload.js";
import ErrorHandler from "../utils/errorhandler.js";

// new chat
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

// get all chats controller
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

// delete all chats
export const deleteChats = catchAsyncError(async (req, res, next) => {
  const { sender_id, reciever_id } = req.params;
  // Find the chat documents based on sender and receiver IDs
  const deleteResult = await OneToOneChat.deleteMany({
    $or: [
      { sender_id, reciever_id },
      { sender_id: reciever_id, reciever_id: sender_id },
    ],
  });

  if (deleteResult && deleteResult.deletedCount > 0) {
    console.log(deleteResult);
    res.status(200).json({
      success: true,
      message: "chats deleted successfully",
    });
  } else {
    // No documents were deleted
    res.status(404).json({
      success: false,
      message: "No chats found",
    });
  }
});
// delete single chat
export const deleteSingleChat = catchAsyncError(async (req, res, next) => {
  const { chat_id } = req.params;
  // Find the chat documents based on sender and receiver IDs
  const chat = await OneToOneChat.findById(chat_id);

  if (!chat) {
    return next(new ErrorHandler("Chat not found", 404));
  }

  if (chat.attachments && !chat.attachments.public_id) {
    await OneToOneChat.deleteOne({ _id: chat_id });
    res.status(200).json({
      success: true,
      message: "chat deleted successfully",
    });
  } else {
    // deleting attachments from cloudinary
    await cloudinary.v2.uploader.destroy(chat.attachments.public_id);
    res.status(200).json({
      success: true,
      message: "chat deleted successfully",
    });
  }
});
