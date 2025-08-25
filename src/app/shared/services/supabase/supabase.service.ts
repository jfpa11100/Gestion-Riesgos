import { Injectable } from '@angular/core'
import {
  AuthSession,
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js'
import { environment } from '../../../../environments/environment.development'
import { LoginResponse, SignUpResponse } from '../../../auth/interfaces/login-response.interface'
import { UserLogin, UserRegister } from '../../../auth/interfaces/user.interface'


@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient = createClient(environment.DATABASE_URL, environment.API_KEY)
  _session: AuthSession | null = null


  async getSession() {
    const { data } = await this.supabase.auth.getSession()
    this._session = data.session
    return this._session
  }

  async login(user: UserLogin): Promise<LoginResponse> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    })
    if (error) {
      return {
        success: false,
        message: 'Credenciales incorrectas',
      }
    }
    console.log('Login successful:', data)
    return {
      success: true,
    }
  }

  async register(user: UserRegister): Promise<SignUpResponse> {
    const { data, error } = await this.supabase.auth.signUp({
      email: user.email,
      password: user.password,
    })
    if (error) {
      if (error.message === 'User already registered') {
        return {
          success: false,
          message: 'Correo ya se encuentra registrado',
        }
      }
      return {
        success: false,
        message: 'Ocurrió un error al registrar el usuario, intente de nuevo',
      }
    }
    return {
      success: true,
    }
  }

  signOut() {
    return this.supabase.auth.signOut()
  }
}
