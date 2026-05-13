import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'feed', pathMatch: 'full' },
  {
    path: 'feed',
    loadComponent: () =>
      import('./features/articles/news-feed/news-feed.component').then((m) => m.NewsFeedComponent),
  },
  {
    path: 'articles/publish',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/articles/publish/publish.component').then((m) => m.PublishComponent),
  },
  {
    path: 'articles/:id',
    loadComponent: () =>
      import('./features/articles/article-detail/article-detail.component').then((m) => m.ArticleDetailComponent),
  },
  {
    path: 'auth/login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
];
