import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ArticlesActions } from '../../../store/articles/articles.actions';
import { selectSelectedArticle, selectArticlesLoading } from '../../../store/articles/articles.selectors';
import { WebsocketService } from '../../../core/services/websocket.service';
import { CredibilityBadgeComponent } from '../../../shared/components/credibility-badge/credibility-badge.component';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatProgressSpinnerModule,
    MatDividerModule, CredibilityBadgeComponent],
  template: `
    <div class="detail-container">
      <mat-spinner *ngIf="loading$ | async" style="margin:40px auto"></mat-spinner>
      <ng-container *ngIf="article$ | async as article">
        <mat-card>
          <mat-card-header>
            <mat-card-title>{{ article.title }}</mat-card-title>
            <mat-card-subtitle>
              {{ article.author.email }} · {{ article.createdAt | date:'dd.MM.yyyy HH:mm' }}
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <app-credibility-badge
              [score]="article.aiScore?.score ?? null"
              [explanation]="article.aiScore?.explanation ?? ''">
            </app-credibility-badge>
            <mat-divider style="margin:16px 0"></mat-divider>
            <p class="body-text">{{ article.body }}</p>
          </mat-card-content>
        </mat-card>
      </ng-container>
    </div>
  `,
  styles: [`
    .detail-container { max-width:800px; margin:24px auto; padding:0 16px; }
    .body-text { white-space:pre-wrap; line-height:1.7; font-size:1rem; }
  `],
})
export class ArticleDetailComponent implements OnInit, OnDestroy {
  article$ = this.store.select(selectSelectedArticle);
  loading$ = this.store.select(selectArticlesLoading);

  private wsSub?: Subscription;
  private articleId!: number;

  constructor(
    private route: ActivatedRoute,
    private store: Store,
    private ws: WebsocketService,
  ) {}

  ngOnInit(): void {
    this.articleId = Number(this.route.snapshot.paramMap.get('id'));
    this.store.dispatch(ArticlesActions.loadArticle({ id: this.articleId }));

    // Listen for real-time score update via WebSocket
    this.wsSub = this.ws.onScoreUpdate(this.articleId).subscribe(({ score, explanation }) => {
      this.store.dispatch(ArticlesActions.scoreUpdated({ articleId: this.articleId, score, explanation }));
    });
  }

  ngOnDestroy(): void {
    this.wsSub?.unsubscribe();
  }
}
