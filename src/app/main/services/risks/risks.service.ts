import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../shared/services/supabase/supabase.service';
import { CategoryRisk, Risk } from '../../interfaces/risk.interface';
import { ProjectService } from '../projects/project.service';

@Injectable({
  providedIn: 'root',
})
export class RisksService {
  supabase: SupabaseClient = inject(SupabaseService).supabase;
  projectService = inject(ProjectService)

  async getRisksByCategory(): Promise<CategoryRisk[]> {
    const { data, error } = await this.supabase.from('categories').select(`
      category,
      topic,
      risks:risks (*)
    `);

    if (error) {
      throw 'Error al obtener los riesgos, intenta de nuevo';
    }
    return data as CategoryRisk[];
  }

  async addRisksToSprint(sprintId:string, riskIds: string[],): Promise<void> {
    const { error } = await this.supabase.from('project_risks').insert(
      riskIds.map((riskId) => ({
        risk_id: riskId,
        sprint_id:sprintId
      }))
    );
    console.log(error)
    if (error) {
      throw 'Error al agregar riesgos al proyecto, intenta de nuevo';
    }
  }

  async updateRiskProbability(sprintId: string, riskId: string, probability: number) {
    const { error } = await this.supabase.from('project_risks')
    .update({ probability }).eq('sprint_id', sprintId).eq('risk_id', riskId);
    if (error) {
      throw 'Error al actualizar el riesgo, intenta de nuevo';
    }
  }

  async updateRiskImpact(sprintId: string, riskId: string, impact: number) {
    const { error } = await this.supabase.from('project_risks')
    .update({ impact }).eq('sprint_id', sprintId).eq('risk_id', riskId);
    if (error) {
      throw 'Error al actualizar el riesgo, intenta de nuevo';
    }
  }

  async deleteRisk(riskId: string){
    const { error } = await this.supabase.from('project_risks').delete().eq('risk_id', riskId);
    if (error) {
      throw error;
    }
  }
}
