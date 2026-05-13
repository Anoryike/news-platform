import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { Store } from '@ngrx/store';
import { selectIsLoggedIn, selectUser } from '../../../store/auth/auth.selectors';
import { AuthActions } from '../../../store/auth/auth.actions';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule],
  template: `
    <mat-toolbar color="primary">
      <a routerLink="/" style="color:white;text-decoration:none;font-weight:bold">NewsVerify</a>
      <span style="flex:1"></span>
      <ng-container *ngIf="isLoggedIn$ | async; else guestLinks">
        <a mat-button routerLink="/articles/publish" style="color:white">Опублікувати</a>
        <button mat-button style="color:white" (click)="logout()">Вийти</button>
      </ng-container>
      <ng-template #guestLinks>
        <a mat-button routerLink="/auth/login" style="color:white">Увійти</a>
        <a mat-button routerLink="/auth/register" style="color:white">Реєстрація</a>
      </ng-template>
    </mat-toolbar>
  `,
})
export class NavbarComponent {
  isLoggedIn$ = this.store.select(selectIsLoggedIn);
  user$ = this.store.select(selectUser);

  constructor(private store: Store) {}

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
