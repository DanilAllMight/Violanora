class UploadAvatarRequestDto {
  constructor(body, file) {
    this.userId = body.userId;
    this.file = file;
  }
}

module.exports = UploadAvatarRequestDto;
