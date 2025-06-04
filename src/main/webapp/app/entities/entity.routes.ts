import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'sampleApp.adminAuthority.home.title' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'mode',
    data: { pageTitle: 'sampleApp.mode.home.title' },
    loadChildren: () => import('./mode/mode.routes'),
  },
  {
    path: 'post',
    data: { pageTitle: 'sampleApp.post.home.title' },
    loadChildren: () => import('./post/post.routes'),
  },
  {
    path: 'tag',
    data: { pageTitle: 'sampleApp.tag.home.title' },
    loadChildren: () => import('./tag/tag.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
