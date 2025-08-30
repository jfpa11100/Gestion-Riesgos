import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfileComponent } from './user-profile.component';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';
import { ElementRef } from '@angular/core';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['signOut']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerMock },
        {
          provide: ElementRef,
          useValue: {
            nativeElement: {
              contains: () => true,
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle profile dropdown', () => {
    expect(component.isProfileDropdownOpen).toBeFalse();
    component.toggleProfileDropdown();
    expect(component.isProfileDropdownOpen).toBeTrue();
    component.toggleProfileDropdown();
    expect(component.isProfileDropdownOpen).toBeFalse();
  });

  it('should close dropdown when clicking outside', () => {
    component.isProfileDropdownOpen = true;
    spyOn(component.elementRef.nativeElement, 'contains').and.returnValue(false);

    component.onClickOutside(new Event('click'));

    expect(component.isProfileDropdownOpen).toBeFalse();
  });

  it('should not close dropdown when clicking inside', () => {
    component.isProfileDropdownOpen = true;
    spyOn(component.elementRef.nativeElement, 'contains').and.returnValue(true);

    component.onClickOutside(new Event('click'));

    expect(component.isProfileDropdownOpen).toBeTrue();
  });

  it('should logout and navigate to login', async () => {
    authServiceSpy.signOut.and.returnValue(Promise.resolve());

    await component.logout();

    expect(authServiceSpy.signOut).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
