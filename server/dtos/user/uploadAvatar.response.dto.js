class UploadAvatarResponseDto {
  constructor(data) {
    this.message = data.message;
    this.url = data.url;
  }
}

module.exports = UploadAvatarResponseDto;
