export interface User {
  id: string
  name: string,
  email: string
  password?: string
  created_at?: string
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister extends UserLogin {
  name: string;
}
