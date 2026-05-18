class CheckResponseDto {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.role = data.role;
  }
}

module.exports = CheckResponseDto;
