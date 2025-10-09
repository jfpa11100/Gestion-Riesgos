import { Component, computed, inject, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectService } from '../../services/projects/project.service';
import { Project } from '../../interfaces/project.interface';
import { Sprint } from '../../interfaces/sprint.interface';
import { HeaderComponent } from "../../../shared/components/layout/header/header.component";
import { SideMenuComponent } from "../../../shared/components/side-menu/side-menu.component";
import { SearchBarComponent } from "../../../shared/components/search-bar/search-bar.component";

@Component({
  selector: 'app-prioritization-list',
  imports: [HeaderComponent, SideMenuComponent, SearchBarComponent, RouterLink],
  templateUrl: './prioritization-list.component.html',
  styles: ``
})
export class PrioritizationListComponent implements OnInit {
  loading = true;
  isSideBarOpen = true
  route = inject(ActivatedRoute)
  router = inject(Router)
  projectService = inject(ProjectService)
  project!: WritableSignal<Project | null>
  sortedSprints!: Signal<Sprint[]>
  selectedCategory = ''
  currentSprint = signal<Sprint>({
    id: '',
    prioritizationTechnique: 'quantitative',
    sprint: 0,
    mitigation_date: new Date,
    risks: [],
    created_at: new Date
  })
  categoriesList: string[] = []
  sortedRisks = computed(() =>
    [...this.currentSprint()?.risks].sort((a, b) => {
      const aHasValues = a.probability && a.impact;
      const bHasValues = b.probability && b.impact;

      if (!aHasValues && !bHasValues) return 0;   // los dos sin valores → se quedan igual
      if (!aHasValues) return 1;                  // a sin valores → va al final
      if (!bHasValues) return -1;                 // b sin valores → va al final

      // ambos tienen valores → ordenar por riesgo (descendente)
      return b.probability! * b.impact! - a.probability! * a.impact!;
    })
  );
  searchTerm = ''

  async ngOnInit() {
    await this.getCurrentProject()

    this.sortedSprints = computed(() =>
      [...this.project()!.sprints].sort((a, b) => a.sprint - b.sprint)
    );
    this.route.queryParams.subscribe(params => {
      params['sprint']
        ? this.setCurrentSprint(this.sortedSprints()[params['sprint'] - 1])
        : this.setCurrentSprint(this.sortedSprints()[0]);
    })
    this.loading = false;
  }

  async getCurrentProject() {
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
  }

  setCurrentSprint(sprint: Sprint) {
    this.currentSprint.set(sprint)
    this.categoriesList = ['', ...new Set(this.currentSprint()?.risks.map(risk => risk.category))]
  }
}
