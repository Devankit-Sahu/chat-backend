import { Schema, model } from "mongoose";

const groupChatSchema = new Schema(
  {
    group_id: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    sender_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    message: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default model("GroupChat", groupChatSchema);

