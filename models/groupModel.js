import { Schema, model } from "mongoose";

const groupSchema = new Schema(
  {
    groupName: {
      type: String,
      required: true,
      unique: true,
    },
    groupCreater: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    members: [
      {
        member_id: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  { timestamps: true }
);

export default model("Group", groupSchema);
