import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    content: {
      type: String,
    },
    attachments: [
      {
        public_id: String,
        url: String,
      },
    ],
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
