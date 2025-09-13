import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserProfileComponent } from '../../../../main/components/user-profile/user-profile.component';

@Component({
  selector: 'app-header',
  imports: [UserProfileComponent],
  templateUrl: './header.component.html',
  styles: ``
})
export class HeaderComponent {
  @Input() title!:string
  @Input() isSideBarOpen:boolean = true;
  @Output() toggleSideBar = new EventEmitter<boolean>()

  toggle(){
    this.isSideBarOpen = !this.isSideBarOpen
    this.toggleSideBar.emit(this.isSideBarOpen)
  }

}
