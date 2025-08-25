import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../shared/services/supabase/supabase.service';
import { Project } from '../interfaces/project.interface';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  supabase: SupabaseClient = inject(SupabaseService).supabase;
  authService = inject(AuthService);

  async getProjects(): Promise<Project[]> {
    const userId = await this.authService.getUserId();
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('owner', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
    return data as Project[];
  }
}
