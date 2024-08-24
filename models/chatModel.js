import mongoose, { Types } from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    members: [
      {
        type: Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    name: String,
    creator: { type: Types.ObjectId, ref: "User" },
    profile: {
      public_id: String,
      url: String,
    },
    groupChat: { type: Boolean, default: false },
    latestMessage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Chat = mongoose.model("Chat", chatSchema);
