import { Injectable } from '@angular/core';
import {
  createClient,
  SupabaseClient,
} from '@supabase/supabase-js';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public supabase: SupabaseClient = SupabaseService.createClient();

  static createClient(){
    return createClient(
      environment.DATABASE_URL,
      environment.API_KEY,
    );
  }
}
