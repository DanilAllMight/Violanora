class GetMessagesRequestDto {
  constructor(params, query) {
    this.senderId = String(params.senderId);
    this.receiverId = String(params.receiverId);
    this.limit = parseInt(query.limit) || 20;
    this.before = query.before ? new Date(query.before) : null;
  }
}

module.exports = GetMessagesRequestDto;
