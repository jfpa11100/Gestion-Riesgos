import { Component, computed, inject, OnInit, WritableSignal } from '@angular/core';
import { ProjectService } from '../../services/projects/project.service';
import { Project } from '../../interfaces/project.interface';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Risk } from '../../interfaces/risk.interface';
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';
import { Sprint } from '../../interfaces/sprint.interface';

@Component({
  selector: 'app-prioritization',
  imports: [HeaderComponent, SideMenuComponent, RouterLink],
  templateUrl: './prioritization-matrix.component.html',
  styles: ``
})
export class PrioritizationMatrixComponent implements OnInit {
  router = inject(Router)
  route = inject(ActivatedRoute)
  projectService = inject(ProjectService)
  project!: WritableSignal<Project | null>
  riskMatrix: Risk[][][] = [];
  currentSprint!: Sprint
  sortedSprints = computed(() =>
    [...this.project()!.sprints].sort((a, b) => a.sprint - b.sprint)
  );

  async ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('id');
    this.project = this.projectService.currentProject
    if (!this.project()) {
      if (!projectId) {
        this.router.navigate(['/dashboard'])
        return
      };
      this.project = await this.projectService.getProjectInfo(projectId)
      if (!this.project()) {
        this.router.navigate(['/dashboard'])
        return
      }
    }
    // If sprint in query params, set sprint to that
    this.route.queryParams.subscribe(params => {
      let selectedSprint = this.sortedSprints().find(sp => sp.id === params['sprint'])
      this.currentSprint = selectedSprint ?? this.sortedSprints()[0];
    })
    this.setSprintRisks(this.currentSprint)
  }

  setSprintRisks(sprint: Sprint) {
    if (sprint.prioritizationTechnique === 'qualitative'){
      this.configMatrixQualitativeSprint(sprint);
    } else if(sprint.prioritizationTechnique === 'quantitative'){
      this.configMatrixQuantitativeSprint(sprint);
    } else
    this.router.navigate(['/project', this.route.snapshot.paramMap.get('id')!])
  }

  configMatrixQualitativeSprint(sprint: Sprint){
    this.currentSprint = sprint;
    const risks = sprint.risks ?? [];
    this.riskMatrix = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => [])
    );
    risks.forEach(risk => {
      if (risk.impact != null && risk.probability != null) {
        this.riskMatrix[risk.impact][risk.probability].push(risk);
      }
    });
  }

  configMatrixQuantitativeSprint(sprint: Sprint){
    this.currentSprint = sprint;
    const risks = sprint.risks ?? [];
    this.riskMatrix = Array.from({ length: 3 }, () =>
      Array.from({ length: 3 }, () => [])
    );
    risks.forEach(risk => {
      const I = risk.impact
      const P = risk.probability
      if (I != null && P != null) {
        // Assign position in matrix based on Risk calculation
        const R = I * P

        if(R < 121){
          this.riskMatrix[0][0].push(risk);
        }else if(R >= 121 && R < 484) {
          this.riskMatrix[I >= P ? 0 : 1][I >= P ? 1 : 0].push(risk);
        }else if(R >= 484 && R < 1089) {
          if (I > R)
            this.riskMatrix[0][2].push(risk);
          else if (I < R)
            this.riskMatrix[2][0].push(risk);
          else
            this.riskMatrix[1][1].push(risk);
        }else if(R >= 1089 && R < 1936) {
          this.riskMatrix[I >= P ? 1 : 2][I >= P ? 2 : 1].push(risk);
        }else
          this.riskMatrix[2][2].push(risk);

      }
    });
  }

  goBackToProject() {
    this.router.navigate(['/project', this.route.snapshot.paramMap.get('id')!]);
  }
}
