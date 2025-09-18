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
  public supabase: SupabaseClient = createClient(
    environment.DATABASE_URL || process.env['SUPABASE_URL']!,
    environment.API_KEY || process.env['API_KEY']!,
  );
}
