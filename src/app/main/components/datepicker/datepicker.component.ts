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
  selector: 'app-datepicker',
  imports: [ReactiveFormsModule, ToastComponent],
  templateUrl: './datepicker.component.html',
  styles: '',
})
export class DatepickerComponent {
  toast: ToastInterface = { show: false, title: '', message: '', type: 'info' }
  authService = inject(AuthService);
  @Output() close = new EventEmitter<void>();
  @Output() dateUpload = new EventEmitter<Date>();
  dateForm!: FormGroup;

  constructor(private fb: FormBuilder) {
    this.dateForm = this.fb.group({
      date: ['', Validators.required],
      time: ['', Validators.required],
    });
  }

  onUploadDate() {
    const date = this.dateForm.get('date')?.value
    const time = this.dateForm.get('time')?.value
    if (!time || !date){
      this.toast = { show:true, title: 'Ingresa los dos campos', message: '', timeout:1500, type: 'error' }
      return
    }
    const final = new Date(`${date}T${time}`)
    if (final > new Date()){
      this.close.emit()
      this.dateUpload.emit(final)
      return
    }
    this.toast = { show:true, title: 'Ingresa una fecha a partir de hoy', message: '', timeout:1500, type: 'error' }

  }
}
