import { TestBed } from '@angular/core/testing';
import { ProjectService } from './project.service';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../../../shared/services/supabase/supabase.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Project } from '../../interfaces/project.interface';

describe('ProjectService', () => {
  let service: ProjectService;
  let supabaseMock: jasmine.SpyObj<SupabaseClient>;
  let supabaseServiceSpy: jasmine.SpyObj<SupabaseService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    // mock de los métodos de SupabaseClient que usamos
    supabaseMock = jasmine.createSpyObj('SupabaseClient', ['from']);

    supabaseServiceSpy = jasmine.createSpyObj('SupabaseService', [], { supabase: supabaseMock });
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUserId']);
    authServiceSpy.getUserId.and.returnValue(Promise.resolve('mock-user-id'));

    TestBed.configureTestingModule({
      providers: [
        ProjectService,
        { provide: SupabaseService, useValue: supabaseServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });

    service = TestBed.inject(ProjectService);
  });

  it('debería obtener proyectos (getProjects)', async () => {
    const mockProjects: Project[] = [
      { name: 'Test Project', members: [], created_at: new Date(),  }
    ];

    // simulamos la respuesta de supabase
    (supabaseMock.from as any).and.returnValue({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: mockProjects, error: null })
        })
      })
    });

    const projects = await service.getProjects();

    expect(projects).toEqual(mockProjects);
    expect(authServiceSpy.getUserId).toHaveBeenCalled();
  });

  it('debería retornar [] si hay error en getProjects', async () => {
    (supabaseMock.from as any).and.returnValue({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: null, error: 'Error' })
        })
      })
    });

    const projects = await service.getProjects();

    expect(projects).toEqual([]);
  });

  it('debería crear un proyecto (createProject)', async () => {
    const newProject: Project = { name: 'Nuevo Proyecto', members: [], created_at: new Date() };

    (supabaseMock.from as any).and.returnValue({
      insert: () => ({
        single: () => Promise.resolve({ data: { id: '123', ...newProject }, error: null })
      })
    });

    await service.createProject(newProject);

    expect(authServiceSpy.getUserId).toHaveBeenCalled();
    expect(supabaseMock.from).toHaveBeenCalledWith('projects');
  });

  it('debería lanzar error si createProject falla', async () => {
    const newProject: Project = { name: 'Proyecto Fallido', members: [], created_at: new Date() };

    (supabaseMock.from as any).and.returnValue({
      insert: () => ({
        single: () => Promise.resolve({ data: null, error: 'Error al insertar' })
      })
    });

    await expectAsync(service.createProject(newProject)).toBeRejectedWith(
      'Sucedió un error al crear el proyecto, intenta nuevamente'
    );
  });
});
