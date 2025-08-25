export interface User {
  id?: string
  name: string,
  email: string
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserRegister extends UserLogin {
  name: string;
}
