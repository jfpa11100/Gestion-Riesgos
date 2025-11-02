import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../shared/services/supabase/supabase.service';
import { CategoryRisk } from '../../interfaces/risk.interface';
import { ProjectService } from '../projects/project.service';
import { MitigationAction } from '../../interfaces/mitigation.interface';

@Injectable({
  providedIn: 'root',
})
export class RisksService {
  supabase: SupabaseClient = inject(SupabaseService).supabase;
  projectService = inject(ProjectService)

  getProbabilityLabel(probability?: number): string | null {
    return probability === 2 ? 'Alta'
      : probability === 1 ? 'Media'
        : probability === 0 ? 'Baja'
          : null;
  }

  getImpactLabel(impact?: number): string | null {
    return impact === 2 ? 'Alto'
      : impact === 1 ? 'Medio'
        : impact === 0 ? 'Bajo'
          : null;
  }

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

  async updateRiskMitigation(mitigationData: MitigationAction) {

    try {
      const updateData = {
        assignee: mitigationData.responsible,
        action_type: mitigationData.actionType,
        action_description: mitigationData.description,
        action_goal: mitigationData.objective,
        required_resources: mitigationData.requiredResources,
        start_date: mitigationData.startDate,
        end_date: mitigationData.endDate,
        status: mitigationData.status,
        priority: mitigationData.priority
      };

      const { data, error } = await this.supabase
        .from('project_risks')
        .update(updateData)
        .eq('risk_id', mitigationData.riskId)
        .eq('sprint_id', mitigationData.sprintId)
        .select()
        .single();

      if (error) throw error;

      return data;

    } catch (error) { throw error }
  }
}
