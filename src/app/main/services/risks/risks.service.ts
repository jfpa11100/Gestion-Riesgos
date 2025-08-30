import { inject, Injectable } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../shared/services/supabase/supabase.service';
import { CategoryRisk } from '../../interfaces/risk.interface';

@Injectable({
  providedIn: 'root',
})
export class RisksService {
  supabase: SupabaseClient = inject(SupabaseService).supabase;

  async getRisksByCategory(): Promise<CategoryRisk[]> {
    const { data, error } = await this.supabase.from('categories')
    .select(`
      category,
      topic,
      risks:risks (*)
    `);

    if (error) {
      throw 'Error al obtener los riesgos, intenta de nuevo';
    }
    return data as CategoryRisk[];
  }
}
