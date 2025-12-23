import { Routes } from '@angular/router';
import { guestActionGuard } from '../../../auth/infrastructure/guest-action.guard';

export const PLAN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./plan-layout/plan-layout').then(m => m.PlanLayout),
    children: [
      {
        path: '',
        loadComponent: () => import('./plan-list/plan-list').then(m => m.PlanList)
      },
      {
        path: 'payment/:id',
        loadComponent: () => import('./plan-payment/plan-payment').then(m => m.PlanPayment),
        canActivate: [guestActionGuard]
      }
    ]
  }
];
