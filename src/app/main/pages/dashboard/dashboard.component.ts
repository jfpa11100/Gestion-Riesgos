import { Component, inject, OnInit } from '@angular/core';
import { Project } from '../../interfaces/project.interface';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CreateProjectModalComponent } from '../../components/create-project-modal/create-project-modal.component';
import { UserProfileComponent } from '../../components/user-profile/user-profile.component';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/projects/project.service';

@Component({
    selector: 'app-dashboard',
    imports: [NgxSkeletonLoaderModule, CreateProjectModalComponent, UserProfileComponent, DatePipe],
    templateUrl: './dashboard.component.html',
    styles: `
      ngx-skeleton-loader {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
      }
    `
})
export class DashboardComponent implements OnInit {
  router = inject(Router);
  projectService = inject(ProjectService);
  loading = true;
  showCreateProjectModal = false;

  projects: Project[] = [];

  async ngOnInit(): Promise<void> {
    this.projects = await this.projectService.getProjects();
    this.loading = false;
  }

  onCreateProject(){
    this.showCreateProjectModal = true;
  }

  newProject(project: Project) {
    this.projectService.createProject(project).then(() =>{
      this.projects.push(project);
    }).catch((e) => {

    })
  }

  goToProject(id: string) {
    this.router.navigate(['/project', id]);
  }

}
