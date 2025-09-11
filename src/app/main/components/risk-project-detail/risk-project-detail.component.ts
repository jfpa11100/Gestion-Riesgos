import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Risk } from '../../interfaces/risk.interface';
import { RisksService } from '../../services/risks/risks.service';
import { ToastComponent } from "../../../shared/components/toast/toast.component";
import { ToastInterface } from '../../../shared/interfaces/toast.interface';

@Component({
  selector: 'app-risk-project-detail',
  imports: [ToastComponent],
  templateUrl: './risk-project-detail.component.html',
  styles: '',
})
export class RiskProjectDetailComponent implements OnInit {
  risksService = inject(RisksService);
  @Input() risk!: Risk;
  @Input() projectId!: string;
  @Output() updatedRisk = new EventEmitter<Risk>()
  @Output() deleteRisk = new EventEmitter<Risk>()
  currentProbability: string | null = null;
  currentImpact: string | null = null;
  openProbabilityMenu = false;
  openImpactMenu = false;
  openToastConfirmation = false;
  toast!: ToastInterface;

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
    this.currentProbability = probability === 2 ? 'Alta' : probability === 1 ? 'Media' : 'Baja';
    this.toggleProbabilityMenu();
    try {
      await this.risksService.updateRiskProbability(this.projectId, this.risk.id, probability)
      this.risk.probability = probability
      this.updatedRisk.emit(this.risk)
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
      await this.risksService.updateRiskImpact(this.projectId, this.risk.id, impact)
      this.risk.impact = impact;
      this.updatedRisk.emit(this.risk)
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

  onDeleteClick() {
    this.toast = { title: 'Vas a eliminar el riesgo del proyecto', 'message': '¿Estás seguro?', type: 'confirmation' }
    this.openToastConfirmation = true;
  }

  onDeleteRisk() {
    this.risksService.deleteRisk(this.risk.id).then(() => {
      this.deleteRisk.emit(this.risk)
    }).catch(e => {
      this.toast = { title: 'No se pudo eliminar el riesgo', 'message': 'Intenta de nuevo', type: 'error', timeout: 6000 }
      this.openToastConfirmation = true;
    })
  }
}
