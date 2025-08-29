import { Component } from '@angular/core';
import { UserRegister } from '../../interfaces/user.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-signup',
    imports: [ReactiveFormsModule],
    templateUrl: './signup.component.html',
    styles: ''
})
export class SignupComponent {
  user: UserRegister = {
    name: '',
    email: '',
    password: '',
  };
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    authService.signOut()
    this.registerForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(50),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  async onSubmit() {
    let name = this.registerForm.value.name;
    let email = this.registerForm.value.email;
    let password = this.registerForm.value.password;
    let confirmPassword = this.registerForm.value.confirmPassword;

    if (this.registerForm.controls['email'].errors?.['email']) {
      this.registerForm.setErrors({ invalidEmail: true });
      return;
    }

    if (password !== confirmPassword) {
      this.registerForm.setErrors({ passwordMismatch: true });
      return;
    }

    if (this.registerForm.controls['password'].errors?.['pattern']) {
      this.registerForm.setErrors({ weakPassword: true });
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.setErrors({ invalid: true });
      return;
    }

    let user: UserRegister = {
      name: name,
      email: email,
      password: password,
    };
    const response = await this.authService.register(user);
    if (response.success) {
      this.router.navigate(['/home']);
      return;
    }
    this.registerForm.setErrors({ invalidRegister: response.message });
  }
}
