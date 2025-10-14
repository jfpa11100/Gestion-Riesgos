import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { SideMenuComponent } from '../../../shared/components/side-menu/side-menu.component';
import { HeaderComponent } from '../../../shared/components/layout/header/header.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Project } from '../../interfaces/project.interface';
import { ProjectService } from '../../services/projects/project.service';
import { Risk } from '../../interfaces/risk.interface';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MitigationAction } from '../../interfaces/mitigation.interface';
import { AuthService } from '../../../auth/services/auth.service';

export type ActionType = 'preventive' | 'corrective' | 'contingency' | 'transfer' | 'acceptance';
export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'not_viable';
export type ActionPriority = 'high' | 'medium' | 'low';

@Component({
  selector: 'app-mitigation-form',
  imports: [SideMenuComponent, HeaderComponent, RouterLink, CommonModule, ReactiveFormsModule],
  templateUrl: './mitigation-form.component.html',
  styles: ``
})
export class MitigationFormComponent implements OnInit {
  comesFrom!: string;
  fb = inject(FormBuilder)
  projectService = inject(ProjectService)
  route = inject(ActivatedRoute)
  router = inject(Router)
  authService = inject(AuthService)

  project!: WritableSignal<Project | null>
  risk!: Risk
  isSubmitting = signal(false);
  mitigationForm!: FormGroup;
  teamMembers: string[] = [];


  // Opciones para los dropdowns
  actionTypes = [
    { value: 'preventive', label: 'Preventiva', description: 'Evitar que el riesgo ocurra' },
    { value: 'corrective', label: 'Correctiva', description: 'Corregir después de que ocurra' },
    { value: 'contingency', label: 'Contingencia', description: 'Plan alternativo si ocurre' },
    { value: 'transfer', label: 'Transferencia', description: 'Trasladar el riesgo a terceros' },
    { value: 'acceptance', label: 'Aceptación', description: 'Aceptar el riesgo conscientemente' }
  ];

  statusOptions = [
    { value: 'pending', label: 'Pendiente', icon: 'clock', color: 'gray' },
    { value: 'in_progress', label: 'En ejecución', icon: 'play', color: 'blue' },
    { value: 'completed', label: 'Completada', icon: 'check', color: 'green' },
    { value: 'not_viable', label: 'No viable', icon: 'x', color: 'red' }
  ];

  priorityOptions = [
    { value: 'high', label: 'Alta', color: 'red' },
    { value: 'medium', label: 'Media', color: 'yellow' },
    { value: 'low', label: 'Baja', color: 'green' }
  ];

  resourceOptions = [
    { value: 'tools', label: 'Herramientas', icon: '🔧' },
    { value: 'time', label: 'Tiempo', icon: '⏰' },
    { value: 'budget', label: 'Presupuesto', icon: '💰' },
    { value: 'personnel', label: 'Personal', icon: '👥' },
    { value: 'training', label: 'Capacitación', icon: '📚' },
    { value: 'technology', label: 'Tecnología', icon: '💻' }
  ];

  async ngOnInit() {
    this.comesFrom = this.route.snapshot.paramMap.get('prioritization')!;
    this.project = this.projectService.currentProject
    if (!this.project()) {
      const projectId = this.route.snapshot.paramMap.get('id');
      if (!projectId) {
        this.router.navigate(['/dashboard'])
        return
      };
      this.project = await this.projectService.getProjectInfo(projectId)
      if (!this.project()) {
        this.router.navigate(['/dashboard'])
        return
      }
    }
    this.route.queryParams.subscribe(params => {
      this.risk = this.project()!.sprints.find(s => s.id === params['sprint'])?.risks.find(r => r.id === params['risk'])!
    })

    const ownerEmail = await this.authService.getUserEmailById(this.project()!.owner);
    this.teamMembers.push(ownerEmail)
    for (const memberEmail of this.project()?.members!) {
      if (await this.authService.userExists(memberEmail)){
        this.teamMembers.push(memberEmail)
      }
    }

    this.initializeForm();
  }


  private initializeForm() {
    const automaticPriority = this.calculateAutomaticPriority();
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const defaultEndDate = nextMonth.toISOString().split('T')[0];

    this.mitigationForm = this.fb.group({
      actionType: ['preventive', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10)]],
      objective: ['', [Validators.required, Validators.minLength(5)]],
      responsible: ['', Validators.required],
      requiredResources: [[], Validators.required],
      startDate: [today, Validators.required],
      endDate: [defaultEndDate, Validators.required],
      status: ['pending', Validators.required],
      priority: [automaticPriority, Validators.required]
    });
  }

  // TODO: Fix this method for quantitative prioritization
  private calculateAutomaticPriority(): ActionPriority {
    if (!this.risk) return 'medium';

    const riskLevel = this.risk.impact! + this.risk.probability!;

    if (riskLevel >= 4) return 'high';
    if (riskLevel >= 2) return 'medium';
    return 'low';
  }

  // TODO: Fix this method for quantitative prioritization
  getRiskLevelClass(): string {
    const level = this.risk.impact! + this.risk.probability!;
    if (level >= 4) return 'bg-red-100 text-red-800 border-red-200';
    if (level >= 2) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  }

  // TODO: Fix this method for quantitative prioritization
  getRiskLevelText(): string {
    const level = this.risk.impact! + this.risk.probability!;
    if (level >= 4) return 'Crítico';
    if (level >= 2) return 'Alto';
    return 'Medio';
  }

  toggleResource(resource: string) {
    const currentResources = this.mitigationForm.get('requiredResources')?.value || [];
    const index = currentResources.indexOf(resource);

    if (index > -1) {
      currentResources.splice(index, 1);
    } else {
      currentResources.push(resource);
    }

    this.mitigationForm.patchValue({ requiredResources: currentResources });
  }

  isResourceSelected(resource: string): boolean {
    const currentResources = this.mitigationForm.get('requiredResources')?.value || [];
    return currentResources.includes(resource);
  }

  async onSubmit() {
    if (this.mitigationForm.invalid) {
      Object.keys(this.mitigationForm.controls).forEach(key => {
        this.mitigationForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting.set(true);

    try {
      const mitigationAction: MitigationAction = {
        riskId: this.risk.id,
        ...this.mitigationForm.value
      };

      // Aquí harías la llamada a tu servicio para guardar la acción de mitigación
      // await this.mitigationService.createAction(mitigationAction);

      console.log('Mitigation action to save:', mitigationAction);

      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Show toast success

      // Redirigir después de mostrar el mensaje
      // setTimeout(() => {
      //   this.router.navigate([`/projects/${this.project()!.id}/risks`]);
      // }, 2000);

    } catch (error) {
      console.error('Error saving mitigation action:', error);
      // Aquí mostrarías un toast de error
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onCancel() {
    this.router.navigate([`/projects/${this.project()!.id}/risks`]);
  }

  // Validación de fechas
  validateDates() {
    const startDate = this.mitigationForm.get('startDate')?.value;
    const endDate = this.mitigationForm.get('endDate')?.value;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      this.mitigationForm.get('endDate')?.setErrors({ invalidDate: true });
    }
  }

  // Helper methods para el template
  hasError(field: string): boolean {
    const control = this.mitigationForm.get(field);
    return !!(control && control.invalid && control.touched);
  }

  getErrorMessage(field: string): string {
    const control = this.mitigationForm.get(field);
    if (!control?.errors) return '';

    if (control.errors['required']) return 'Este campo es requerido';
    if (control.errors['minlength']) {
      return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
    }
    if (control.errors['invalidDate']) return 'La fecha de fin debe ser posterior a la de inicio';

    return 'Campo inválido';
  }

}
