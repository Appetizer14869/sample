import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import ModeResolve from './route/mode-routing-resolve.service';

const modeRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/mode.component').then(m => m.ModeComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/mode-detail.component').then(m => m.ModeDetailComponent),
    resolve: {
      mode: ModeResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/mode-update.component').then(m => m.ModeUpdateComponent),
    resolve: {
      mode: ModeResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/mode-update.component').then(m => m.ModeUpdateComponent),
    resolve: {
      mode: ModeResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default modeRoute;
