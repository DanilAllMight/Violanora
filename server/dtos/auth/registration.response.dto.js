class RegistrationResponseDto {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.role = data.role;
    this.access_token = data.access_token;
    this.refresh_token = data.refresh_token;
  }
}

module.exports = RegistrationResponseDto;
