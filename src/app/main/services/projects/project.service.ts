import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../shared/services/supabase/supabase.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Project } from '../../interfaces/project.interface';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  supabase: SupabaseClient = inject(SupabaseService).supabase;
  authService = inject(AuthService);

  currentProject = signal<Project | null>(null);

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
    return response.data as Project[];
  }

  async getProjectInfo(id: string): Promise<WritableSignal<Project | null>> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(
        `
          *,
          project_risks (
            risk:risks (*)
          )
        `
      )
      .eq('id', id)
      .single();

    if (error) {
      throw 'Sucedió un error al obtener la información del proyecto, intenta nuevamente';
    }
    this.currentProject.set({
      ownerId: data.owner,
      ...data as Project,
    });

    return this.currentProject;
  }

  async createProject(project: Project) {
    const userId = await this.authService.getUserId();
    const { data, error } = await this.supabase
      .from('projects')
      .insert({ ...project, owner: userId })
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw 'Sucedió un error al crear el proyecto, intenta nuevamente';
    }
  }
}
