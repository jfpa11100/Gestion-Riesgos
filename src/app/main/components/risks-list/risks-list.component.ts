import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CategoryRisk, Risk } from '../../interfaces/risk.interface';

@Component({
  selector: 'app-risks-list',
  imports: [],
  templateUrl: './risks-list.component.html',
  styles: ''
})
export class RisksListComponent {
  @Input() category!: CategoryRisk;
  @Input() index!: number;
  @Input() openCategoryIndex: number | null = null;
  @Output() riskChange = new EventEmitter<{ risk: Risk; selected: boolean }>();

  onRiskChange(event: Event, risk: Risk) {
    const checkbox = event.target as HTMLInputElement;
    this.riskChange.emit({ risk, selected: checkbox.checked });
  }

}
