import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { SupabaseService } from '../../../shared/services/supabase/supabase.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      login: jasmine.createSpy('login'),
    };

    routerMock = {
      navigate: jasmine.createSpy('navigate'),
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: SupabaseService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the login form with empty values', () => {
    expect(component.loginForm.value).toEqual({ email: '', password: '' });
  });

  it('should call authService.login with form values when onLogin is called', fakeAsync(async () => {
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });

    authServiceMock.login.and.returnValue(Promise.resolve({ success: true }));

    await component.onLogin();
    tick();

    expect(authServiceMock.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: '123456',
    });
  }));

  it('should navigate to /home if login is successful', fakeAsync(async () => {
    component.loginForm.setValue({ email: 'test@test.com', password: '123456' });

    authServiceMock.login.and.returnValue(Promise.resolve({ success: true }));

    await component.onLogin();
    tick();

    expect(routerMock.navigate).toHaveBeenCalledWith(['/home']);
  }));

  it('should set form error if login fails', fakeAsync(async () => {
    component.loginForm.setValue({ email: 'fail@test.com', password: 'wrong' });

    authServiceMock.login.and.returnValue(Promise.resolve({ success: false }));

    await component.onLogin();
    tick();

    expect(component.loginForm.errors).toEqual({ invalidLogin: true });
    expect(routerMock.navigate).not.toHaveBeenCalled();
  }));
});
