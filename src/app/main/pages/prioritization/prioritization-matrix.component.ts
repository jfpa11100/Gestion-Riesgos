import { Component, computed, inject, OnInit, WritableSignal } from '@angular/core';
import { ProjectService } from '../../services/projects/project.service';
import { Project } from '../../interfaces/project.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { Risk } from '../../interfaces/risk.interface';
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';
import { Sprint } from '../../interfaces/sprint.interface';

@Component({
  selector: 'app-prioritization',
  imports: [HeaderComponent, SideMenuComponent],
  templateUrl: './prioritization-matrix.component.html',
  styles: ``
})
export class PrioritizationMatrixComponent implements OnInit {
  isSideBarOpen = false;
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
    // TODO: Not burn the sprint to see
    this.currentSprint = this.sortedSprints()[0]
    this.setSprintRisks(this.currentSprint)
  }

  setSprintRisks(sprint: Sprint) {
    if (sprint.prioritizationTechnique === 'qualitative'){
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
    } else if(sprint.prioritizationTechnique === 'quantitative'){
      this.router.navigate(['/project', this.route.snapshot.paramMap.get('id')!, 'list'], {queryParams:{sprint:sprint.sprint}})
    }
  }

  goBackToProject() {
    this.router.navigate(['/project', this.route.snapshot.paramMap.get('id')!]);
  }
}
