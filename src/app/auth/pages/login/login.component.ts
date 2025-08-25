import { Component } from '@angular/core';
import { UserLogin } from '../../interfaces/user.interface';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styles: '',
})
export class LoginComponent {
  user: UserLogin = {
    email: '',
    password: '',
  };
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: [''],
      password: [''],
    });
  }

  async onLogin() {
    let email = this.loginForm.value.email;
    let password = this.loginForm.value.password;
    let user: UserLogin = {
      email: email,
      password: password,
    };
    const response = await this.authService.login(user);
    if (response.success) {
      this.router.navigate(['/home']);
      return;
    }
    this.loginForm.setErrors({ invalidLogin: true });
  }
}
