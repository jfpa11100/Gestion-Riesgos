import { Component, inject, OnInit, Pipe, WritableSignal } from '@angular/core';
import { ProjectService } from '../../services/projects/project.service';
import { Project } from '../../interfaces/project.interface';
import { UserProfileComponent } from '../../components/user-profile/user-profile.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Risk } from '../../interfaces/risk.interface';

@Component({
  selector: 'app-prioritization',
  imports: [UserProfileComponent],
  templateUrl: './prioritization.component.html',
  styles: ``
})
export class PrioritizationComponent implements OnInit {
  router = inject(Router)
  route = inject(ActivatedRoute)
  projectService = inject(ProjectService)
  project!: WritableSignal<Project | null>
  riskMatrix: Risk[][][] = [];

  async ngOnInit() {
    this.project = this.projectService.currentProject
    if (!this.project()) {
      const projectId = this.route.snapshot.paramMap.get('id');
      if (!projectId) return;
      this.project = await this.projectService.getProjectInfo(projectId)
      if (!this.project()) {
        this.router.navigate(['/dashboard'])
        return
      }
    }
    const risks = this.project()!.risks ?? [];
    this.riskMatrix = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => [])
    );
    risks.forEach(risk => {
      if (risk.impact != null && risk.probability != null) {
        this.riskMatrix[risk.impact][risk.probability].push(risk);
      }
    });
  }


}
