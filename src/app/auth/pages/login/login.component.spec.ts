import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { UserLogin } from '../../interfaces/user.interface';

// Mock de AuthService que ignora Supabase
class AuthServiceMock {
  login(user: UserLogin) {
    if (user.email === 'test@test.com' && user.password === '123456') {
      return Promise.resolve({ success: true });
    }
    return Promise.resolve({ success: false });
  }
  signOut() {
    return Promise.resolve();
  }
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule.withRoutes([])],
      providers: [
        { provide: AuthService, useClass: AuthServiceMock }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería loguear correctamente y redirigir a /home', async () => {
    spyOn(router, 'navigate');

    component.loginForm.setValue({
      email: 'test@test.com',
      password: '123456'
    });

    await component.onLogin();

    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('debería marcar error en el formulario si las credenciales son inválidas', async () => {
    component.loginForm.setValue({
      email: 'wrong@test.com',
      password: 'wrongpass'
    });

    await component.onLogin();

    expect(component.loginForm.errors).toEqual({ invalidLogin: true });
  });
});
