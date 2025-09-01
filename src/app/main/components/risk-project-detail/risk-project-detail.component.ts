import { Component, inject, Input, OnInit } from '@angular/core';
import { Risk } from '../../interfaces/risk.interface';
import { RisksService } from '../../services/risks/risks.service';

@Component({
  selector: 'app-risk-project-detail',
  imports: [],
  templateUrl: './risk-project-detail.component.html',
  styles: '',
})
export class RiskProjectDetailComponent implements OnInit {
  risksService = inject(RisksService);
  @Input() risk!: Risk;
  @Input() projectId!: string;
  currentProbability: string | null = null;
  currentImpact: string | null = null;
  openProbabilityMenu = false;
  openImpactMenu = false;

  ngOnInit() {
    this.currentProbability =
      this.risk.probability === 2 ? 'Alta'
        : this.risk.probability === 1 ? 'Media'
          : this.risk.probability === 0 ? 'Baja'
            : null;
    this.currentImpact =
      this.risk.impact === 2 ? 'Alto'
        : this.risk.impact === 1 ? 'Medio'
          : this.risk.impact === 0 ? 'Bajo'
            : null;
  }

  async changeProbability(probability: number) {
    const before = this.currentProbability;
    this.currentProbability =
      probability === 2 ? 'Alta' : probability === 1 ? 'Media' : 'Baja';
    this.toggleProbabilityMenu();
    try {
      await this.risksService.updateRiskProbability(this.projectId, this.risk.id, probability)
    } catch (error) {
      console.error('Error al actualizar la probabilidad', error);
      this.currentImpact = before;
    }

  }

  async changeImpact(impact: number) {
    const before = this.currentImpact;
    this.currentImpact =
      impact === 2 ? 'Alto' : impact === 1 ? 'Medio' : 'Bajo';
    this.toggleImpactMenu();
    try {
      await this.risksService
        .updateRiskImpact(this.projectId, this.risk.id, impact)
    } catch (error) {
      this.currentImpact = before;
      console.error('Error al actualizar el impacto', error);
    }
  }

  toggleProbabilityMenu() {
    this.openProbabilityMenu = !this.openProbabilityMenu;
  }
  toggleImpactMenu() {
    this.openImpactMenu = !this.openImpactMenu;
  }
}
