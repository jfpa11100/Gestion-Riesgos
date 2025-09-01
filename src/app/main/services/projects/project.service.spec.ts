import { TestBed } from '@angular/core/testing';
import { ProjectService } from './project.service';
import { SupabaseService } from '../../../shared/services/supabase/supabase.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Project } from '../../interfaces/project.interface';

// Creamos mocks
const mockFrom = jasmine.createSpy('from');
const mockSelect = jasmine.createSpy('select');
const mockOr = jasmine.createSpy('or');
const mockOrder = jasmine.createSpy('order');
const mockEq = jasmine.createSpy('eq');
const mockSingle = jasmine.createSpy('single');
const mockInsert = jasmine.createSpy('insert');

// Encadenamos los métodos que usa supabase
mockFrom.and.returnValue({
  select: mockSelect,
  insert: mockInsert,
  eq: mockEq,
  single: mockSingle,
  or: mockOr,
  order: mockOrder
});

describe('ProjectService', () => {
  let service: ProjectService;
  let supabaseMock: any;
  let authServiceMock: any;

  beforeEach(() => {
    supabaseMock = {
      from: mockFrom
    };

    authServiceMock = {
      getUserEmail: jasmine.createSpy('getUserEmail'),
      getUserId: jasmine.createSpy('getUserId')
    };

    TestBed.configureTestingModule({
      providers: [
        ProjectService,
        { provide: SupabaseService, useValue: { supabase: supabaseMock } },
        { provide: AuthService, useValue: authServiceMock }
      ]
    });

    service = TestBed.inject(ProjectService);

    // limpiamos spies entre tests
    mockFrom.calls.reset();
    mockSelect.calls.reset();
    mockOr.calls.reset();
    mockOrder.calls.reset();
    mockEq.calls.reset();
    mockSingle.calls.reset();
    mockInsert.calls.reset();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  describe('getProjects', () => {
    it('debería devolver proyectos cuando no hay error', async () => {
      authServiceMock.getUserEmail.and.resolveTo('test@example.com');
      mockSelect.and.returnValue({
        or: mockOr.and.returnValue({
          order: mockOrder.and.resolveTo({
            data: [{ id: '1', name: 'Project Test' }],
            error: null
          })
        })
      });

      const projects = await service.getProjects('user-123');

      expect(authServiceMock.getUserEmail).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(projects.length).toBe(1);
      expect(projects[0].name).toBe('Project Test');
    });

    it('debería devolver [] si hay error', async () => {
      authServiceMock.getUserEmail.and.resolveTo('test@example.com');
      mockSelect.and.returnValue({
        or: mockOr.and.returnValue({
          order: mockOrder.and.resolveTo({ data: null, error: {} })
        })
      });

      const projects = await service.getProjects('user-123');

      expect(projects).toEqual([]);
    });
  });

  describe('getProjectInfo', () => {
    it('debería devolver un proyecto con riesgos', async () => {
      const mockData = {
        id: 'p1',
        name: 'Project 1',
        project_risks: [
          {
            impact: 1,
            probability: 2,
            risks: { id: 'r1', risk: 'Riesgo 1', category: 'Cat A' }
          }
        ]
      };

      mockSelect.and.returnValue({
        eq: mockEq.and.returnValue({
          single: mockSingle.and.resolveTo({ data: mockData, error: null })
        })
      });

      const result = await service.getProjectInfo('p1');

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(result()!.id).toBe('p1');
      expect(result()!.risks!.length).toBe(1);
      expect(result()!.risks![0].risk).toBe('Riesgo 1');
    });

    it('debería lanzar error si supabase devuelve error', async () => {
      mockSelect.and.returnValue({
        eq: mockEq.and.returnValue({
          single: mockSingle.and.resolveTo({ data: null, error: { message: 'fail' } })
        })
      });

      await expectAsync(service.getProjectInfo('p1')).toBeRejectedWith(
        'Sucedió un error al obtener la información del proyecto, intenta nuevamente'
      );
    });
  });

  describe('createProject', () => {
    it('debería crear proyecto y devolverlo', async () => {
      authServiceMock.getUserId.and.resolveTo('user-123');
      const newProject: Project = { name: 'Nuevo Proyecto' };

      mockInsert.and.returnValue({
        select: () => ({
          single: mockSingle.and.resolveTo({
            data: { id: 'p2', name: 'Nuevo Proyecto' },
            error: null
          })
        })
      });

      const result = await service.createProject(newProject);

      expect(mockFrom).toHaveBeenCalledWith('projects');
      expect(result.id).toBe('p2');
      expect(result.name).toBe('Nuevo Proyecto');
    });

    it('debería lanzar error si falla la creación', async () => {
      authServiceMock.getUserId.and.resolveTo('user-123');
      const newProject: Project = { name: 'Fallo Proyecto' };

      mockInsert.and.returnValue({
        select: () => ({
          single: mockSingle.and.resolveTo({
            data: null,
            error: { message: 'Error inserting' }
          })
        })
      });

      await expectAsync(service.createProject(newProject)).toBeRejectedWith(
        'Sucedió un error al crear el proyecto, intenta nuevamente'
      );
    });
  });
});
