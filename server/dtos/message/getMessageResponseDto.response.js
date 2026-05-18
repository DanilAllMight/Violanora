class Message {
  constructor(data) {
    this.id = data._id || data.id;
    this.text = data.text;
    this.senderId = data.senderId;
    this.receiverId = data.receiverId;
    this.status = data.status;
    this.createdAt = data.createdAt;
  }
}

class GetMessageResponseDto {
  constructor(data) {
    this.messages = data.messages.map((m) => new Message(m));
    this.dialog_id = data.dialog_id;
  }
}
