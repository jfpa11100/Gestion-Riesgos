import { Component, EventEmitter, inject, Input, Output, WritableSignal } from '@angular/core';
import { UserProfileComponent } from '../../../../main/components/user-profile/user-profile.component';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { LocalStorageService } from '../../../services/local-storage.service';

@Component({
  selector: 'app-header',
  imports: [UserProfileComponent, NgxSkeletonLoaderComponent],
  templateUrl: './header.component.html',
  styles: ``
})
export class HeaderComponent  {
  localStorageService = inject(LocalStorageService);
  @Input() loading = false;
  @Input() title!:string
  @Input() enableSideBar = true;
  isSideMenuOpen:WritableSignal<boolean> = this.localStorageService.isSideMenuOpen;
}
