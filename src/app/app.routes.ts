import { Routes } from '@angular/router';
import { LoginComponent } from './auth/pages/login/login.component';
import { SignupComponent } from './auth/pages/signup/signup.component';
import { DashboardComponent } from './main/pages/dashboard/dashboard.component';
import { ProjectComponent } from './main/pages/project/project.component';
import { TaxonomyComponent } from './main/pages/taxonomy/taxonomy.component';
import { PrioritizationMatrixComponent } from './main/pages/prioritization/prioritization-matrix.component';
import { PrioritizationListComponent } from './main/pages/prioritization-list/prioritization-list.component';

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
    path: 'project/:id/taxonomy',
    component: TaxonomyComponent
  },
  {
    path: 'project/:id/taxonomy',
    component: TaxonomyComponent
  },
  {
    path: 'project/:id/matrix',
    component: PrioritizationMatrixComponent
  },
  {
    path: 'project/:id/list',
    component: PrioritizationListComponent
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
