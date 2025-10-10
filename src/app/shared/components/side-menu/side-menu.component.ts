import { Component, inject, OnInit, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  selector: 'app-side-menu',
  imports: [RouterLink],
  templateUrl: './side-menu.component.html',
  styles: ''
})
export class SideMenuComponent implements OnInit {
  localStorageService = inject(LocalStorageService)
  router = inject(Router);
  route = inject(ActivatedRoute)
  authService = inject(AuthService);
  open: WritableSignal<boolean> = this.localStorageService.isSideMenuOpen;
  projectId = this.route.snapshot.paramMap.get('id')

  ngOnInit(): void {
      // To know where is the user
      // console.log(this.route.snapshot.url);
  }

  logout(){
    this.authService.signOut().then(() => {
      this.router.navigate(['/login']);
    });
  }
}
