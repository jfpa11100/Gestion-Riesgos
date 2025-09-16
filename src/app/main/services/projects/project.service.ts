import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../shared/services/supabase/supabase.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Project } from '../../interfaces/project.interface';
import { Risk } from '../../interfaces/risk.interface';
import { EmailService } from '../email/email.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  supabase: SupabaseClient = inject(SupabaseService).supabase;
  emailService = inject(EmailService);
  authService = inject(AuthService);

  currentProject = signal<Project | null>(null);

  async getProjects(userId: string): Promise<Project[]> {
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
            sprint (*),
            risks (*)
          ),
          project_sprints (*)
        `
      )
      .eq('id', id)
      .single();
    if (error) {
      throw 'Sucedió un error al obtener la información del proyecto, intenta nuevamente';
    }
    let risks: Risk[] = []
    for (const r of data.project_risks) {
      console.log("r ",r)
      const risk: Risk = { probability: r.probability, impact: r.impact, sprint:r.sprint, ...r.risks }
      risks.push(risk)
    }
    const project: Project = { risks: risks, sprints: data.project_sprints, ...data }
    this.currentProject.set(project);
    return this.currentProject;
  }

  async createProject(project: Project) {
    for (const email of project.members!) {
      // If user doesn't exists, invite him
      if (!await this.authService.userExists(email)) {
        this.emailService.sendProjectInvitation(project.name, this.authService.getUserName(), email).catch(e => { throw e })
      }
    }
    const userId = this.authService.getUserId();
    const { data, error } = await this.supabase
      .from('projects')
      .insert({ ...project, owner: userId })
      .select('*')
      .single();
    if (error) {
      throw 'Sucedió un error al crear el proyecto, intenta nuevamente';
    }
    const { error: sprintError } = await this.supabase
      .from('project_sprints')
      .insert({ sprint: 1, project_id: data.id })
    if (sprintError) {
      throw 'Sucedió un error al crear el proyecto, intenta nuevamente';
    }
    return data as Project;
  }
}
