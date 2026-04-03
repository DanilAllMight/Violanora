export interface UserAuth {
  id: number;
  email: string;
  token: string;
  username: string;
  avatar_url: string | null;
}

export interface UserSchema {
  authData?: UserAuth;
  _inited: boolean; // флаг, что мы проверили токен при загрузке
}

export interface UserData {
  username: string;
}
