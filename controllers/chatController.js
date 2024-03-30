import catchAsyncError from "../utils/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorhandler.js";
import { Chat } from "../models/chatModel.js";
import { Message } from "../models/MessageModel.js";
import {
  deleteFilesFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinaryFIleUpload.js";
import { emitEvent } from "../utils/features.js";
import { NEW_MESSAGE_RECIEVED, REFETCH_CHATS } from "../constants/constants.js";
import { User } from "../models/userModel.js";

// new group
const newGroup = catchAsyncError(async (req, res, next) => {
  const { name, members } = req.body;

  if (!name) return next(new ErrorHandler("name is required", 400));

  if (!members || members.length < 1)
    return next(new ErrorHandler("atleast one member is required", 400));

  const profile = req.file || [];

  if (!profile || profile.length === 0)
    await Chat.create({
      name,
      creator: req.user,
      members: [...members, req.user],
      groupChat: true,
    });
  else {
    const result = await uploadOnCloudinary(profile.path);

    await Chat.create({
      name,
      members: [...members, req.user],
      creator: req.user,
      profilePicture: { public_id: result.public_id, url: result.secure_url },
      groupChat: true,
    });
  }

  emitEvent(req, REFETCH_CHATS, [...members, req.user]);

  res.status(201).json({
    success: true,
    message: "group created",
  });
});
// get all groups
const getAllGroups = catchAsyncError(async (req, res, next) => {
  const groups = await Chat.find({ members: req.user, groupChat: true });
  res.status(200).json({
    success: true,
    groups,
  });
});
// add members to group
const addMembers = catchAsyncError(async (req, res, next) => {
  const { chatId, members } = req.body;

  if (!chatId) return next(new ErrorHandler("please provide chat id", 400));

  if (!members.length)
    return next(new ErrorHandler("please add atleast one member", 400));

  const group = await Chat.findById(chatId);

  if (!group.groupChat)
    return next(new ErrorHandler("this is not a group chat", 400));

  if (group.creator.toString() !== req.user.toString())
    return next(
      new ErrorHandler("you are not a admin, cannot add members", 400)
    );

  group.members.push(...members);

  if (group.members.length > 50)
    return next(new ErrorHandler("Group members limit reached", 400));

  await group.save();

  emitEvent(req, REFETCH_CHATS, group.members);

  res.status(200).json({
    success: true,
    message: "member added",
    group,
  });
});
// remove members to group
const removeMembers = catchAsyncError(async (req, res, next) => {
  const { chatId, userId } = req.body;

  if (!chatId) return next(new ErrorHandler("please provide chat id", 400));

  if (!userId)
    return next(
      new ErrorHandler("please provide user id whom you want to remove", 400)
    );

  const user = await User.findById(userId).select("username");

  const group = await Chat.findById(chatId);

  if (!group.groupChat)
    return next(new ErrorHandler("this is not a group chat", 400));

  if (group.creator.toString() !== req.user.toString())
    return next(
      new ErrorHandler("you are not admin so you cannot remove members", 400)
    );

  group.members = group.members.filter(
    (member) => member.toString() !== userId.toString()
  );

  await group.save();

  emitEvent(req, REFETCH_CHATS, group.members);

  res.status(200).json({
    success: true,
    message: `${user.username} removed`,
    group,
  });
});
// leave group
const leaveGroup = catchAsyncError(async (req, res, next) => {
  const { chatId } = req.body;

  if (!chatId) return next(new ErrorHandler("please provide chat id", 400));

  const group = await Chat.findById(chatId);

  if (req.user.toString() !== group.creator.toString()) {
    group.members = group.members.filter(
      (member) => member.toString() !== req.user.toString()
    );
  } else {
    group.members = group.members.filter(
      (member) => member.toString() !== group.creator.toString()
    );

    group.creator = group.members[0];
  }

  await group.save();

  emitEvent(req, REFETCH_CHATS, group.members);

  res.status(200).json({
    success: true,
    message: "member left the group",
    group,
  });
});
// get all chats including groups
const getChats = catchAsyncError(async (req, res, next) => {
  const chats = await Chat.find({ members: req.user }).populate(
    "members",
    "username avatar"
  );

  const transformedChats = chats.map(({ _id, name, members, groupChat }) => {
    const otherMembers = members.find(
      (m) => m._id.toString() !== req.user.toString()
    );
    return {
      _id,
      groupChat,
      avatar: groupChat
        ? members.slice(0, 2).map(({ avatar }) => avatar.url)
        : otherMembers.avatar.url,
      name: groupChat ? name : otherMembers.username,
      members: members.reduce((prev, curr) => {
        if (curr._id.toString() !== req.user.toString()) {
          prev.push(curr._id);
        }
        return prev;
      }, []),
    };
  });

  res.status(200).json({
    success: true,
    chats: transformedChats,
  });
});
// send attachments
const newMessage = catchAsyncError(async (req, res, next) => {
  const { chatId } = req.body;

  if (!chatId) {
    return next(new ErrorHandler("chat id required", 401));
  }

  const [chat, me] = await Promise.all([
    Chat.findById(chatId),
    User.findById(req.user, "avatar"),
  ]);

  if (!chat) {
    return next(new ErrorHandler("chat does not exists", 401));
  }

  // handling files
  const files = req.files || [];

  if (!files.length) {
    return next(new ErrorHandler("Attachments are missing", 401));
  }
  const results = await Promise.all(
    files.map((file) => uploadOnCloudinary(file.path))
  );

  const attachments = results.map(({ public_id, secure_url }) => ({
    public_id,
    url: secure_url,
  }));

  const messageObjForDB = {
    senderId: me._id,
    attachments,
    chatId,
    content: "",
  };

  const messageObjForSocket = {
    ...messageObjForDB,
    senderId: {
      _id: me._id,
      avatar: me.avatar,
    },
    createdAt: Date.now(),
  };

  await Message.create(messageObjForDB);

  emitEvent(req, NEW_MESSAGE_RECIEVED, chat.members, messageObjForSocket);

  res.status(201).json({
    success: true,
    message: "message send successfully",
  });
});
// get all messages
const getAllMessages = catchAsyncError(async (req, res, next) => {
  const { chatId } = req.params;

  if (!chatId) return next(new ErrorHandler("please provide chat id", 400));

  const messages = await Message.find({ chatId: chatId }).populate(
    "senderId",
    "avatar"
  );
  res.status(200).json({
    success: true,
    messages,
  });
});
// delete all messages for specific chat
const deleteAllMessages = catchAsyncError(async (req, res, next) => {
  const { chatId } = req.params;

  if (!chatId) return next(new ErrorHandler("please provide chat id", 400));

  const allChatMessages = await Message.find({
    chatId,
    attachments: { $exists: true, $ne: [] },
  });

  const public_ids = [];

  allChatMessages.forEach(({ attachments }) =>
    attachments.forEach(({ public_id }) => public_ids.push(public_id))
  );

  await Promise.all([
    public_ids.forEach((public_id) => deleteFilesFromCloudinary(public_id)),
    Message.deleteMany({ chatId }),
  ]);

  res.status(200).json({
    success: true,
    message: "all messages deleted",
  });
});
// search chat
const searchChat = catchAsyncError(async (req, res, next) => {
  const { name } = req.body;

  const nameRegex = new RegExp(name, "i");

  const searchedChat = await User.findOne({
    name: nameRegex,
  });

  if (!searchedChat) {
    return next(new ErrorHandler(`chat not found`, 400));
  }

  res.status(200).json({
    success: true,
    searchedChat,
  });
});
// get chat details
const getChatDetails = catchAsyncError(async (req, res, next) => {
  const { chatId } = req.params;

  if (!chatId) return next(new ErrorHandler("Not a valid id", 404));

  const chat = await Chat.findById(chatId).populate(
    "members",
    "username avatar"
  );

  if (!chat) return next(new ErrorHandler("Chat not found", 404));

  return res.status(200).json({
    success: true,
    chat: {
      ...chat.toObject(),
      name: chat.groupChat
        ? chat.name
        : chat.members.find(
            (member) => member._id.toString() !== req.user.toString()
          ).username,
    },
  });
});

export {
  newGroup,
  newMessage,
  getChats,
  getAllGroups,
  getAllMessages,
  addMembers,
  removeMembers,
  leaveGroup,
  deleteAllMessages,
  searchChat,
  getChatDetails,
};
