import catchAsyncError from "../utils/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorhandler.js";
import { User } from "../models/userModel.js";
import { Chat } from "../models/chatModel.js";
import { FriendRequest } from "../models/friendRequestModel.js";
import { emitEvent } from "../utils/features.js";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/constants.js";

// my details
const myDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user);
  res.status(200).json({
    success: true,
    user,
  });
});
// update my details
const updateMyDetails = catchAsyncError(async (req, res, next) => {
  await User.findByIdAndUpdate(
    { _id: req.user },
    { $set: { about: req.body.about, username: req.body.username } },
    { new: true }
  );
  res.status(200).json({
    success: true,
    message: "Details updated successfully",
  });
});
// get my friends
const allMyFriends = catchAsyncError(async (req, res, next) => {
  const myChats = await Chat.find({
    members: req.user,
    groupChat: false,
  }).populate("members", "username avatar");

  if (!myChats) return next(new ErrorHandler("freinds not found", 400));

  let myFriends = [];

  myChats.forEach((c) => {
    const friends = c.members.filter(
      (member) => member._id.toString() !== req.user.toString()
    );
    myFriends.push(...friends);
  });

  res.status(200).json({
    success: true,
    myFriends,
  });
});
// send friend request
const sendFriendRequest = catchAsyncError(async (req, res, next) => {
  const { reciever_id } = req.body;

  if (!reciever_id) return next(new ErrorHandler("provide reciever id", 400));

  const isRequestExist = await FriendRequest.findOne({
    $or: [
      { sender_id: req.user, reciever_id },
      { sender_id: reciever_id, reciever_id: req.user },
    ],
  });

  if (isRequestExist)
    return next(new ErrorHandler("friend request sent already", 400));

  await FriendRequest.create({
    sender_id: req.user,
    reciever_id,
  });

  emitEvent(req, NEW_REQUEST, [reciever_id], { message: "hii" });

  res.status(201).json({ success: true, message: "Friend request sent" });
});
// accept friend request
const acceptFriendRequest = catchAsyncError(async (req, res, next) => {
  const { requestId, accept } = req.body;

  if (!requestId) return next(new ErrorHandler("provide request id", 400));

  const isFriendReqExist = await FriendRequest.findById(requestId)
    .populate("sender_id", "username")
    .populate("reciever_id", "username");

  if (!isFriendReqExist)
    return next(new ErrorHandler("no friend request found", 400));

  if (isFriendReqExist.reciever_id._id.toString() !== req.user.toString())
    return next(
      new ErrorHandler("You are not authorized to accept this request", 401)
    );

  if (!accept) {
    await isFriendReqExist.deleteOne();
    return res
      .status(200)
      .json({ success: true, message: "Friend request rejected" });
  }

  const members = [
    isFriendReqExist.sender_id._id,
    isFriendReqExist.reciever_id._id,
  ];

  //creating chat between them
  await Chat.create({
    members,
  });

  await isFriendReqExist.deleteOne();

  emitEvent(req, REFETCH_CHATS, members);

  res.status(200).json({ success: true, message: "Friend request accept" });
});
// search user
const searchUser = catchAsyncError(async (req, res, next) => {
  const { username = "" } = req.query;

  const myChats = await Chat.find({ groupChat: false, members: req.user });

  const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

  let allUsersExceptMeAndFriends = await User.find({
    _id: { $nin: [...allUsersFromMyChats, req.user] },
    username: { $regex: username, $options: "i" },
  });

  allUsersExceptMeAndFriends = await Promise.all(
    allUsersExceptMeAndFriends.map(async (u) => {
      const friendRequest = await FriendRequest.findOne({
        $or: [
          {
            reciever_id: u._id,
            sender_id: req.user,
          },
          { sender_id: u._id, reciever_id: req.user },
        ],
      });
      u.isFreindRequestExist = friendRequest ? true : false;
      return u;
    })
  );

  const users = allUsersExceptMeAndFriends.map(
    ({ _id, username, avatar, isFreindRequestExist }) => ({
      _id,
      username,
      avatar: avatar.url,
      isFreindRequestExist,
    })
  );

  return res.status(200).json({
    success: true,
    users,
  });
});
// get request notification
const requestNotificaton = catchAsyncError(async (req, res, next) => {
  const requests = await FriendRequest.find({ reciever_id: req.user }).populate(
    "sender_id",
    "username avatar"
  );

  res.status(200).json({
    success: true,
    requests,
  });
});

export {
  myDetails,
  updateMyDetails,
  allMyFriends,
  sendFriendRequest,
  acceptFriendRequest,
  searchUser,
  requestNotificaton,
};
