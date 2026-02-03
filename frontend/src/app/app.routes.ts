import { Routes } from '@angular/router';
import { DashboardComponent } from './features/panels/dashboard/dashboard.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { PanelManagementComponent } from './features/panels/panel-management/panel-management.component';
import { PendingChecksComponent } from './features/panels/pending-checks/pending-checks.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'admin/panels', component: PanelManagementComponent, canActivate: [authGuard, adminGuard] },
  { path: 'admin/pending-checks', component: PendingChecksComponent, canActivate: [authGuard, adminGuard] },
  { path: '**', redirectTo: '' },
];
