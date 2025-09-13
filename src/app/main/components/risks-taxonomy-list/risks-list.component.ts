import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren, WritableSignal } from '@angular/core';
import { CategoryRisk, Risk } from '../../interfaces/risk.interface';
import { ProjectService } from '../../services/projects/project.service';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastInterface } from '../../../shared/interfaces/toast.interface';
import { ToastComponent } from "../../../shared/components/toast/toast.component";

@Component({
  selector: 'app-risks-list',
  imports: [ToastComponent],
  templateUrl: './risks-list.component.html',
  styles: ''
})
export class RisksListComponent implements OnInit, OnChanges {
  @ViewChildren('risk') riskElements!: QueryList<ElementRef>;
  toastMessage: ToastInterface = { show: false, title: '', message: '', type: 'info' }
  projectsService = inject(ProjectService)
  userService = inject(AuthService)
  @Input() searchQuery!: string;
  @Input() category!: CategoryRisk;
  @Input() index!: number;
  @Input() openCategoryIndex: number | null = null;
  @Output() riskChange = new EventEmitter<{ risk: Risk; selected: boolean }>();
  isOwner = false

  async ngOnInit() {
    const projectOwnerId = this.projectsService.currentProject()?.owner
    const userId = await this.userService.getUserId()
    if (projectOwnerId === userId) this.isOwner = true
  }

  ngOnChanges(changes: SimpleChanges): void {
    const queryChange = changes['searchQuery'];
    if (queryChange && !queryChange.firstChange && queryChange.currentValue != queryChange.previousValue) {
      if ((this.category.category.toLowerCase().includes(this.searchQuery) ||
        this.category.risks.some(r => r.risk.toLowerCase().includes(this.searchQuery))) && this.searchQuery !== '') {
        // Open the list of risks of the category
        this.openCategoryIndex = this.index;
        // Scroll to the specific risk
        const riskElement = this.riskElements.toArray()[this.index]?.nativeElement;
        if (riskElement) {
          riskElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      } else {
        this.openCategoryIndex = null
      }
    }
  }

  onRiskChange(event: Event, risk: Risk) {
    const checkbox = event.target as HTMLInputElement;
    this.riskChange.emit({ risk, selected: checkbox.checked });
  }

  check() {
    if (!this.isOwner) {
      this.toastMessage = {
        show: true,
        title: 'No puedes asignar riesgos',
        message: 'No eres el propietario del proyecto',
        type: 'info', timeout: 5000
      }
    }
  }
}
