import { Component, inject, OnInit, WritableSignal, signal } from '@angular/core';
import { Project } from '../../interfaces/project.interface';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { CreateProjectModalComponent } from '../../components/create-project-modal/create-project-modal.component';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectService } from '../../services/projects/project.service';
import { AuthService } from '../../../auth/services/auth.service';
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { ToastInterface } from '../../../shared/interfaces/toast.interface';
import { ToastComponent } from "../../../shared/components/toast/toast.component";

@Component({
  selector: 'app-dashboard',
  imports: [NgxSkeletonLoaderModule, CreateProjectModalComponent, HeaderComponent, DatePipe, ToastComponent, ToastComponent],
  templateUrl: './dashboard.component.html',
  styles: ``
})
export class DashboardComponent implements OnInit {
  toast: ToastInterface = { show: false, title: '', message: '', type: 'info' }
  router = inject(Router);
  projectService = inject(ProjectService);
  userService = inject(AuthService);
  userId!: string
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
    this.projectService.createProject(project).then((pj: Project) => {
      this.toast = { show: true, title: 'Se han invitado los miembros', message: 'Han sido invitados por correo electrónico', type: 'success', timeout: 2000 }
      this.projects.update(projects => [...projects, pj]);
      this.showCreateProjectModal = false
    }).catch((e) => {
      this.toast = { show: true, title: 'Ocurrió un error', message: 'Intenta de nuevo', type: 'error', timeout: 2000 }
    })
  }

  isOwner(project: Project): boolean {
    return project.owner === this.userId;
  }

  goToProject(id: string) {
    this.router.navigate(['/project', id]);
  }

}
