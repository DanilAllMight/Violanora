class RegistrationRequestDto {
  constructor(data) {
    this.email = data.email;
    this.password = data.password;
    this.username = data.username;
  }
}

module.exports = RegistrationRequestDto;
