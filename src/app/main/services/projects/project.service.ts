import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../shared/services/supabase/supabase.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Project } from '../../interfaces/project.interface';
import { Risk } from '../../interfaces/risk.interface';
import { EmailService } from '../email/email.service';
import { Sprint } from '../../interfaces/sprint.interface';

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
          project_sprints (*, project_risks (*, risks (*)))
        `
      )
      .eq('id', id)
      .single();
    if (error || !data) {
      throw 'Sucedió un error al obtener la información del proyecto, intenta nuevamente';
    }
    const project:Project = this.parseDataToProject(data)
    this.currentProject.set(project);
    return this.currentProject;
  }

  parseDataToProject(project_data:any):Project{
    let sprints:Sprint[] = []
    let risks: Risk[]
    for (const sprint of project_data.project_sprints) {
      risks = []
      for (const risk of sprint.project_risks) {
        risks.push({ id:risk.risk_id, sprintId:risk.sprint_id, risk: risk.risks.risk, category:risk.risks.category, ...risk })
      }
      sprints.push({ risks, prioritizationTechnique:sprint.prioritization_technique, ...sprint })
    }
    return { sprints, ...project_data }
  }

  async createProject(project: Project) {
    for (const email of project.members!) {
      // If user doesn't exists, invite him
      if (!await this.authService.userExists(email)) {
        this.emailService.sendProjectInvitation(project.name, this.authService.getUserName(), email).catch(e => { throw e })
      }
    }
    const userId = this.authService.getUserId();
    let {sprints, ...toCreateProject} = project
    const { data, error } = await this.supabase
      .from('projects')
      .insert({ ...toCreateProject, owner: userId })
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

  async createSprint(project: Project):Promise<Sprint> {
    const { data, error } = await this.supabase.from('project_sprints').insert({ project_id: project.id, sprint: project.sprints.length + 1 }).select('*').single()
    if (error || !data) throw error
    return { ...data, risks:[], prioritizationTechnique:data.prioritization_technique }
  }

  async saveSprintDate(sprint:Sprint, date:Date):Promise<Date>{
    const {data, error } = await this.supabase
      .from("project_sprints")
      .update({ mitigation_date: date })
      .eq("id", sprint.id).select('*').single()

    if (error || !data) throw error;
    return date;
  }

  async changePrioritizationTechnique(sprint:Sprint, technique: 'quantitative' | 'qualitative'){
    const { error } = await this.supabase.from("project_sprints").update({prioritization_technique:technique}).eq("id", sprint.id)
    if (error) throw error;
  }
}
