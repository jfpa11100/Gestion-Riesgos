import { Component, inject, OnInit, WritableSignal } from '@angular/core';
import { CategoryRisk, Risk } from '../../interfaces/risk.interface';
import { RisksService } from '../../services/risks/risks.service';
import { RisksListComponent } from '../../components/risks-taxonomy-list/risks-list.component';
import { ActivatedRoute, Router, RouterLink} from '@angular/router';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';
import { ToastInterface } from '../../../shared/interfaces/toast.interface';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { SideMenuComponent } from "../../../shared/components/side-menu/side-menu.component";
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { Sprint } from '../../interfaces/sprint.interface';
import { ProjectService } from '../../services/projects/project.service';
import { Project } from '../../interfaces/project.interface';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';

@Component({
  selector: 'app-taxonomy',
  imports: [RisksListComponent, SearchBarComponent, ToastComponent, SideMenuComponent, HeaderComponent, NgxSkeletonLoaderComponent, RouterLink],
  templateUrl: './taxonomy.component.html',
  styles: ``,
})
export class TaxonomyComponent implements OnInit {
  loading = true;
  toastMessage: ToastInterface = {show:false, title:'', message:'', type:'info'}
  searchQuery:string = '';
  risksService = inject(RisksService);
  projectService = inject(ProjectService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  productEngineeringRisks: CategoryRisk[] = [];
  programConstraintRisks: CategoryRisk[] = [];
  developmentEnvironmentRisks: CategoryRisk[] = [];
  categoryRisks: CategoryRisk[] = [];
  addedRisks: Risk[] = [];
  project!: WritableSignal<Project | null>
  sortedSprints!:Sprint[]
  selectedSprint!:Sprint;

  async ngOnInit() {
    this.categoryRisks = await this.risksService.getRisksByCategory();
    this.productEngineeringRisks = this.categoryRisks.filter(
      (r) => r.topic == 'Product Engineering'
    );
    this.programConstraintRisks = this.categoryRisks.filter(
      (r) => r.topic == 'Program Constraints'
    );
    this.developmentEnvironmentRisks = this.categoryRisks.filter(
      (r) => r.topic == 'Development Environment'
    );

    if(this.projectService.currentProject()){
      this.project = this.projectService.currentProject
    }else{
      const projectId = this.route.snapshot.paramMap.get('id');
      if (!projectId) return;
      this.project = await this.projectService.getProjectInfo(projectId);
    }
    this.sortedSprints = this.project()!.sprints.sort((a, b) => a.sprint - b.sprint);
    this.route.queryParams.subscribe(params => {
      let sprintToSelect = this.sortedSprints.find(sprint => sprint.id === params['sprint']);
      if (!sprintToSelect){
        for (const sp of this.sortedSprints) {
          if (sp.available === true){
            sprintToSelect = sp;
            break
          }
        }
      }
      if (!sprintToSelect) {
        this.toastMessage = {
          show: true,
          title: 'No hay sprints disponibles',
          message: 'Pide que se agregue o se desbloquee algún sprint',
          type: 'error', timeout: 3000
        }
        return
      }
      this.selectedSprint = sprintToSelect;
    })
    this.loading = false;
  }

  onRiskChange(event: { risk: Risk; selected: boolean }) {
    if (event.selected) {
      this.addedRisks.push(event.risk);
    } else {
      const index = this.addedRisks.indexOf(event.risk);
      if (index > -1) {
        this.addedRisks.splice(index, 1);
      }
    }
  }

  onSaveRisks() {
    this.risksService.addRisksToSprint(
        this.selectedSprint.id,
        this.addedRisks.map((r) => r.id)
      )
      .then(() => {
        this.goBackToProject()
      })
      .catch((error) => {
        console.error(error);
      });
  }

  onRiskSearch(query: string){
    let foundResults = false
    for (const category of this.categoryRisks) {
      if(category.risks.some(risk => risk.risk.toLowerCase().includes(query.toLowerCase()))){
        foundResults = true
        break
      }
    }
    if (!foundResults){
      this.toastMessage = {
        show: true,
        title: 'No se encontraron resultados',
        message: 'Intenta con otra búsqueda',
        type: 'info', timeout: 2000
      }
      return;
    }
    this.searchQuery = query
  }

  goBackToProject() {
    this.router.navigate(['/project', this.route.snapshot.paramMap.get('id')!]);
  }
}
