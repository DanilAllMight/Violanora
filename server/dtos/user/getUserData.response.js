class GetUserDataResponse {
  constructor(data) {
    this.id = data.id;
    this.avatar_url = data.avatar_url;
    this.username = data.username;
    this.online_time = data.online_time;
  }
}

module.exports = GetUserDataResponse;
