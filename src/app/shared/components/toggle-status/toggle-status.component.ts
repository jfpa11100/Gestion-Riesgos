import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { Sprint } from '../../../main/interfaces/sprint.interface';
import { ProjectService } from '../../../main/services/projects/project.service';
import { ToastInterface } from '../../interfaces/toast.interface';

@Component({
  selector: 'app-toggle-status',
  imports: [CommonModule],
  templateUrl: './toggle-status.component.html',
  styles: ``
})
export class ToggleStatusComponent implements OnInit {
  toast: ToastInterface = { show: false, title: '0', message: '', type: 'info' };
  projectService = inject(ProjectService);
  @Input() togglePermission!: boolean;
  @Input() sprint!: Sprint;
  enabled!: boolean;
  @Output() updateSprint = new EventEmitter<Sprint>()

  ngOnInit(): void {
    this.enabled = this.sprint.available
  }

  toggleState(event: Event, value: boolean) {
    event.stopPropagation();
    this.projectService.toggleSprintAvailability(this.sprint.id, value).then(() => {
      this.enabled = value;
      this.sprint.available = value
      this.updateSprint.emit(this.sprint)
    }).catch(() => this.toast = {
      show: true,
      title: 'Ocurrió un error',
      message: 'Intenta más tarde',
      type: 'error',
      timeout: 2000,
    })
  }
}
