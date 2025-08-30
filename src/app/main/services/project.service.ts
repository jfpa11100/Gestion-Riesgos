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
    const email = await this.authService.getUserEmail();

    const response = await this.supabase
      .from('projects')
      .select('*')
      .or(`owner.eq.${userId},members.cs.{${email}}`)
      .order('created_at', { ascending: false });

    if (response.error) {
      return [];
    }
    console.log('Projects fetched:', response.data);
    return response.data as Project[];
  }

  async createProject(project: Project) {
    const userId = await this.authService.getUserId();
    const { data, error } = await this.supabase
      .from('projects')
      .insert({ ...project, owner: userId })
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw "Sucedió un error al crear el proyecto, intenta nuevamente";
    }
  }
}
