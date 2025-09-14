import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserProfileComponent } from '../../../../main/components/user-profile/user-profile.component';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-header',
  imports: [UserProfileComponent, NgxSkeletonLoaderComponent],
  templateUrl: './header.component.html',
  styles: ``
})
export class HeaderComponent  {
  @Input() loading = false;
  @Input() title!:string
  @Input() isSideBarOpen:boolean = true;
  @Input() showSideBar:boolean = true;
  @Output() toggleSideBar = new EventEmitter<boolean>()

  toggle(){
    this.isSideBarOpen = !this.isSideBarOpen
    this.toggleSideBar.emit(this.isSideBarOpen)
  }

}
