import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../shared/services/supabase/supabase.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Project } from '../../interfaces/project.interface';
import { Risk } from '../../interfaces/risk.interface';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  supabase: SupabaseClient = inject(SupabaseService).supabase;
  authService = inject(AuthService);

  currentProject = signal<Project | null>(null);

  async getProjects(userId:string): Promise<Project[]> {
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
            impact,
            probability,
            risks (*)
          )
        `
      )
      .eq('id', id)
      .single();

    if (error) {
      throw 'Sucedió un error al obtener la información del proyecto, intenta nuevamente';
    }
    let risks:Risk[] = []
    for (const r of data.project_risks) {
      const risk:Risk = { probability: r.probability, impact:r.impact, ...r.risks }
      risks.push(risk)
    }
    const project:Project = {risks:risks, ...data}
    this.currentProject.set(project);
    return this.currentProject;
  }

  async createProject(project: Project) {
    const userId = await this.authService.getUserId();
    const { data, error } = await this.supabase
      .from('projects')
      .insert({ ...project, owner: userId })
      .select('*')
      .single();
    if (error) {
      console.error('Error creating project:', error);
      throw 'Sucedió un error al crear el proyecto, intenta nuevamente';
    }
    return data as Project;
  }
}
