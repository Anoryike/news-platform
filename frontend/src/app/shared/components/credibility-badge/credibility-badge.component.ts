import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-credibility-badge',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatTooltipModule],
  template: `
    <div *ngIf="score !== null" class="badge-container">
      <div class="score-circle" [style.background]="color">
        {{ score | number:'1.0-0' }}
      </div>
      <div class="score-label">
        <strong>Достовірність</strong>
        <span [style.color]="color">{{ label }}</span>
        <small *ngIf="explanation" [matTooltip]="explanation">{{ explanation | slice:0:80 }}...</small>
      </div>
    </div>
    <div *ngIf="score === null" class="pending">
      <em>AI-аналіз виконується...</em>
    </div>
  `,
  styles: [`
    .badge-container { display:flex; align-items:center; gap:12px; padding:12px; background:#f5f5f5; border-radius:8px; }
    .score-circle { width:56px; height:56px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-size:1.2rem; font-weight:bold; flex-shrink:0; }
    .score-label { display:flex; flex-direction:column; gap:2px; }
    .score-label strong { font-size:.85rem; color:#555; }
    .score-label span { font-size:1rem; font-weight:600; }
    .score-label small { font-size:.75rem; color:#888; cursor:help; }
    .pending { color:#888; font-style:italic; padding:8px; }
  `],
})
export class CredibilityBadgeComponent {
  @Input() score: number | null = null;
  @Input() explanation: string = '';

  get color(): string {
    if (this.score === null) return '#9e9e9e';
    if (this.score >= 75) return '#4caf50';
    if (this.score >= 50) return '#ff9800';
    return '#f44336';
  }

  get label(): string {
    if (this.score === null) return '—';
    if (this.score >= 75) return 'Достовірна';
    if (this.score >= 50) return 'Сумнівна';
    return 'Недостовірна';
  }
}
