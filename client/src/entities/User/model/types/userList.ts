export interface User {
  id: number;
  email: string;
  username: string;
  avatar_url: string | null;
  online_time: string | null;
}

export interface UserListResponse {
  users: User[];
  total: number;
}
