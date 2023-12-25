import { Schema, model } from "mongoose";

const groupMemberSchema = new Schema(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group",
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default model("GroupMember", groupMemberSchema);
