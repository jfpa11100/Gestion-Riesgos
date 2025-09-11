import { Component, inject, OnInit } from '@angular/core';
import { CategoryRisk, Risk } from '../../interfaces/risk.interface';
import { RisksService } from '../../services/risks/risks.service';
import { RisksListComponent } from '../../components/risks-taxonomy-list/risks-list.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchBarComponent } from '../../../shared/components/search-bar/search-bar.component';

@Component({
  selector: 'app-taxonomy',
  imports: [RisksListComponent, SearchBarComponent],
  templateUrl: './taxonomy.component.html',
  styles: ``,
})
export class TaxonomyComponent implements OnInit {
  searchQuery!:string
  risksService = inject(RisksService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  productEngineeringRisks: CategoryRisk[] = [];
  programConstraintRisks: CategoryRisk[] = [];
  developmentEnvironmentRisks: CategoryRisk[] = [];
  addedRisks: Risk[] = [];

  async ngOnInit() {
    const risks = await this.risksService.getRisksByCategory();
    this.productEngineeringRisks = risks.filter(
      (r) => r.topic == 'Product Engineering'
    );
    this.programConstraintRisks = risks.filter(
      (r) => r.topic == 'Program Constraints'
    );
    this.developmentEnvironmentRisks = risks.filter(
      (r) => r.topic == 'Development Environment'
    );
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
    this.risksService
      .addRisksToProject(
        this.route.snapshot.paramMap.get('id')!,
        this.addedRisks.map((r) => r.id)
      )
      .then(() => {
        this.goBackToProject()
      })
      .catch((error) => {
        console.error(error);
      });
  }

  goBackToProject() {
    this.router.navigate(['/project', this.route.snapshot.paramMap.get('id')!]);
  }
}
