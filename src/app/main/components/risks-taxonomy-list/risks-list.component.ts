import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { CategoryRisk, Risk } from '../../interfaces/risk.interface';
import { ProjectService } from '../../services/projects/project.service';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-risks-list',
  imports: [],
  templateUrl: './risks-list.component.html',
  styles: ''
})
export class RisksListComponent implements OnInit, OnChanges {
  @ViewChildren('risk') riskElements!: QueryList<ElementRef>;
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
    if (changes['searchQuery'] && !changes['searchQuery'].firstChange) {
      if ((this.category.category.toLowerCase().includes(this.searchQuery) || 
            this.category.risks.some(r => r.risk.toLowerCase().includes(this.searchQuery))) && this.searchQuery !== '') {
        // Open the category of that risk
        this.openCategoryIndex = this.index;
        // Scroll to that risk
        const riskElement = this.riskElements.toArray()[this.index]?.nativeElement;
        if (riskElement) {
          riskElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      } else
        this.openCategoryIndex = null
    }
  }

  onRiskChange(event: Event, risk: Risk) {
    const checkbox = event.target as HTMLInputElement;
    this.riskChange.emit({ risk, selected: checkbox.checked });
  }

  check(){
    if (!this.isOwner){
      console.log('No puedes editar esta sección')
    }
  }
}
