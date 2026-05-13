import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Store } from '@ngrx/store';
import { ArticlesActions } from '../../../store/articles/articles.actions';
import { selectAllArticles, selectArticlesLoading, selectArticlesTotal } from '../../../store/articles/articles.selectors';
import { CredibilityBadgeComponent } from '../../../shared/components/credibility-badge/credibility-badge.component';

@Component({
  selector: 'app-news-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule,
    MatProgressSpinnerModule, MatPaginatorModule, CredibilityBadgeComponent],
  template: `
    <div class="feed-container">
      <h1>Стрічка новин</h1>
      <mat-spinner *ngIf="loading$ | async" style="margin:40px auto"></mat-spinner>
      <div *ngFor="let article of articles$ | async" class="article-card">
        <mat-card>
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
    .article-card { margin-bottom:16px; }
    a { text-decoration:none; }
  `],
})
export class NewsFeedComponent implements OnInit {
  articles$ = this.store.select(selectAllArticles);
  loading$ = this.store.select(selectArticlesLoading);
  total$ = this.store.select(selectArticlesTotal);

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.store.dispatch(ArticlesActions.loadFeed({ page: 1 }));
  }

  onPage(e: PageEvent): void {
    this.store.dispatch(ArticlesActions.loadFeed({ page: e.pageIndex + 1 }));
  }
}
