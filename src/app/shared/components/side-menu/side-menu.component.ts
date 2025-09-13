import { Component, inject, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-side-menu',
  imports: [],
  templateUrl: './side-menu.component.html',
  styles: ''
})
export class SideMenuComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute)
  @Input() open!:boolean

  ngOnInit(): void {
      // To know where is the user
      console.log(this.route.snapshot.url);
  }
}
