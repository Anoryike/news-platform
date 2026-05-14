import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Store } from '@ngrx/store';
import { ArticlesActions } from '../../../store/articles/articles.actions';
import { selectAllArticles, selectArticlesLoading, selectArticlesTotal } from '../../../store/articles/articles.selectors';
import { selectIsLoggedIn } from '../../../store/auth/auth.selectors';
import { CredibilityBadgeComponent } from '../../../shared/components/credibility-badge/credibility-badge.component';
import { ArticlesService } from '../../../core/services/articles.service';

@Component({
  selector: 'app-news-feed',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatProgressSpinnerModule, MatPaginatorModule, MatSelectModule,
    MatSnackBarModule, MatIconModule, CredibilityBadgeComponent,
  ],
  template: `
    <div class="feed-container">
      <div class="feed-header">
        <h1>Стрічка новин</h1>
        <div class="import-controls" *ngIf="isLoggedIn$ | async">
          <mat-select [(value)]="selectedCategory" style="width:160px; margin-right:8px">
            <mat-option value="general">Загальні</mat-option>
            <mat-option value="technology">Технології</mat-option>
            <mat-option value="science">Наука</mat-option>
            <mat-option value="health">Здоров'я</mat-option>
            <mat-option value="business">Бізнес</mat-option>
          </mat-select>
          <button mat-raised-button color="accent" (click)="importNews()" [disabled]="importing || reanalyzing">
            <mat-icon>cloud_download</mat-icon>
            {{ importing ? 'Імпортую...' : 'Імпорт новин' }}
          </button>
          <button mat-stroked-button color="warn" (click)="reanalyzeAll()" [disabled]="importing || reanalyzing" style="margin-left:8px">
            <mat-icon>refresh</mat-icon>
            {{ reanalyzing ? 'Запускаю...' : 'Переаналізувати все' }}
          </button>
        </div>
      </div>

      <mat-spinner *ngIf="loading$ | async" style="margin:40px auto"></mat-spinner>

      <div *ngFor="let article of articles$ | async" class="article-card">
        <mat-card>
          <img *ngIf="article.imageUrl" [src]="article.imageUrl" class="article-img" alt="">
          <mat-card-header>
            <mat-card-title>
              <a [routerLink]="['/articles', article.id]">{{ article.title }}</a>
            </mat-card-title>
            <mat-card-subtitle>
              {{ article.author.email }} · {{ article.createdAt | date:'dd.MM.yyyy HH:mm' }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ article.body | slice:0:200 }}...</p>
            <app-credibility-badge
              [score]="article.aiScore?.score ?? null"
              [explanation]="article.aiScore?.explanation ?? ''">
            </app-credibility-badge>
          </mat-card-content>
          <mat-card-actions>
            <a mat-button color="primary" [routerLink]="['/articles', article.id]">Читати далі</a>
            <a mat-button *ngIf="article.sourceUrl" [href]="article.sourceUrl" target="_blank">
              Джерело
            </a>
          </mat-card-actions>
        </mat-card>
      </div>

      <mat-paginator
        [length]="total$ | async"
        [pageSize]="20"
        (page)="onPage($event)">
      </mat-paginator>
    </div>
  `,
  styles: [`
    .feed-container { max-width:800px; margin:24px auto; padding:0 16px; }
    .feed-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:8px; }
    .import-controls { display:flex; align-items:center; }
    .article-card { margin-bottom:16px; }
    .article-img { width:100%; max-height:220px; object-fit:cover; border-radius:4px 4px 0 0; display:block; }
    a { text-decoration:none; }
  `],
})
export class NewsFeedComponent implements OnInit {
  articles$ = this.store.select(selectAllArticles);
  loading$ = this.store.select(selectArticlesLoading);
  total$ = this.store.select(selectArticlesTotal);
  isLoggedIn$ = this.store.select(selectIsLoggedIn);

  selectedCategory = 'general';
  importing = false;
  reanalyzing = false;

  constructor(
    private store: Store,
    private articlesService: ArticlesService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.store.dispatch(ArticlesActions.loadFeed({ page: 1 }));
  }

  onPage(e: PageEvent): void {
    this.store.dispatch(ArticlesActions.loadFeed({ page: e.pageIndex + 1 }));
  }

  reanalyzeAll(): void {
    this.reanalyzing = true;
    this.articlesService.reanalyzeAll().subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'OK', { duration: 4000 });
        this.reanalyzing = false;
        setTimeout(() => this.store.dispatch(ArticlesActions.loadFeed({ page: 1 })), 3000);
      },
      error: () => {
        this.snackBar.open('Помилка', 'OK', { duration: 3000 });
        this.reanalyzing = false;
      },
    });
  }

  importNews(): void {
    this.importing = true;
    this.articlesService.importNews(this.selectedCategory).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'OK', { duration: 4000 });
        this.store.dispatch(ArticlesActions.loadFeed({ page: 1 }));
        this.importing = false;
      },
      error: () => {
        this.snackBar.open('Помилка імпорту', 'OK', { duration: 3000 });
        this.importing = false;
      },
    });
  }
}
