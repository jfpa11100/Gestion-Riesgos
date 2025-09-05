import { Component, inject, OnInit, WritableSignal } from '@angular/core';
import { Project } from '../../interfaces/project.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileComponent } from '../../components/user-profile/user-profile.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ProjectService } from '../../services/projects/project.service';
import { RiskProjectDetailComponent } from "../../components/risk-project-detail/risk-project-detail.component";
import { ToastComponent } from '../../../shared/components/toast/toast.component';

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
    if (this.project()?.risks?.map(risk => risk.impact === null || risk.probability === null)) {
      this.showMessage = true;
    }
    // this.router.navigate(['project', this.project()!.id, 'prioritization']);
  }
}
