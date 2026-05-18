class UpdateUserDataRequest {
  constructor(data) {
    this.userId = data.userId;
    this.data = data.data;
  }
}

module.exports = UpdateUserDataRequest;
