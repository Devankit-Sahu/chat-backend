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
    limit: {
      type: Number,
      default: 5,
      required: true,
    },
    image: {
      type: String,
      default: "This is an image",
    },
  },
  { timestamps: true }
);

export default model("Group", groupSchema);
