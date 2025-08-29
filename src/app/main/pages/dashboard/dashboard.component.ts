import { Component, inject, OnInit } from '@angular/core';
import { Project } from '../../interfaces/project.interface';
import { ProjectService } from '../../services/project.service';

@Component({
    selector: 'app-dashboard',
    imports: [],
    templateUrl: './dashboard.component.html',
    styles: ''
})
export class DashboardComponent implements OnInit {
  loading = true;
  projectService = inject(ProjectService);
  projects: Project[] = [
    // Example project data
    // { id: '1', name: 'Project Alpha',  created_at: new Date() },
    // { id: '2', name: 'Project Beta', created_at: new Date() }
  ];

  async ngOnInit(): Promise<void> {
    this.projects = await this.projectService.getProjects();
    this.loading = false;
  }

}
