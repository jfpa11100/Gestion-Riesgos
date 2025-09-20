import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { Project } from '../../interfaces/project.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { ProjectService } from '../../services/projects/project.service';
import { RiskProjectDetailComponent } from "../../components/risk-project-detail/risk-project-detail.component";
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { Risk } from '../../interfaces/risk.interface';
import { ToastInterface } from '../../../shared/interfaces/toast.interface';
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { SideMenuComponent } from "../../../shared/components/side-menu/side-menu.component";
import { Sprint } from '../../interfaces/sprint.interface';
import { DatepickerComponent } from "../../components/datepicker/datepicker.component";
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-project',
  imports: [NgxSkeletonLoaderModule, RiskProjectDetailComponent, ToastComponent, HeaderComponent, SideMenuComponent, DatepickerComponent, DatePipe],
  templateUrl: './project.component.html',
  styles: ``
})
export class ProjectComponent implements OnInit {
  openDatepicker: { show: boolean, sprint: Sprint | null } = { show: false, sprint: null }
  openSprintIndex = 1
  loading = true;
  isSideBarOpen = true;
  showAddMembersModal = false;
  router = inject(Router)
  route = inject(ActivatedRoute)
  projectsService = inject(ProjectService);
  project: WritableSignal<Project | null> = signal({ name: '', description: '', sprints: [] });
  sortedSprints = computed(() =>
    [...this.project()!.sprints].sort((a, b) => a.sprint - b.sprint)
  );
  toast: ToastInterface = { show: false, title: '0', message: '', type: 'info' };

  async ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (!projectId) return;
    this.project = await this.projectsService.getProjectInfo(projectId);
    this.loading = false;
  }

  goToTaxonomy() {
    this.router.navigate(['project', this.project()!.id, 'taxonomy']);
  }

  createSprint() {
    this.projectsService.createSprint(this.project()!)
      .then(sprint => {
        const updatedProject = {
          ...this.project()!,
          sprints: [
            ...this.project()!.sprints,
            { ...sprint }
          ]
        };
        this.project.set(updatedProject);
      }).catch(() => {
        this.toast = {
          show: true,
          title: 'Error al crear el sprint',
          message: 'Intenta de nuevo más tarde',
          type: 'error',
          timeout: 2000,
        }
      })
  }

  goToPrioritization(sprint: Sprint) {
    // If there are no risks or there are incomplete risks
    if (!sprint.risks.length || sprint.risks.some(risk => risk.impact === null || risk.probability === null)) {
      this.toast = {
        show: true,
        title: 'Aún no has completado la valoración de los riesgos',
        message: '¿Deseas continuar?',
        type: 'confirmation'
      }
      return
    }
    this.router.navigate(['project', this.project()!.id, 'prioritization']);
  }

  updateRisk(updatedRisk: Risk) {
    this.project.update(project => {
      if (!project) return project;
      return {
        ...project,
        sprints: project.sprints.map(sprint =>
          sprint.id === updatedRisk.sprintId
            ? {
              ...sprint,
              risks: sprint.risks.map(risk =>
                risk.id === updatedRisk.id ? { ...risk, ...updatedRisk } : risk
              )
            }
            : sprint
        )
      };
    });
  }

  deleteRisk(risk: Risk) {
    this.project.update(project => {
      if (!project) return project;

      return {
        ...project,
        sprints: project.sprints.map(sprint =>
          sprint.id === risk.sprintId
            ? {
              ...sprint,
              risks: sprint.risks.filter(r => r.id !== risk.id)
            }
            : sprint
        )
      };
    });
  }

  acceptedGoToPrioritization(accepted: boolean) {
    if (!accepted) return;
    this.router.navigate(['project', this.project()!.id, 'prioritization']);
  }

  goBackToProjects() {
    this.router.navigate(['/dashboard'])
  }

  saveDate(date: Date) {
    this.projectsService.saveSprintDate(this.openDatepicker.sprint!, date).then(date => {
      this.project!.update(project => ({
        ...project!,
        sprints: project!.sprints.map(sprint =>
          sprint.id === this.openDatepicker.sprint!.id
            ? { ...sprint, mitigation_date: date }
            : sprint
        )
      }));
    }).catch(() => this.toast = {
      show: true,
      title: 'Error al crear el sprint',
      message: 'Intenta de nuevo más tarde',
      type: 'error',
      timeout: 2000,
    })
  }

  changePrioritizationTechnique(sprint: Sprint, technique: 'quantitative' | 'qualitative', event: Event) {
    event.stopPropagation()
    this.projectsService.changePrioritizationTechnique(sprint, technique).then(() => {
      this.project.update(pj => ({
        ...pj!,
        sprints: pj!.sprints.map(sp =>
          sp.id === sprint.id
            ? { ...sp, prioritizationTechnique: technique }
            : sp
        )
      }));
      this.toast = { show: true, title: 'Técnica actualizada', message: '', type: 'success', timeout: 1500 }
    }).catch(() => {
      this.toast = { show: true, title: 'Ocurrió un error', message: 'Intenta de nuevo', type: 'error', timeout: 1500 }
    })
  }
}
