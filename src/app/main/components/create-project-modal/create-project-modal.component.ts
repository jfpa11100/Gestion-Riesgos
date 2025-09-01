import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Project } from '../../interfaces/project.interface';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-create-project-modal',
  imports: [ReactiveFormsModule],
  templateUrl: './create-project-modal.component.html',
  styles: '',
})
export class CreateProjectModalComponent {
  authService = inject(AuthService);
  @Input() projects!: Project[];
  @Output() close = new EventEmitter<void>();
  @Output() newProject = new EventEmitter<Project>();
  projectForm!: FormGroup;
  teamMembers: string[] = [];

  constructor(private fb: FormBuilder) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', []],
    });
  }

  onCreateProject() {
    if (this.projectForm.invalid) {
      this.projectForm.setErrors({ invalid: true });
      return;
    }
    const projectName = this.projectForm.get('name')!.value
    if (this.projects != null){
      this.projects.forEach(p => {
        if (p.name.toLocaleLowerCase() === projectName) {
          this.projectForm.setErrors({ projectNameExists: true });
          return;
        }
      });
    }
    const newProject: Project = {
      name: projectName,
      members: this.teamMembers,
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
      this.projectForm.setErrors({ invalidEmail: true });
      return;
    }
    // Validar si es el mismo usuario
    const currentEmail = await this.authService.getUserEmail();
    if (email === currentEmail) {
      this.projectForm.setErrors({ owner: true });
      return;
    }
    // Validar si ya está en la lista
    if (this.teamMembers.some((member) => member === email)) {
      this.projectForm.setErrors({ emailExists: true });
      return;
    }
    // Validar si el email existe en el servicio o en la lista
    if (!(await this.authService.userExists(email))) {
      this.projectForm.setErrors({ userNotFound: true });
      return;
    }

    this.teamMembers.push(email);
    this.projectForm.get('email')?.reset();
  }

  removeMember(index: number) {
    this.teamMembers.splice(index, 1);
  }
}
