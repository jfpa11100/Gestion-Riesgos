import { Routes } from '@angular/router';
import { LoginComponent } from './auth/pages/login/login.component';
import { SignupComponent } from './auth/pages/signup/signup.component';
import { DashboardComponent } from './main/pages/dashboard/dashboard.component';
import { ProjectComponent } from './main/pages/project/project.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'signup',
    component: SignupComponent
  },
  {
    path: 'home',
    redirectTo: '/dashboard'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'project/:id',
    component: ProjectComponent
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
