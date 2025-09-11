import { Component, inject, OnInit, WritableSignal } from '@angular/core';
import { Project } from '../../interfaces/project.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileComponent } from '../../components/user-profile/user-profile.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ProjectService } from '../../services/projects/project.service';
import { RiskProjectDetailComponent } from "../../components/risk-project-detail/risk-project-detail.component";
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { Risk } from '../../interfaces/risk.interface';

@Component({
  selector: 'app-project',
  imports: [UserProfileComponent, NgxSkeletonLoaderModule, RiskProjectDetailComponent, ToastComponent],
  templateUrl: './project.component.html',
  styles: `
    ngx-skeleton-loader{
      display: flex;
      flex-direction: column;
      justify-content: center !important;
      row-gap: 0.5rem;
      margin-top: 1rem;
      width: 100%
    }
  `
})
export class ProjectComponent implements OnInit {
  router = inject(Router)
  route = inject(ActivatedRoute)
  projectsService = inject(ProjectService);
  project!: WritableSignal<Project | null>;
  loading = true;
  showAddMembersModal = false;
  showMessage = false;


  async ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) return;
    this.project = await this.projectsService.getProjectInfo(projectId);
    this.loading = false;
  }

  goToTaxonomy() {
    this.router.navigate(['project', this.project()!.id, 'taxonomy']);
  }

  goToPrioritization() {
    if (this.project()?.risks?.some(risk => risk.impact == null || risk.probability == null)) {
      this.showMessage = true;
      return
    }
    this.router.navigate(['project', this.project()!.id, 'prioritization']);
  }

  updateRisk(updatedRisk: Risk) {
    this.project.update(project =>
      project
        ? {
          ...project,
          risks: project.risks?.map(risk =>
            risk.id === updatedRisk.id ? updatedRisk : risk
          ) ?? []
        }
        : null
    );
  }

  deleteRisk(risk: Risk) {
    this.project.update(project => project
      ? {
        ...project,
        risks: project.risks?.filter(r => r.id !== risk.id) ?? []
      }
      : null
    );
    console.log(this.project())
  }

  acceptedGoToPrioritization(accepted: boolean) {
    this.showMessage = false
    if (!accepted) return;
    this.router.navigate(['project', this.project()!.id, 'prioritization']);
  }

  goBackToProjects(){
    this.router.navigate(['/dashboard'])
  }

}
