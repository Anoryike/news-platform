import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ArticlesActions } from './articles.actions';
import { ArticlesService } from '../../core/services/articles.service';

@Injectable()
export class ArticlesEffects {
  loadFeed$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ArticlesActions.loadFeed),
      switchMap(({ page }) =>
        this.articlesService.getAll(page).pipe(
          map((res) => ArticlesActions.loadFeedSuccess({ articles: res.data, total: res.total })),
          catchError((err) => of(ArticlesActions.loadFeedFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  loadArticle$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ArticlesActions.loadArticle),
      switchMap(({ id }) =>
        this.articlesService.getOne(id).pipe(
          map((article) => ArticlesActions.loadArticleSuccess({ article })),
          catchError((err) => of(ArticlesActions.loadArticleFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  publish$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ArticlesActions.publishArticle),
      switchMap(({ title, body }) =>
        this.articlesService.create(title, body).pipe(
          map((article) => ArticlesActions.publishArticleSuccess({ article })),
          catchError((err) => of(ArticlesActions.publishArticleFailure({ error: err.error?.message ?? 'Publish failed' }))),
        ),
      ),
    ),
  );

  redirectAfterPublish$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ArticlesActions.publishArticleSuccess),
        tap(({ article }) => this.router.navigate(['/articles', article.id])),
      ),
    { dispatch: false },
  );

  constructor(
    private actions$: Actions,
    private articlesService: ArticlesService,
    private router: Router,
  ) {}
}
