import { Component, ElementRef, HostListener, inject, Input, OnInit, WritableSignal } from '@angular/core';
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
export class AssigneeSelectorComponent implements OnInit {
  @Input() risk!: Risk;
  eRef = inject(ElementRef);
  authService = inject(AuthService);
  projectService = inject(ProjectService);
  project!:WritableSignal<Project | null>
  team: string[] = [];
  showMenu = false;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    // Si el clic NO ocurrió dentro del componente
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showMenu = false;
    }
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
