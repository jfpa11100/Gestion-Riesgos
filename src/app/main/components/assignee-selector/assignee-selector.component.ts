import { Component, ElementRef, inject, Input, OnDestroy, OnInit, Renderer2, WritableSignal } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { Project } from '../../interfaces/project.interface';
import { Risk } from '../../interfaces/risk.interface';
import { ProjectService } from '../../services/projects/project.service';

@Component({
  selector: 'app-assignee-selector',
  imports: [],
  templateUrl: './assignee-selector.component.html',
  styles: ``
})
export class AssigneeSelectorComponent implements OnInit, OnDestroy {
  @Input() risk!: Risk;
  eRef = inject(ElementRef);
  authService = inject(AuthService);
  projectService = inject(ProjectService);
  renderer = inject(Renderer2);
  project!:WritableSignal<Project | null>
  team: string[] = [];
  showMenu = false;
  private clickListener?: () => void;

  toggleMenu() {
    this.showMenu = !this.showMenu;
    if (this.showMenu) {
      // Activar el listener si hacen click por fuera
      this.clickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
        if (!this.eRef.nativeElement.contains(event.target)) {
          this.showMenu = false;
          this.removeClickListener();
        }
      });
    } else {
      this.removeClickListener();
    }
  }

  private removeClickListener() {
    if (this.clickListener) {
      this.clickListener();
      this.clickListener = undefined;
    }
  }

  ngOnDestroy() {
    this.removeClickListener();
  }

  async ngOnInit() {
    this.project = this.projectService.currentProject;
    if (this.project() == null) return;
    const ownerEmail = await this.authService.getUserEmailById(this.project()!.owner);
    this.team.push(ownerEmail)
    for (const memberEmail of this.project()?.members!) {
      if (await this.authService.userExists(memberEmail)){
        this.team.push(memberEmail)
      }
    }
  }

  selectUser(userEmail:string | null) {
    this.projectService.changeRiskAssignee(this.risk, userEmail).then(() => {
      this.risk.assignee = userEmail;
    }).catch(() =>{})
    this.showMenu = !this.showMenu
  }
}
