import { TestBed } from '@angular/core/testing';
import { ProjectService } from './project.service';
import { SupabaseService } from '../../../shared/services/supabase/supabase.service';
import { AuthService } from '../../../auth/services/auth.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { Project } from '../../interfaces/project.interface';

describe('ProjectService', () => {
  let service: ProjectService;
  let supabaseMock: jasmine.SpyObj<SupabaseClient>;
  let authServiceMock: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // Creamos mocks
    supabaseMock = jasmine.createSpyObj('SupabaseClient', ['from']);
    authServiceMock = jasmine.createSpyObj('AuthService', [
      'getUserId',
      'getUserEmail',
    ]);

    // Mock para .from() → devuelve objeto con los métodos encadenados
    const fromMock = jasmine.createSpyObj('from', [
      'select',
      'or',
      'order',
      'eq',
      'single',
      'insert',
    ]);
    supabaseMock.from.and.returnValue(fromMock);

    TestBed.configureTestingModule({
      providers: [
        ProjectService,
        { provide: SupabaseService, useValue: { supabase: supabaseMock } },
        { provide: AuthService, useValue: authServiceMock },
      ],
    });

    service = TestBed.inject(ProjectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getProjects', () => {
    it('should return projects when query is successful', async () => {
      const fakeProjects: Project[] = [
        { id: 'p1', name: 'Proyecto 1', owner: 'u1', risks: [], created_at:new Date() },
      ];

      authServiceMock.getUserEmail.and.resolveTo('test@test.com');

      (supabaseMock.from('projects').select as jasmine.Spy).and.returnValue({
        or: () => ({
          order: () => Promise.resolve({ data: fakeProjects, error: null }),
        }),
      });

      const result = await service.getProjects('u1');
      expect(result).toEqual(fakeProjects);
      expect(authServiceMock.getUserEmail).toHaveBeenCalled();
    });

    it('should return empty array when query fails', async () => {
      authServiceMock.getUserEmail.and.resolveTo('test@test.com');

      (supabaseMock.from('projects').select as jasmine.Spy).and.returnValue({
        or: () => ({
          order: () => Promise.resolve({ data: null, error: 'Error' }),
        }),
      });

      const result = await service.getProjects('u1');
      expect(result).toEqual([]);
    });
  });

  describe('getProjectInfo', () => {
    it('should return project with risks when query is successful', async () => {
      const fakeResponse = {
        data: {
          id: 'p1',
          name: 'Proyecto 1',
          project_risks: [
            {
              probability: 0.5,
              impact: 2,
              risks: { id: 'r1', name: 'Riesgo 1' },
            },
          ],
        },
        error: null,
      };

      (supabaseMock.from('projects').select as jasmine.Spy).and.returnValue({
        eq: () => ({
          single: () => Promise.resolve(fakeResponse),
        }),
      });

      const result = await service.getProjectInfo('p1');
      expect(result()).toBeTruthy(); // signal con el proyecto
      expect(result()?.risks.length).toBe(1);
      expect(service.currentProject()).toEqual(
        jasmine.objectContaining({ id: 'p1' })
      );
    });

    it('should throw error when query fails', async () => {
      (supabaseMock.from('projects').select as jasmine.Spy).and.returnValue({
        eq: () => ({
          single: () =>
            Promise.resolve({ data: null, error: 'Some error' }),
        }),
      });

      await expectAsync(service.getProjectInfo('p1')).toBeRejectedWith(
        'Sucedió un error al obtener la información del proyecto, intenta nuevamente'
      );
    });
  });

  describe('createProject', () => {
    it('should insert project successfully', async () => {
      authServiceMock.getUserId.and.resolveTo('u1');

      (supabaseMock.from('projects').insert as jasmine.Spy).and.returnValue({
        single: () => Promise.resolve({ data: { id: 'p1' }, error: null }),
      });

      await service.createProject({ id: 'p1', name: 'Nuevo', risks: [],created_at: new Date()});
      expect(supabaseMock.from).toHaveBeenCalledWith('projects');
    });

    it('should throw error when insert fails', async () => {
      authServiceMock.getUserId.and.resolveTo('u1');

      (supabaseMock.from('projects').insert as jasmine.Spy).and.returnValue({
        single: () => Promise.resolve({ data: null, error: 'Insert error' }),
      });

      await expectAsync(
        service.createProject({ id: 'p1', name: 'Nuevo', risks: [], created_at: new Date() })
      ).toBeRejectedWith(
        'Sucedió un error al crear el proyecto, intenta nuevamente'
      );
    });
  });
});
