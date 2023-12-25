import catchAsyncError from "../utils/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorhandler.js";
import Group from "../models/groupModel.js";
import GroupChat from "../models/groupChatModel.js";
import User from "../models/userModel.js";
import GroupMember from "../models/groupMemberModel.js";
import mongoose from "mongoose";

export const createGroup = catchAsyncError(async (req, res, next) => {
  const { groupName, groupCreater, limit } = req.body;

  const isGroupExists = await Group.findOne({ groupName });

  if (isGroupExists) {
    return next(
      new ErrorHandler(
        "Group name already in use. Please try another name",
        404
      )
    );
  }

  const newGroup = await Group.create({
    groupName,
    groupCreater,
    limit,
  });

  res.status(200).json({
    success: true,
    newGroup,
  });
});

export const getMembers = catchAsyncError(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $lookup: {
        from: "groupmembers",
        localField: "_id",
        foreignField: "memberId",
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: [
                      "$groupId",
                      new mongoose.Types.ObjectId(req.body.group_id),
                    ],
                  },
                ],
              },
            },
          },
        ],
        as: "member",
      },
    },
    {
      $match: {
        _id: {
          $nin: [new mongoose.Types.ObjectId(req.user._id)],
        },
      },
    },
  ]);
console.log(users);
  res.status(200).json({
    success: true,
    users,
  });
});


export const addMembersToGroup = catchAsyncError(async (req, res, next) => {
  const { members, group_id, limit } = req.body;

  const isGroupExists = await Group.findById(group_id);

  await GroupMember.deleteMany({
    groupId: isGroupExists._id,
  });

  const membersList = [];
  if (members.length > limit) {
    return next(
      new ErrorHandler(`You cannot add more than ${limit} members`),
      301
    );
  }

  for (let i = 0; i < members.length; i++) {
    membersList.push({
      groupId: isGroupExists._id,
      memberId: members[i],
    });
  }

  await GroupMember.insertMany(membersList);

  res.status(200).json({
    success: true,
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

  res.status(200).json({
    success: true,
    group,
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
