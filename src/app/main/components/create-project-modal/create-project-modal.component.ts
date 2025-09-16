import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Project } from '../../interfaces/project.interface';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { ToastInterface } from '../../../shared/interfaces/toast.interface';
import { ToastComponent } from '../../../shared/components/toast/toast.component';

@Component({
  selector: 'app-create-project-modal',
  imports: [ReactiveFormsModule, ToastComponent],
  templateUrl: './create-project-modal.component.html',
  styles: '',
})
export class CreateProjectModalComponent {
  toast: ToastInterface = { show: false, title: '', message: '', type: 'info' }
  authService = inject(AuthService);
  @Input() projects!: Project[];
  @Output() close = new EventEmitter<void>();
  @Output() newProject = new EventEmitter<Project>();
  projectForm!: FormGroup;
  teamMembers: string[] = [];

  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(500)]],
      email: ['', []],
    });
  }

  onCreateProject() {
    if (this.projectForm.invalid) {
      this.projectForm.setErrors({ invalid: true });
      return;
    }
    // Check if user belongs to a project already named
    const projectName = this.projectForm.get('name')!.value
    if (this.projects != null && this.projects.some(p => p.name.toLocaleLowerCase() === projectName.toLocaleLowerCase())) {
      this.toast = { show: true, title: 'Ya perteneces a un proyecto con ese nombre', message: 'Prueba otro', type: 'info', timeout: 2000 }
      return;
    }
    const newProject: Project = {
      name: projectName,
      description: this.projectForm.get('description')!.value,
      members: this.teamMembers,
      sprints:[],
      created_at: new Date(),
    };
    this.newProject.emit(newProject);
  }

  async addMember() {
    let email = this.projectForm.get('email')?.value;
    if (!email) return;
    email = email.toLowerCase();
    // validar si el email es email válido
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      this.toast = { show: true, title: 'El email ingresado no es válido', message: '', type: 'info', timeout: 2000 }
      return;
    }
    // Validar si es el mismo usuario
    const currentEmail = await this.authService.getUserEmail();
    if (email === currentEmail) {
      this.toast = { show: true, title: 'Eres el dueño del proyecto', message: '', type: 'info', timeout: 2000 }
      return;
    }
    // Validar si ya está en la lista
    if (this.teamMembers.some((member) => member === email)) {
      this.toast = { show: true, title: 'Ya agregaste ese email', message: 'prueba otro', type: 'info', timeout: 2000 }
      return;
    }

    this.teamMembers.push(email);
    this.projectForm.get('email')?.reset();
  }

  removeMember(index: number) {
    this.teamMembers.splice(index, 1);
  }
}
