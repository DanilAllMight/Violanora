class GetUsersForAdminResponseDto {
  constructor(data) {
    this.count = data.count;
    this.users = data.users;
  }
}

module.exports = GetUsersForAdminResponseDto;
