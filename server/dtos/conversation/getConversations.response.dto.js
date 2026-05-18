class ParticipantDto {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.avatar_url = user.avatar_url;
  }
}

class GetConversationsResponseDto {
  constructor(data) {
    this.id = data._id;
    this.participants = data.participants.map((p) => new ParticipantDto(p));

    this.lastMessage = data.lastMessage
      ? {
          text: data.lastMessage.text,
          senderId: data.lastMessage.senderId,
          createdAt: data.lastMessage.createdAt,
          status: data.lastMessage.status,
        }
      : null;

    this.unreadCount = data.unreadCount || {};

    this.updatedAt = data.updatedAt;
    this.createdAt = data.createdAt;
  }
}

module.exports = GetConversationsResponseDto;
