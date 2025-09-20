import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Risk } from '../../interfaces/risk.interface';
import { RisksService } from '../../services/risks/risks.service';
import { ToastComponent } from "../../../shared/components/toast/toast.component";
import { ToastInterface } from '../../../shared/interfaces/toast.interface';
import { Sprint } from '../../interfaces/sprint.interface';

@Component({
  selector: 'app-risk-project-detail',
  imports: [ToastComponent],
  templateUrl: './risk-project-detail.component.html',
  styles: '',
})
export class RiskProjectDetailComponent implements OnInit {
  risksService = inject(RisksService);
  @Input() sprint!: Sprint;
  @Input() risk!: Risk;
  @Output() updatedRisk = new EventEmitter<Risk>()
  @Output() deleteRisk = new EventEmitter<Risk>()
  currentProbability: string | null = null;
  currentImpact: string | null = null;
  openProbabilityMenu = false;
  toast: ToastInterface = {show: false, title: '', message: '', type: 'info'}
  openImpactMenu = false;

  ngOnInit() {
    if(this.sprint.prioritizationTechnique === 'qualitative'){
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
    else {
      this.currentProbability = this.risk.probability?.toString() || null
      this.currentImpact = this.risk.impact?.toString() || null
    }
  }

  async changeProbability(probability: number) {
    const before = this.currentProbability;
    if(this.sprint.prioritizationTechnique === 'qualitative'){
      this.currentProbability = probability === 2 ? 'Alta' : probability === 1 ? 'Media' : 'Baja';
    } else{
      this.currentProbability = probability.toString()
    }
    this.toggleProbabilityMenu();
    try {
      await this.risksService.updateRiskProbability(this.risk.sprintId, this.risk.id, probability)
      this.risk.probability = probability
      this.updatedRisk.emit(this.risk)
    } catch (error) {
      this.toast = {show:true, title: 'No se pudo actualizar la probabilidad', 'message': 'Intenta de nuevo', type: 'error', timeout: 3000}
      this.currentImpact = before;
    }

  }

  async changeImpact(impact: number) {
    const before = this.currentImpact;
    if (this.sprint.prioritizationTechnique === 'qualitative'){
      this.currentImpact = impact === 2 ? 'Alto' : impact === 1 ? 'Medio' : 'Bajo';
    }else{
      this.currentImpact = impact.toString()
    }
    this.toggleImpactMenu();
    try {
      await this.risksService.updateRiskImpact(this.risk.sprintId, this.risk.id, impact)
      this.risk.impact = impact;
      this.updatedRisk.emit(this.risk)
    } catch (error) {
      this.currentImpact = before;
      this.toast = {show:true, title: 'No se pudo actualizar el impacto', 'message': 'Intenta de nuevo', type: 'error', timeout: 3000}
    }
  }

  toggleProbabilityMenu() {
    this.openProbabilityMenu = !this.openProbabilityMenu;
  }
  toggleImpactMenu() {
    this.openImpactMenu = !this.openImpactMenu;
  }

  onDeleteClick() {
    this.toast = { show:true, title: 'Vas a eliminar el riesgo del proyecto', 'message': '¿Estás seguro?', type: 'confirmation' }
  }

  async onDeleteRisk() {
    try {
      await this.risksService.deleteRisk(this.risk.id)
      this.toast = { show:true, title: 'Riesgo eliminado', 'message': '', type: 'info', timeout: 1000 }
      this.deleteRisk.emit(this.risk)
    } catch (error) {
      this.toast = { show:true, title: 'No se pudo eliminar el riesgo', 'message': 'Intenta de nuevo', type: 'error', timeout: 3000 }
    }
  }
}
