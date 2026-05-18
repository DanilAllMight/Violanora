const mongoose = require("mongoose");

const dialogSchema = new mongoose.Schema(
  {
    participants: {
      type: [String],
      required: true,
      index: true,
    },
    lastMessage: {
      text: String,
      senderId: String,
      createdAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ["sent", "sending", "read"],
        default: "sent",
      },
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    matchKey: { type: String, unique: true, required: true },
  },
  { timestamps: true },
);

const Dialog = mongoose.model("Dialog", dialogSchema);
module.exports = { Dialog };
