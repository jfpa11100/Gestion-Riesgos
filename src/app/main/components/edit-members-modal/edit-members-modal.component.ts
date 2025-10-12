import { Component, EventEmitter, inject, OnInit, Output, WritableSignal } from '@angular/core';
import { Project } from '../../interfaces/project.interface';
import { ProjectService } from '../../services/projects/project.service';
import { ToastInterface } from '../../../shared/interfaces/toast.interface';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { NgxSkeletonLoaderComponent } from 'ngx-skeleton-loader';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-edit-members-modal',
  imports: [ToastComponent, ReactiveFormsModule, NgxSkeletonLoaderComponent],
  templateUrl: './edit-members-modal.component.html',
  styles: ``
})
export class EditMembersModalComponent implements OnInit {
  loading = true;
  toast: ToastInterface = { show: false, title: '', message: '', type: 'info' }
  authService = inject(AuthService);
  projectService = inject(ProjectService);
  @Output() close = new EventEmitter<void>();
  project!: WritableSignal<Project | null>;
  projectMembers: { email: string, exists: boolean, isOwner:boolean }[] = [];
  newMembers: string[] = [];
  email = new FormControl('');

  async ngOnInit() {
    this.project = this.projectService.currentProject;
    if (this.project() == null) return;
    // get owner email
    const ownerEmail = await this.authService.getUserEmailById(this.project()!.owner);
    this.projectMembers.push({ email: ownerEmail, exists: true, isOwner:true })
    this.loading = false;
    // If user exists, show "Activo", else "Inactivo"
    for (let memberEmail of this.project()!.members!) {
      let userExists = await this.authService.userExists(memberEmail);
      this.projectMembers.push({ email: memberEmail, exists: userExists, isOwner:false})
    }
  }

  onInviteNewMembers() {
    this.projectService.inviteNewMembers(this.project()!.id!, this.newMembers)
      .then(() => {
        this.project.update(project => ({
          ...project!,
          members: [...this.projectMembers.map(m => m.email), ...this.newMembers]
        }));
        this.close.emit();
      })
      .catch(() => this.toast = {
        show: true, title: 'Ocurrió un error añadiendo los miembros',
        message: 'Intenta de nuevo', type: 'error', timeout: 3000
      })

  }

  async addMember(event: Event) {
    event.stopPropagation();
    let email = this.email.value;
    if (!email) return;
    email = email.toLowerCase();
    // validar si el email es email válido
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      this.toast = { show: true, title: 'El email ingresado no es válido', message: '', type: 'info', timeout: 6000 }
      return;
    }
    // Validar si es el mismo usuario
    const currentEmail = await this.authService.getUserEmail();
    if (email === currentEmail) {
      this.toast = { show: true, title: 'Eres el dueño del proyecto', message: '', type: 'info', timeout: 2000 }
      return;
    }
    // Validar si ya está en la lista
    if (this.newMembers.some((member) => member === email) || this.projectMembers.some((member) => member.email === email)) {
      this.toast = { show: true, title: 'Ya agregaste ese email', message: 'prueba otro', type: 'info', timeout: 2000 }
      return;
    }

    this.newMembers.push(email);
    this.email.reset();
  }

  removeMember(index: number) {
    this.newMembers.splice(index, 1);
  }

  async userExists(email: string): Promise<boolean> {
    return await this.authService.userExists(email)
  }
}
