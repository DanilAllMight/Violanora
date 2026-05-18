const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    dialogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dialog",
      required: true,
      index: true,
    },
    senderId: {
      type: String,
      required: true,
    },
    receiverId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["sending", "sent", "read"],
      default: "sent",
    },
    attachments: [
      {
        url: { type: String, required: true },
        type: { type: String, default: "image" },
      },
    ],
  },
  { timestamps: true },
);

messageSchema.index({ text: "text" });

const Message = mongoose.model("Message", messageSchema);
module.exports = { Message };
