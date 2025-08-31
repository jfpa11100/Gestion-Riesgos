import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CreateProjectModalComponent } from './create-project-modal.component';
import { AuthService } from '../../../auth/services/auth.service';

describe('CreateProjectModalComponent', () => {
  let component: CreateProjectModalComponent;
  let fixture: ComponentFixture<CreateProjectModalComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['getUserEmail', 'userExists']);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CreateProjectModalComponent],
      providers: [{ provide: AuthService, useValue: spy }],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProjectModalComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  it('debería crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  describe('onCreateProject', () => {
    it('no debería emitir si el formulario es inválido', () => {
      spyOn(component.newProject, 'emit');
      component.projectForm.setValue({ name: '', email: '' });

      component.onCreateProject();

      expect(component.newProject.emit).not.toHaveBeenCalled();
      expect(component.projectForm.errors).toEqual({ invalid: true });
    });

    it('debería emitir un proyecto válido si el formulario es válido', () => {
      spyOn(component.newProject, 'emit');
      component.projectForm.setValue({ name: 'Proyecto Test', email: '' });

      component.onCreateProject();

      expect(component.newProject.emit).toHaveBeenCalled();
      const project = (component.newProject.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(project.name).toBe('Proyecto Test');
      expect(project.members).toEqual([]);
      expect(project.created_at).toBeInstanceOf(Date);
    });
  });

  describe('addMember', () => {
    it('no debería agregar si el email está vacío', async () => {
      component.projectForm.get('email')?.setValue('');
      await component.addMember();
      expect(component.teamMembers.length).toBe(0);
    });

    it('debería marcar error si el email es inválido', async () => {
      component.projectForm.get('email')?.setValue('correo_invalido');
      await component.addMember();
      expect(component.projectForm.errors).toEqual({ invalidEmail: true });
    });

    it('debería marcar error si el email es del mismo usuario', async () => {
      authServiceSpy.getUserEmail.and.returnValue(Promise.resolve('owner@test.com'));
      component.projectForm.get('email')?.setValue('owner@test.com');
      await component.addMember();
      expect(component.projectForm.errors).toEqual({ owner: true });
    });

    it('debería marcar error si el email ya existe en teamMembers', async () => {
      component.teamMembers = ['existe@test.com'];
      authServiceSpy.getUserEmail.and.returnValue(Promise.resolve('otro@test.com'));
      component.projectForm.get('email')?.setValue('existe@test.com');
      await component.addMember();
      expect(component.projectForm.errors).toEqual({ emailExists: true });
    });

    it('debería marcar error si el email no existe en el servicio', async () => {
      authServiceSpy.getUserEmail.and.returnValue(Promise.resolve('otro@test.com'));
      authServiceSpy.userExists.and.returnValue(Promise.resolve(false));
      component.projectForm.get('email')?.setValue('noexiste@test.com');
      await component.addMember();
      expect(component.projectForm.errors).toEqual({ userNotFound: true });
    });

    it('debería agregar un miembro válido', async () => {
      authServiceSpy.getUserEmail.and.returnValue(Promise.resolve('owner@test.com'));
      authServiceSpy.userExists.and.returnValue(Promise.resolve(true));
      component.projectForm.get('email')?.setValue('nuevo@test.com');

      await component.addMember();

      expect(component.teamMembers.length).toBe(1);
      expect(component.teamMembers[0]).toBe('nuevo@test.com');
      expect(component.projectForm.get('email')?.value).toBeNull();
    });
  });

  describe('removeMember', () => {
    it('debería eliminar un miembro del array', () => {
      component.teamMembers = ['test1@test.com' , 'test2@test.com' ];
      component.removeMember(0);
      expect(component.teamMembers.length).toBe(1);
      expect(component.teamMembers[0]).toBe('test2@test.com');
    });
  });
});
