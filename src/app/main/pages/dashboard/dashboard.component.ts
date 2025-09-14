import { Component, inject, OnInit, WritableSignal, signal } from '@angular/core';
import { Project } from '../../interfaces/project.interface';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CreateProjectModalComponent } from '../../components/create-project-modal/create-project-modal.component';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/projects/project.service';
import { AuthService } from '../../../auth/services/auth.service';
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { SideMenuComponent } from "../../../shared/components/side-menu/side-menu.component";

@Component({
  selector: 'app-dashboard',
  imports: [NgxSkeletonLoaderModule, CreateProjectModalComponent, HeaderComponent, DatePipe],
  templateUrl: './dashboard.component.html',
  styles: ``
})
export class DashboardComponent implements OnInit {
  isSideBarOpen = true
  router = inject(Router);
  projectService = inject(ProjectService);
  userService = inject(AuthService);
  userId!:string
  loading = true;
  showCreateProjectModal = false;
  projects: WritableSignal<Project[]> = signal<Project[]>([]);

  async ngOnInit() {
    this.userId = await this.userService.getUserId();
    this.projects.set(await this.projectService.getProjects(this.userId))
    this.loading = false;
  }

  onCreateProject() {
    this.showCreateProjectModal = true;
  }

  newProject(project: Project) {
    this.projectService.createProject(project).then((pj:Project) => {
      this.projects.update(projects => [...projects, pj]);
      this.showCreateProjectModal = false
    }).catch((e) => {

    })
  }

  isOwner(project: Project): boolean {
    return project.owner === this.userId;
  }

  goToProject(id: string) {
    this.router.navigate(['/project', id]);
  }

}
