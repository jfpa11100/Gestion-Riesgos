import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['register']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse el componente', () => {
    expect(component).toBeTruthy();
  });

  it('el formulario debe ser inválido si está vacío', () => {
    expect(component.registerForm.valid).toBeFalse();
  });

  it('debe marcar error si el email es inválido', () => {
    component.registerForm.controls['email'].setValue('correo_invalido');
    expect(component.registerForm.controls['email'].invalid).toBeTrue();
  });

  it('debe marcar error si las contraseñas no coinciden', fakeAsync(async () => {
    component.registerForm.setValue({
      name: 'Juan',
      email: 'juan@test.com',
      password: 'Password1!',
      confirmPassword: 'OtraPassword1!'
    });
    await component.onSubmit();
    expect(component.registerForm.errors?.['passwordMismatch']).toBeTrue();
  }));

  it('debe marcar error si la contraseña es débil', fakeAsync(async () => {
    component.registerForm.setValue({
      name: 'Juan',
      email: 'juan@test.com',
      password: 'password',
      confirmPassword: 'password'
    });
    await component.onSubmit();
    expect(component.registerForm.errors?.['weakPassword']).toBeTrue();
  }));

  it('debe redirigir a /home si el registro es exitoso', fakeAsync(async () => {
    component.registerForm.setValue({
      name: 'Juan',
      email: 'juan@test.com',
      password: 'Password1!',
      confirmPassword: 'Password1!'
    });

    mockAuthService.register.and.returnValue(Promise.resolve({ success: true }));

    await component.onSubmit();
    tick();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('debe poner error en el formulario si el registro falla', fakeAsync(async () => {
    component.registerForm.setValue({
      name: 'Juan',
      email: 'juan@test.com',
      password: 'Password1!',
      confirmPassword: 'Password1!'
    });

    mockAuthService.register.and.returnValue(Promise.resolve({ success: false, message: 'Error en registro' }));

    await component.onSubmit();
    tick();

    expect(component.registerForm.errors?.['invalidRegister']).toBe('Error en registro');
  }));
});
