import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['register', 'signOut']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        SignupComponent // ✅ standalone → va en imports
      ],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería marcar error si el email es inválido', async () => {
    component.registerForm.setValue({
      name: 'Juan',
      email: 'correo-no-valido',
      password: 'Password1!',
      confirmPassword: 'Password1!'
    });

    await component.onSubmit();
    expect(component.registerForm.errors?.['invalidEmail']).toBeTrue();
  });

  it('debería marcar error si las contraseñas no coinciden', async () => {
    component.registerForm.setValue({
      name: 'Juan',
      email: 'correo@test.com',
      password: 'Password1!',
      confirmPassword: 'OtroPassword1!'
    });

    await component.onSubmit();
    expect(component.registerForm.errors?.['passwordMismatch']).toBeTrue();
  });

  it('debería marcar error si la contraseña es débil', async () => {
    component.registerForm.setValue({
      name: 'Juan',
      email: 'correo@test.com',
      password: '1234',
      confirmPassword: '1234'
    });

    await component.onSubmit();
    expect(component.registerForm.errors?.['weakPassword']).toBeTrue();
  });

  it('debería navegar a /home si el registro es exitoso', async () => {
    authServiceSpy.register.and.returnValue(Promise.resolve({ success: true }));

    component.registerForm.setValue({
      name: 'Juan',
      email: 'correo@test.com',
      password: 'Password1!',
      confirmPassword: 'Password1!'
    });

    await component.onSubmit();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('debería marcar error si el registro falla', async () => {
    authServiceSpy.register.and.returnValue(Promise.resolve({ success: false, message: 'Usuario ya existe' }));

    component.registerForm.setValue({
      name: 'Juan',
      email: 'correo@test.com',
      password: 'Password1!',
      confirmPassword: 'Password1!'
    });

    await component.onSubmit();
    expect(component.registerForm.errors?.['invalidRegister']).toBe('Usuario ya existe');
  });
});
