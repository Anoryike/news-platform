import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Store } from '@ngrx/store';
import { ArticlesActions } from '../../../store/articles/articles.actions';
import { selectPublishing } from '../../../store/articles/articles.selectors';

@Component({
  selector: 'app-publish',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatFormFieldModule,
    MatInputModule, MatButtonModule, MatProgressSpinnerModule],
  template: `
    <div class="publish-container">
      <mat-card>
        <mat-card-header><mat-card-title>Опублікувати статтю</mat-card-title></mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Заголовок</mat-label>
              <input matInput formControlName="title" placeholder="Введіть заголовок..." />
              <mat-error *ngIf="form.get('title')?.hasError('minlength')">Мінімум 5 символів</mat-error>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Текст статті</mat-label>
              <textarea matInput formControlName="body" rows="12"
                placeholder="Введіть текст статті (мін. 50 символів)..."></textarea>
              <mat-error *ngIf="form.get('body')?.hasError('minlength')">Мінімум 50 символів</mat-error>
            </mat-form-field>
            <p class="hint">Після публікації AI автоматично проаналізує достовірність тексту.</p>
            <button mat-raised-button color="primary" type="submit"
              [disabled]="form.invalid || (publishing$ | async)" class="full-width">
              <mat-spinner *ngIf="publishing$ | async" diameter="20" style="display:inline-block;margin-right:8px"></mat-spinner>
              Опублікувати
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .publish-container { max-width:700px; margin:24px auto; padding:0 16px; }
    .full-width { width:100%; display:block; margin-bottom:16px; }
    .hint { color:#888; font-size:.85rem; margin-bottom:12px; }
  `],
})
export class PublishComponent {
  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    body: ['', [Validators.required, Validators.minLength(50)]],
  });

  publishing$ = this.store.select(selectPublishing);

  constructor(private fb: FormBuilder, private store: Store) {}

  submit(): void {
    if (this.form.valid) {
      const { title, body } = this.form.value;
      this.store.dispatch(ArticlesActions.publishArticle({ title: title!, body: body! }));
    }
  }
}
