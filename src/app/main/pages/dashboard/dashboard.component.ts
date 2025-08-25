import { Component, inject, OnInit } from '@angular/core';
import { Project } from '../../interfaces/project.interface';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styles: ''
})
export class DashboardComponent implements OnInit {
  projectService = inject(ProjectService);
  projects: Project[] = [];

  async ngOnInit(): Promise<void> {
    this.projects = await this.projectService.getProjects();
  }

}
