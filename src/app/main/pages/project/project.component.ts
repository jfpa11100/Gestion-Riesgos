import { Component, inject, OnInit, WritableSignal } from '@angular/core';
import { Project } from '../../interfaces/project.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfileComponent } from '../../components/user-profile/user-profile.component';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ProjectService } from '../../services/projects/project.service';
import { RiskProjectDetailComponent } from "../../components/risk-project-detail/risk-project-detail.component";

@Component({
  selector: 'app-project',
  imports: [UserProfileComponent, NgxSkeletonLoaderModule, RiskProjectDetailComponent],
  templateUrl: './project.component.html',
  styles: `
    ngx-skeleton-loader{
      width: 90%;
      display: flex;
      flex-direction: column;
      justify-content: center !important;
      gap-y: 1px
    }
  `
})
export class ProjectComponent implements OnInit {
  router = inject(Router)
  route = inject(ActivatedRoute)
  projectsService = inject(ProjectService);
  loading = true;
  showAddMembersModal = false;
  project!: WritableSignal<Project | null>;


  async ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId){
      return;
    }
    this.project = await this.projectsService.getProjectInfo(projectId);
    this.loading = false;
  }


  goToTaxonomy(){
    this.router.navigate(['project', this.project()!.id, 'taxonomy']);
  }
}
