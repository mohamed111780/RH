import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import {EspaceAdminComponent} from "./components/Admin/espace-admin/espace-admin.component";
import {EspaceEmployeComponent} from "./components/employe/espace-employe/espace-employe.component";
import {EspaceRhComponent} from "./components/rh/espace-rh/espace-rh.component";import { OfferDetailComponent } from './components/home/offer-detail/offer-detail.component';
import { ApplyFormComponent } from './components/home/apply-form/apply-form.component';

export const routes: Routes = [

  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: HomeComponent },

  { path: 'login', component: HomeComponent, data: { authModal: 'login' } },

  { path: 'reset', component: HomeComponent, data: { authModal: 'reset' } },

  // EMPLOYE
  {
    path: 'dashboard',
    component: EspaceEmployeComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'EMPLOYE' }
  },

  //  RH
  {
    path: 'rh/dashboard',
    component: EspaceRhComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'RH' }
  },
  {
    path: 'rh/espace',
    component: EspaceRhComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'RH' }
  },
  {
    path: 'admin/dashboard',
    component: EspaceAdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { role: 'ADMIN' }
  },
  { path: 'offre/:id', component: OfferDetailComponent },
  { path: 'postuler/:id', component: ApplyFormComponent },

  { path: '**', redirectTo: 'home' }

];
