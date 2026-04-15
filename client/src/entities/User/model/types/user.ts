export interface UserAuth {
  id: number;
  email: string;
  access_token: string;
  refresh_token: string;
  username: string;
  avatar_url: string | null;
  role: string;
}

export interface UserSchema {
  authData?: UserAuth;
  _inited: boolean; // флаг, что мы проверили токен при загрузке
}

export interface UserData {
  username: string;
}
