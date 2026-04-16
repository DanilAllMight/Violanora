const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    dialogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Dialog",
      required: true,
      index: true, // Индекс обязателен для быстрой загрузки истории
    },
    senderId: {
      type: String, // ID из Postgres (тот, кто отправил)
      required: true,
    },
    receiverId: {
      type: String, // ID из Postgres (тот, кто отправил)
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
