import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  imports: [],
  templateUrl: './user-profile.component.html',
  styles: '',
})
export class UserProfileComponent {
  authService = inject(AuthService);
  elementRef = inject(ElementRef);
  router = inject(Router);
  isProfileDropdownOpen = false;

  toggleProfileDropdown() {
    this.isProfileDropdownOpen = !this.isProfileDropdownOpen;
  }

  logout() {
    this.authService.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isProfileDropdownOpen = false;
    }
  }
}
