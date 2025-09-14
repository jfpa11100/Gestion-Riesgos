import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-side-menu',
  imports: [RouterLink],
  templateUrl: './side-menu.component.html',
  styles: ''
})
export class SideMenuComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute)
  authService = inject(AuthService);
  @Input() open!:boolean

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
