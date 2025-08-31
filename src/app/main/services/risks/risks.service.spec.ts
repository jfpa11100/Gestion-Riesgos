import { TestBed } from '@angular/core/testing';
import { RisksService } from './risks.service';
import { SupabaseService } from '../../../shared/services/supabase/supabase.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { CategoryRisk } from '../../interfaces/risk.interface';

describe('RisksService', () => {
  let service: RisksService;
  let supabaseMock: jasmine.SpyObj<SupabaseClient>;

  beforeEach(() => {
    // Creamos un mock del cliente supabase
    supabaseMock = jasmine.createSpyObj('SupabaseClient', ['from']);

    // Mock para el método .from()
    const fromMock = jasmine.createSpyObj('from', ['select', 'insert', 'update', 'eq']);
    supabaseMock.from.and.returnValue(fromMock);

    // Inyectamos un SupabaseService falso
    TestBed.configureTestingModule({
      providers: [
        RisksService,
        {
          provide: SupabaseService,
          useValue: { supabase: supabaseMock },
        },
      ],
    });

    service = TestBed.inject(RisksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getRisksByCategory', () => {
    it('should return data when query is successful', async () => {
      const fakeData: CategoryRisk[] = [
        { category: 'Seguridad', topic: 'Infraestructura', risks: [] },
      ];

      // Configuramos el mock
      (supabaseMock.from('categories').select as jasmine.Spy).and.returnValue(
        Promise.resolve({ data: fakeData, error: null })
      );

      const result = await service.getRisksByCategory();
      expect(result).toEqual(fakeData);
    });

    it('should throw error when query fails', async () => {
      (supabaseMock.from('categories').select as jasmine.Spy).and.returnValue(
        Promise.resolve({ data: null, error: 'Some error' })
      );

      await expectAsync(service.getRisksByCategory()).toBeRejectedWith(
        'Error al obtener los riesgos, intenta de nuevo'
      );
    });
  });

  describe('addRisksToProject', () => {
    it('should insert risks successfully', async () => {
      (supabaseMock.from('project_risks').insert as jasmine.Spy).and.returnValue(
        Promise.resolve({ error: null })
      );

      await service.addRisksToProject('project123', ['risk1', 'risk2']);
      expect(supabaseMock.from).toHaveBeenCalledWith('project_risks');
    });

    it('should throw error when insert fails', async () => {
      (supabaseMock.from('project_risks').insert as jasmine.Spy).and.returnValue(
        Promise.resolve({ error: 'Insert error' })
      );

      await expectAsync(
        service.addRisksToProject('project123', ['risk1'])
      ).toBeRejectedWith('Error al agregar riesgos al proyecto, intenta de nuevo');
    });
  });

  describe('updateRiskProbability', () => {
    it('should update risk probability successfully', async () => {
      // Mock chain: .update() → .eq() → .eq()
      (supabaseMock.from('project_risks').update as jasmine.Spy).and.returnValue({
        eq: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      });

      await service.updateRiskProbability('p1', 'r1', 0.8);
      expect(supabaseMock.from).toHaveBeenCalledWith('project_risks');
    });

    it('should throw error when update fails', async () => {
      (supabaseMock.from("project_risks").update as jasmine.Spy).and.returnValue({
        eq: () => ({
          eq: () => Promise.resolve({ error: 'Update error' }),
        }),
      });

      await expectAsync(
        service.updateRiskProbability('p1', 'r1', 0.8)
      ).toBeRejectedWith('Error al actualizar el riesgo, intenta de nuevo');
    });
  });

  describe('updateRiskImpact', () => {
    it('should update risk impact successfully', async () => {
      (supabaseMock.from('project_risks').update as jasmine.Spy).and.returnValue({
        eq: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      });

      await service.updateRiskImpact('p1', 'r1', 2);
      expect(supabaseMock.from).toHaveBeenCalledWith('project_risks');
    });

    it('should throw error when update fails', async () => {
      (supabaseMock.from('project_risks').update as jasmine.Spy).and.returnValue({
        eq: () => ({
          eq: () => Promise.resolve({ error: 'Impact error' }),
        }),
      });

      await expectAsync(
        service.updateRiskImpact('p1', 'r1', 2)
      ).toBeRejectedWith('Error al actualizar el riesgo, intenta de nuevo');
    });
  });
});
