import { Component, ElementRef, EventEmitter, inject, Input, OnInit, Output, Renderer2 } from '@angular/core';
import { Risk } from '../../interfaces/risk.interface';
import { RisksService } from '../../services/risks/risks.service';
import { ToastComponent } from "../../../shared/components/toast/toast.component";
import { ToastInterface } from '../../../shared/interfaces/toast.interface';
import { Sprint } from '../../interfaces/sprint.interface';
import { AssigneeSelectorComponent } from '../assignee-selector/assignee-selector.component';

@Component({
  selector: 'app-risk-project-detail',
  imports: [ToastComponent, AssigneeSelectorComponent],
  templateUrl: './risk-project-detail.component.html',
  styles: '',
})
export class RiskProjectDetailComponent implements OnInit {
  risksService = inject(RisksService);
  renderer = inject(Renderer2);
  eRef = inject(ElementRef);
  @Input() sprint!: Sprint;
  @Input() risk!: Risk;
  @Output() updatedRisk = new EventEmitter<Risk>()
  @Output() deleteRisk = new EventEmitter<Risk>()
  currentProbability: string | null = null;
  currentImpact: string | null = null;
  openProbabilityMenu = false;
  toast: ToastInterface = {show: false, title: '', message: '', type: 'info'}
  openImpactMenu = false;
  private clickListener?: () => void;

  // Activar el listener si hacen click por fuera
  activateListener(menu:boolean) {
    if (menu) {
      this.clickListener = this.renderer.listen('document', 'click', (event: MouseEvent) => {
        if (!this.eRef.nativeElement.contains(event.target)) {
          menu = false;
          this.removeClickListener();
        }
      });
    } else {
      this.removeClickListener();
    }
  }

  private removeClickListener() {
    if (this.clickListener) {
      this.clickListener();
      this.clickListener = undefined;
    }
  }

  ngOnInit() {
    if(this.sprint.prioritizationTechnique === 'qualitative'){
      this.currentProbability = this.risksService.getProbabilityLabel(this.risk.probability);
      this.currentImpact = this.risksService.getImpactLabel(this.risk.impact);
    }
    else {
      this.currentProbability = this.risk.probability?.toString() || null
      this.currentImpact = this.risk.impact?.toString() || null
    }
  }

  ngOnDestroy() {
    this.removeClickListener();
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
      this.toast = {show:true, title: 'No se pudo actualizar la probabilidad', 'message': 'Intenta de nuevo', type: 'error', timeout: 2000}
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
      this.toast = {show:true, title: 'No se pudo actualizar el impacto', 'message': 'Intenta de nuevo', type: 'error', timeout: 2000}
    }
  }

  toggleProbabilityMenu() {
    if (!this.sprint.available){
      this.toast = {show:true, title: 'El sprint está bloqueado', 'message': 'No se pueden cambiar valores', type: 'error', timeout: 2000}
      return
    }
    this.openProbabilityMenu = !this.openProbabilityMenu;
  }
  toggleImpactMenu() {
    if (!this.sprint.available){
      this.toast = {show:true, title: 'El sprint está bloqueado', 'message': 'No se pueden cambiar valores', type: 'error', timeout: 3000}
      return
    }
    this.openImpactMenu = !this.openImpactMenu;
  }

  onDeleteClick() {
    if (!this.sprint.available){
      this.toast = {show:true, title: 'El sprint está bloqueado', 'message': 'No se pueden eliminar riesgos', type: 'error', timeout: 2000}
      return
    }
    this.toast = { show:true, title: 'Vas a eliminar el riesgo del proyecto', 'message': '¿Estás seguro?', type: 'confirmation' }
  }

  async onDeleteRisk() {
    try {
      await this.risksService.deleteRisk(this.risk.id)
      this.toast = { show:true, title: 'Riesgo eliminado', 'message': '', type: 'info', timeout: 1000 }
      this.deleteRisk.emit(this.risk)
    } catch (error) {
      this.toast = { show:true, title: 'No se pudo eliminar el riesgo', 'message': 'Intenta de nuevo', type: 'error', timeout: 2000 }
    }
  }
}
