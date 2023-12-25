import catchAsyncError from "../utils/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorhandler.js";
import Group from "../models/groupModel.js";
import GroupChat from "../models/groupChatModel.js";
import User from "../models/userModel.js";
export const createGroup = catchAsyncError(async (req, res, next) => {
  const { groupName, groupCreater, members } = req.body;

  let newGroup = await Group.findOne({ groupName });

  if (newGroup) {
    return next(
      new ErrorHandler("Group name already exits. Please try another name", 404)
    );
  }

  newGroup = await Group.create({
    groupName,
    groupCreater,
    members,
  });

  res.status(200).json({
    success: true,
    newGroup,
  });
});

export const getAllGroups = catchAsyncError(async (req, res, next) => {
  const allGroups = await Group.find();

  res.status(200).json({
    success: true,
    allGroups,
  });
});

export const getGroupDetails = catchAsyncError(async (req, res, next) => {
  const group = await Group.findById(req.params.group_id);

  if (!group) {
    return next(
      new ErrorHandler(
        `group does not exist with group id : ${req.params.group_id}`
      )
    );
  }

  const memberDetails = await Promise.all(
    group.members.map(async (mem) => await User.findById(mem.member_id))
  );
  res.status(200).json({
    success: true,
    group,
    memberDetails,
  });
});

export const createGroupChat = catchAsyncError(async (req, res, next) => {
  const { group_id, sender_id, message } = req.body;

  const newGroupChat = await GroupChat.create({
    group_id,
    sender_id,
    message,
  });

  res.status(201).json({
    success: true,
    newGroupChat,
  });
});

export const getGroupChats = catchAsyncError(async (req, res, next) => {
  const { group_id } = req.params;

  const groupChats = await GroupChat.find({ group_id });

  res.status(201).json({
    success: true,
    groupChats,
  });
});
