import { inject, Injectable } from "@angular/core";
import { AuthSession, SupabaseClient } from "@supabase/supabase-js";
import { LoginResponse, SignUpResponse } from "../interfaces/login-response.interface";
import { User, UserLogin, UserRegister } from "../interfaces/user.interface";
import { SupabaseService } from "../../shared/services/supabase/supabase.service";

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  supabase: SupabaseClient = inject(SupabaseService).supabase;

  _session: AuthSession | null = null;

  async getSession() {
    if (!this._session){
      const { data } = await this.supabase.auth.getSession();
      this._session = data.session;
    }
    return this._session;
  }

  getUserId(): string {
    const value = JSON.parse(localStorage.getItem('sb-fqnxvpkbthybqnscctqq-auth-token')!);
    return value.user.id;
  }

  getUserName(): string {
    const value = JSON.parse(localStorage.getItem('sb-fqnxvpkbthybqnscctqq-auth-token')!);
    return value.user.email;
  }

  async getUserEmail(): Promise<string> {
    if (!this._session) {
      await this.getSession();
    }
    return this._session!.user.email!;
  }

  async login(user: UserLogin): Promise<LoginResponse> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: user.email.toLowerCase(),
      password: user.password,
    });
    if (error) {
      return {
        success: false,
        message: 'Credenciales incorrectas',
      };
    }
    return {
      success: true,
    };
  }

  async register(user: UserRegister): Promise<SignUpResponse> {
    const { data, error } = await this.supabase.auth.signUp({
      email: user.email.toLowerCase(),
      password: user.password,
    });
    if (error) {
      if (error.message === 'User already registered') {
        return {
          success: false,
          message: 'Correo ya se encuentra registrado',
        };
      }
      return {
        success: false,
        message: 'Ocurrió un error al registrar el usuario, intente de nuevo',
      };
    }
    try {
      await this.createProfile({
        id: data.user?.id,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      return {
        success: false,
        message: 'Ocurrió un error al registrar el usuario, intente de nuevo',
      };
    }
    return {
      success: true,
    };
  }

  async createProfile(user: User) {
    const { error } = await this.supabase
      .from('users')
      .insert({id:user.id, name: user.name, email: user.email })
    if (error) {
      throw error;
    }
  }

  async userExists(email: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('users')
      .select('id')
      .eq('email', email);
    if (error) {
      return false;
    }
    return !!data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) {
      console.log("Sign out error:", error)
      return
    }
    this._session = null;
  }
}
